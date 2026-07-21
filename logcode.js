/* ============================================================
   有機化学クイズ — 記録コード（オフライン回収方式）
   ------------------------------------------------------------
   サーバー不要。各生徒のブラウザに溜まった全ログ（名簿・累計・
   セッション・1問ごとのイベント）を、圧縮した1つの文字列
   （記録コード）に変換する。生徒はそれを先生に提出し、先生は
   「取り込む」で自分の端末の DB に復元 → 既存の「ログ閲覧／集計／
   エクスポート」タブでそのまま全員分を閲覧できる。

   コード形式:  ORGQUIZLOG:v1:<gzip+base64>   （通常）
               ORGQUIZLOG:r1:<base64>         （gzip非対応環境の代替）

   公開 API: window.OrgQuizLogCode
     exportForStudent(studentId) → Promise<string>   記録コードを生成
     importCode(codeString)      → Promise<summary>   DB へ取り込み
   ============================================================ */
(function (global) {
  'use strict';

  const DB = global.OrgQuizDB;
  const PREFIX = 'ORGQUIZLOG:';

  // ── base64 ⇄ bytes ─────────────────────────────
  function base64FromBytes(u8) {
    let bin = '';
    const CH = 0x8000;
    for (let i = 0; i < u8.length; i += CH) {
      bin += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
    }
    return btoa(bin);
  }
  function bytesFromBase64(b64) {
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }

  // ── gzip（CompressionStream。無い環境は素の base64 にフォールバック）──
  const hasGzip = (typeof global.CompressionStream === 'function' &&
                   typeof global.DecompressionStream === 'function');

  async function encodeString(str) {
    const bytes = new TextEncoder().encode(str);
    if (hasGzip) {
      const cs = new global.CompressionStream('gzip');
      const stream = new Blob([bytes]).stream().pipeThrough(cs);
      const buf = await new Response(stream).arrayBuffer();
      return PREFIX + 'v1:' + base64FromBytes(new Uint8Array(buf));
    }
    return PREFIX + 'r1:' + base64FromBytes(bytes);
  }

  async function decodeString(code) {
    const s = (code || '').trim();
    if (s.indexOf(PREFIX) !== 0) throw new Error('記録コードの形式ではありません');
    const rest = s.slice(PREFIX.length);
    const sep = rest.indexOf(':');
    const kind = rest.slice(0, sep);
    const b64 = rest.slice(sep + 1).replace(/\s+/g, '');
    const bytes = bytesFromBase64(b64);
    if (kind === 'v1') {
      if (!hasGzip) throw new Error('この端末は解凍(gzip)に未対応です。別ブラウザでお試しください');
      const ds = new global.DecompressionStream('gzip');
      const stream = new Blob([bytes]).stream().pipeThrough(ds);
      const buf = await new Response(stream).arrayBuffer();
      return new TextDecoder().decode(buf);
    }
    if (kind === 'r1') return new TextDecoder().decode(bytes);
    throw new Error('未知のコード種別です: ' + kind);
  }

  // ── 生徒側: 記録コードを生成 ───────────────────
  async function exportForStudent(studentId) {
    if (!DB) throw new Error('ストレージが利用できません');
    if (!studentId) throw new Error('生徒IDがありません');
    const roster = await DB.getStudent(studentId);
    const profile = await DB.getProfile(studentId);
    const sessions = (await DB.listSessionsByStudent(studentId)) || [];
    const events = [];
    for (const s of sessions) {
      const evs = (await DB.listEventsBySession(s.sessionId)) || [];
      for (const e of evs) events.push(e);
    }
    const pkg = {
      kind: 'orgquizlog', v: 1,
      studentId,
      exportedAt: new Date().toISOString(),
      roster: roster ? {
        id: roster.id, role: roster.role || 'student',
        grade: roster.grade, class: roster.class, number: roster.number,
        name: roster.name || '', initial: roster.initial || '',
      } : null,
      profile: profile || null,
      sessions,
      events,
    };
    return await encodeString(JSON.stringify(pkg));
  }

  // ── 先生側: 記録コードを取り込み（DB へ復元）──
  async function importCode(code) {
    if (!DB) throw new Error('ストレージが利用できません');
    const json = await decodeString(code);
    let pkg;
    try { pkg = JSON.parse(json); } catch (_) { throw new Error('コードの解析に失敗しました'); }
    if (!pkg || pkg.kind !== 'orgquizlog') throw new Error('記録コードではありません');

    // 名簿・累計プロファイル（上書き）
    if (pkg.roster && pkg.roster.id) await DB.upsertStudent(pkg.roster);
    if (pkg.profile && pkg.profile.studentId) await DB.upsertProfile(pkg.profile);

    // セッション（sessionId で上書き）
    for (const s of (pkg.sessions || [])) {
      if (s && s.sessionId) await DB.putSession(s);
    }
    // イベント（セッション単位で一旦消してから再投入＝再取り込みでも重複しない）
    const bySession = {};
    for (const e of (pkg.events || [])) {
      if (!e || !e.sessionId) continue;
      (bySession[e.sessionId] || (bySession[e.sessionId] = [])).push(e);
    }
    for (const sid of Object.keys(bySession)) {
      await DB.deleteEventsBySession(sid);
      for (const e of bySession[sid]) {
        const ev = Object.assign({}, e);
        delete ev.eventId;   // teacher 端末の自動採番に任せる（衝突防止）
        await DB.putEvent(ev);
      }
    }
    return {
      studentId: pkg.studentId || (pkg.roster && pkg.roster.id) || '(不明)',
      sessions: (pkg.sessions || []).length,
      events: (pkg.events || []).length,
      exportedAt: pkg.exportedAt || '',
    };
  }

  global.OrgQuizLogCode = { exportForStudent, importCode };
})(window);
