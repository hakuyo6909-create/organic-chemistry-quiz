/* ============================================================
   有機化学クイズ — イベントロガー / アイドル検知（Phase 4）
   ------------------------------------------------------------
   公開 API: window.OrgQuizLogger
     event(kind, payload)        汎用イベント記録
     modeEnter(modeName)         モード入場
     answer(payload)             回答イベント（warmup/std）
     dictView(molKey)            分子図鑑の閲覧
     labStart(material)          実験室の出発物質選択
     labReaction(payload)        実験室の反応選択
     labReset()                  実験室リセット
     labUndo()                   実験室1手戻す
     bumpDictView(molKey)        プロファイルの dictViewCounts++
     bumpLabel(label, correct)   プロファイルの byLabel を加算

   アイドル検知:
     15分（IDLE_LIMIT_MS）操作がなかったらセッション自動終了。
     操作 = click / keydown / touchstart のみカウント
     （マウス移動・スクロールは活動と見なさない）。
     終了時は endedAt を最終操作時刻に巻き戻す（累計水増し防止）。

   デモプレイ（role=demo）の場合は events 書込みもプロファイル更新も
   スキップする（OrgQuizSession.isDemo() で判定）。
   ============================================================ */
(function (global) {
  'use strict';

  const DB = global.OrgQuizDB;
  const Sess = () => global.OrgQuizSession;

  const IDLE_LIMIT_MS = 15 * 60 * 1000;     // 15分
  const IDLE_CHECK_MS = 30 * 1000;          // 30秒間隔でチェック

  let lastActivityAt = Date.now();
  let idleTimer = null;
  let mruDictBuffer = {};   // 分子閲覧の集計バッファ（セッション内）
  let mruLabelBuffer = {};  // ラベル別正答集計バッファ（セッション内）

  // ── 汎用イベント書込み ─────────────────────────
  // 生徒（role=student）のみ記録対象。デモ・教員はスキップ。
  async function event(kind, payload) {
    touchActivity();
    const sess = Sess();
    if (!sess || !sess.isStudent()) return;
    const sessionId = sess.getSessionId();
    const user = sess.getUser();
    if (!sessionId || !user) return;
    const ev = {
      sessionId,
      studentId: user.id,
      t: new Date().toISOString(),
      kind,
      ...(payload || {}),
    };
    try { await DB.putEvent(ev); }
    catch (e) { console.warn('[logger] putEvent failed:', e); }
  }

  // ── 個別ヘルパー ───────────────────────────────
  function modeEnter(modeName) {
    return event('modeEnter', { mode: modeName });
  }
  function answer(payload) {
    // payload: { mode, qid, label, given, correct, ms }
    bumpLabel(payload && payload.label, !!(payload && payload.correct));
    return event('answer', payload || {});
  }
  function dictView(molKey, molName) {
    bumpDictView(molKey);
    return event('dictView', { molKey, molName });
  }
  function labStart(material) {
    return event('labStart', { material });
  }
  function labReaction(payload) {
    // payload: { reactionId, reactionName, fromMol, toMol, coReact }
    return event('labReaction', payload || {});
  }
  function labReset() { return event('labReset', {}); }
  function labUndo()  { return event('labUndo',  {}); }

  // ── プロファイル集計（セッション内バッファ → endSession で確定）──
  function bumpDictView(molKey) {
    if (!molKey) return;
    const sess = Sess();
    if (!sess || !sess.isStudent()) return;
    mruDictBuffer[molKey] = (mruDictBuffer[molKey] || 0) + 1;
  }
  function bumpLabel(label, correct) {
    if (!label) return;
    const sess = Sess();
    if (!sess || !sess.isStudent()) return;
    const slot = mruLabelBuffer[label] || (mruLabelBuffer[label] = { asked: 0, correct: 0 });
    slot.asked++;
    if (correct) slot.correct++;
  }

  // ── プロファイルへ書き戻し（セッション終了時に呼ぶ）──
  async function flushToProfile(studentId) {
    if (!studentId) return;
    if (!Object.keys(mruDictBuffer).length && !Object.keys(mruLabelBuffer).length) return;
    try {
      const prof = (await DB.getProfile(studentId)) || {
        studentId,
        totalUsageMs: 0, sessionCount: 0,
        byLabel: {}, dictViewCounts: {},
      };
      prof.byLabel = prof.byLabel || {};
      prof.dictViewCounts = prof.dictViewCounts || {};
      for (const k in mruLabelBuffer) {
        const cur = prof.byLabel[k] || { asked: 0, correct: 0 };
        cur.asked   += mruLabelBuffer[k].asked;
        cur.correct += mruLabelBuffer[k].correct;
        prof.byLabel[k] = cur;
      }
      for (const k in mruDictBuffer) {
        prof.dictViewCounts[k] = (prof.dictViewCounts[k] || 0) + mruDictBuffer[k];
      }
      await DB.upsertProfile(prof);
    } catch (e) {
      console.warn('[logger] flushToProfile failed:', e);
    } finally {
      mruDictBuffer = {};
      mruLabelBuffer = {};
    }
  }
  function discardBuffers() {
    mruDictBuffer = {};
    mruLabelBuffer = {};
  }

  // ── アイドル検知 ───────────────────────────────
  function touchActivity() {
    lastActivityAt = Date.now();
  }
  function lastActivity() { return lastActivityAt; }

  function startIdleTimer() {
    stopIdleTimer();
    lastActivityAt = Date.now();
    idleTimer = setInterval(checkIdle, IDLE_CHECK_MS);
  }
  function stopIdleTimer() {
    if (idleTimer) { clearInterval(idleTimer); idleTimer = null; }
  }
  async function checkIdle() {
    const sess = Sess();
    if (!sess || !sess.isLoggedIn()) { stopIdleTimer(); return; }
    // デモ・教員はアイドルタイムアウト対象外
    if (!sess.isStudent()) return;
    const idle = Date.now() - lastActivityAt;
    if (idle >= IDLE_LIMIT_MS) {
      stopIdleTimer();
      try { await sess.autoEnd && sess.autoEnd(lastActivityAt); }
      catch (_) { /* fallback: 通常 logout */ try { await sess.logout(); } catch (_) {} }
    }
  }

  // ── ドキュメント全体の活動監視（軽量・パッシブ）──
  function bindActivityListeners() {
    const opts = { passive: true, capture: true };
    document.addEventListener('click',      touchActivity, opts);
    document.addEventListener('keydown',    touchActivity, opts);
    document.addEventListener('touchstart', touchActivity, opts);
  }

  // ── DOM パッシブフック（既存 app.js を改変せず拾う）──
  function bindAppHooks() {
    // モード切替
    document.addEventListener('click', (ev) => {
      const card = ev.target.closest('.mode-card[data-mode]');
      if (card) modeEnter(card.dataset.mode);
    }, { capture: true });

    // 実験室の主要ボタン
    document.addEventListener('click', (ev) => {
      const t = ev.target.closest('button');
      if (!t) return;
      switch (t.id) {
        case 'labResetBtn':         return labReset();
        case 'labUndoBtn':          return labUndo();
        case 'storyResetBtn':       return labReset();
        case 'storyUndoBtn':        return labUndo();
      }
    }, { capture: true });

    // 分子図鑑の詳細モーダルが開く瞬間（属性監視）
    const modal = document.getElementById('dictDetailModal');
    if (modal && 'MutationObserver' in window) {
      const mo = new MutationObserver(() => {
        const titleEl = document.getElementById('dictDetailTitle');
        const isOpen = !modal.hasAttribute('hidden');
        if (isOpen && titleEl) {
          const name = titleEl.textContent || '';
          if (name && name !== '分子の詳細') dictView(name, name);
        }
      });
      mo.observe(modal, { attributes: true, attributeFilter: ['hidden'] });
    }
  }

  // ── 公開 ──────────────────────────────────────
  global.OrgQuizLogger = {
    event,
    modeEnter, answer, dictView,
    labStart, labReaction, labReset, labUndo,
    bumpDictView, bumpLabel,
    flushToProfile, discardBuffers,
    touchActivity, lastActivity,
    startIdleTimer, stopIdleTimer,
    IDLE_LIMIT_MS,
  };

  function setup() {
    bindActivityListeners();
    bindAppHooks();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})(window);
