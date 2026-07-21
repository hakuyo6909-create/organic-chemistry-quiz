/* ============================================================
   有機化学クイズ — ログのクラウド送信（オフライン耐性つき）
   ------------------------------------------------------------
   ・生徒端末で発生したログ（イベント／セッション）を localStorage の
     アウトボックスに溜め、一定間隔で Google Apps Script(GAS) へ送信する。
   ・オフライン時・送信失敗時は溜めたまま保持し、次回オンライン時に再送。
   ・各行に uid を付け、GAS 側で重複排除するので二重送信されても安全。
   ・sync_config.js の url が空なら完全に無効（何もしない）。

   公開 API: window.OrgQuizSync
     configured()          … 送信先URLが設定されているか
     enqueueEvent(ev)      … イベントログを送信キューに追加
     enqueueSession(s)     … セッション記録を送信キューに追加
     flush()               … 手動フラッシュ（通常は自動）
   ============================================================ */
(function (global) {
  'use strict';

  const CFG = global.ORGQUIZ_SYNC || {};
  const URL_ = (CFG.url || '').trim();
  const SECRET = CFG.secret || '';

  const OUTBOX_KEY = 'orgquiz_sync_outbox_v1';
  const MAX_ROWS = 3000;          // アウトボックス上限（超えたら古い順に破棄）
  const FLUSH_INTERVAL_MS = 20000; // 定期フラッシュ間隔
  const DEBOUNCE_MS = 4000;        // enqueue 後のまとめ送信までの猶予
  const BATCH = 100;               // 1回の送信で送る最大行数

  let _timer = null;
  let _debounce = null;
  let _sending = false;
  let _seq = 0;

  function configured() { return URL_.length > 0; }

  // ── アウトボックス I/O ─────────────────────────
  function readOutbox() {
    try { return JSON.parse(global.localStorage.getItem(OUTBOX_KEY) || '[]'); }
    catch (_) { return []; }
  }
  function writeOutbox(rows) {
    try { global.localStorage.setItem(OUTBOX_KEY, JSON.stringify(rows)); }
    catch (_) { /* 容量超過等は無視 */ }
  }

  function makeUid(row) {
    _seq = (_seq + 1) % 1e6;
    const sid = row.studentId || 'x';
    const ss = row.sessionId || 'x';
    // 端末内で一意になれば十分（GAS 側 uid 重複排除のキー）
    return `${sid}-${ss}-${row.t || ''}-${row.kind || row.type}-${_seq}`;
  }

  function push(row) {
    if (!configured()) return; // 送信先未設定なら溜めない（肥大化防止）
    row.uid = row.uid || makeUid(row);
    const rows = readOutbox();
    rows.push(row);
    // 上限超過は古い順に捨てる
    if (rows.length > MAX_ROWS) rows.splice(0, rows.length - MAX_ROWS);
    writeOutbox(rows);
    scheduleFlush();
  }

  // ── 公開: キュー追加 ───────────────────────────
  function enqueueEvent(ev) {
    if (!ev || !configured()) return;
    // 既知フィールドを列に、それ以外は extra(JSON) にまとめる
    const known = ['sessionId', 'studentId', 't', 'kind', 'mode', 'qid', 'label', 'given', 'correct', 'ms'];
    const extra = {};
    for (const k in ev) if (!known.includes(k)) extra[k] = ev[k];
    push({
      type: 'event',
      t: ev.t || new Date().toISOString(),
      studentId: ev.studentId || '',
      sessionId: ev.sessionId || '',
      kind: ev.kind || '',
      mode: ev.mode ?? '',
      qid: ev.qid ?? '',
      label: ev.label ?? '',
      given: ev.given ?? '',
      correct: (typeof ev.correct === 'boolean') ? ev.correct : '',
      ms: ev.ms ?? '',
      extra: Object.keys(extra).length ? JSON.stringify(extra) : '',
    });
  }

  function enqueueSession(s) {
    if (!s || !configured()) return;
    push({
      type: 'session',
      t: s.endedAt || s.startedAt || new Date().toISOString(),
      studentId: s.studentId || '',
      sessionId: s.sessionId || '',
      startedAt: s.startedAt || '',
      endedAt: s.endedAt || '',
      durationMs: s.durationMs ?? '',
      autoEnded: (typeof s.autoEnded === 'boolean') ? s.autoEnded : '',
    });
  }

  // ── フラッシュ（送信） ─────────────────────────
  function scheduleFlush() {
    if (_debounce) return;
    _debounce = setTimeout(() => { _debounce = null; flush(); }, DEBOUNCE_MS);
  }

  async function flush() {
    if (!configured() || _sending) return;
    const all = readOutbox();
    if (all.length === 0) return;
    if (!global.navigator || global.navigator.onLine === false) return; // 明示的オフラインは送らない
    _sending = true;
    try {
      const batch = all.slice(0, BATCH);
      const body = JSON.stringify({ secret: SECRET, rows: batch });
      // text/plain にすることで CORS プリフライトを避ける（GAS の doPost は contents を読む）
      const resp = await fetch(URL_, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
        redirect: 'follow',
      });
      let ok = resp.ok;
      try { const j = await resp.json(); ok = ok && j && j.ok !== false; } catch (_) { /* 読めなくても200なら成功扱い */ }
      if (ok) {
        // 送信できた分を uid でアウトボックスから除去
        const sentUids = new Set(batch.map(r => r.uid));
        const remain = readOutbox().filter(r => !sentUids.has(r.uid));
        writeOutbox(remain);
        // まだ残っていれば続けて送る
        if (remain.length > 0) setTimeout(flush, 500);
      }
    } catch (_) {
      // ネットワーク不通など。溜めたまま次回に再送。
    } finally {
      _sending = false;
    }
  }

  // ── ページ離脱時の best-effort 送信（sendBeacon） ──
  function beaconFlush() {
    if (!configured()) return;
    const rows = readOutbox();
    if (rows.length === 0) return;
    try {
      if (global.navigator && typeof global.navigator.sendBeacon === 'function') {
        const blob = new Blob([JSON.stringify({ secret: SECRET, rows: rows.slice(0, MAX_ROWS) })],
          { type: 'text/plain;charset=utf-8' });
        // 成功可否は確認できないが、GAS 側 uid 重複排除で二重登録は防がれる
        global.navigator.sendBeacon(URL_, blob);
      }
    } catch (_) { /* noop */ }
  }

  // ── 初期化 ─────────────────────────────────────
  function setup() {
    if (!configured()) return; // 未設定なら何もしない（完全オフライン動作）
    _timer = setInterval(flush, FLUSH_INTERVAL_MS);
    // オンライン復帰時に即フラッシュ
    global.addEventListener('online', flush);
    // 離脱時に取りこぼしを送る
    global.addEventListener('pagehide', beaconFlush);
    global.addEventListener('visibilitychange', () => {
      if (global.document && global.document.visibilityState === 'hidden') beaconFlush();
    });
    // 起動直後に前回分を送る
    setTimeout(flush, 3000);
  }

  global.OrgQuizSync = { configured, enqueueEvent, enqueueSession, flush };

  if (global.document && global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})(window);
