/* ============================================================
   有機化学クイズ — ログイン UI / セッション管理（Phase 2）
   ------------------------------------------------------------
   - ページ読込時にログインオーバーレイを表示し、認証されるまで
     アプリ本体（モード選択・各モード）を操作不能にする。
   - ログイン成功で IndexedDB の sessions ストアに新規レコード
     開始。ログアウト時に endedAt を書込み（events 等の詳細
     ロギングは Phase 4）。
   - 名簿が空の場合は「初期設定：教員アカウント作成」モーダルを
     表示するブートストラップフローを提供。
   ============================================================ */
(function (global) {
  'use strict';

  const Auth = global.OrgQuizAuth;
  const DB = global.OrgQuizDB;

  // ── 現在のユーザー状態 ─────────────────────────
  const state = {
    user: null,         // { id, role, name, ... } or null
    sessionId: null,    // 現在のセッションID（demo は null）
    startedAt: null,
  };

  // ── DOM 取得（DOMContentLoaded 後に setup() で確定）──
  let el = {};

  // ── ULID 風セッションID（時系列ソートできれば十分）──
  function makeSessionId() {
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2, 10);
    return `s_${t}_${r}`;
  }

  // ── エラー表示 ─────────────────────────────────
  function showLoginError(msg) {
    if (!el.loginError) return;
    el.loginError.textContent = msg;
    el.loginError.hidden = false;
  }
  function hideLoginError() {
    if (!el.loginError) return;
    el.loginError.hidden = true;
    el.loginError.textContent = '';
  }

  // ── ヘッダー更新 ───────────────────────────────
  function renderHeader() {
    if (!el.authStatus) return;
    if (!state.user) {
      el.authStatus.hidden = true;
      return;
    }
    el.authStatus.hidden = false;
    el.authUserId.textContent = state.user.id;
    el.authUserName.textContent = state.user.name || '';
    if (el.authTeacherBtn) {
      el.authTeacherBtn.hidden = (state.user.role !== 'teacher');
    }
    // 記録コード出力は生徒のみ（記録が残るのは student のため）
    if (el.authExportCodeBtn) {
      el.authExportCodeBtn.hidden = (state.user.role !== 'student');
    }
  }

  // ── 記録コード（生徒→先生の回収用）────────────
  async function showLogCode() {
    if (!el.logcodeOverlay || !global.OrgQuizLogCode) return;
    if (!state.user || state.user.role !== 'student') return;
    el.logcodeMsg.textContent = '';
    el.logcodeText.value = '記録コードを生成中…';
    el.logcodeOverlay.hidden = false;
    try {
      const code = await global.OrgQuizLogCode.exportForStudent(state.user.id);
      el.logcodeText.value = code;
      el.logcodeMsg.textContent = `長さ ${code.length.toLocaleString()} 文字。全部コピーして先生に提出してください。`;
    } catch (e) {
      el.logcodeText.value = '';
      el.logcodeMsg.textContent = 'エラー: ' + (e && e.message);
    }
  }
  function hideLogCode() { if (el.logcodeOverlay) el.logcodeOverlay.hidden = true; }
  async function copyLogCode() {
    if (!el.logcodeText.value) return;
    try {
      el.logcodeText.select();
      if (global.navigator && global.navigator.clipboard) {
        await global.navigator.clipboard.writeText(el.logcodeText.value);
      } else {
        global.document.execCommand('copy');
      }
      el.logcodeMsg.textContent = '✅ コピーしました。先生に貼り付けて提出してください。';
    } catch (_) {
      el.logcodeMsg.textContent = '手動でコピーしてください（Ctrl+A → Ctrl+C）。';
    }
  }
  function downloadLogCode() {
    if (!el.logcodeText.value || !state.user) return;
    const blob = new Blob([el.logcodeText.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `記録コード_${state.user.id}.txt`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  }

  // ── ログインオーバーレイ表示/非表示 ───────────
  async function showLogin() {
    if (!el.loginOverlay) return;
    el.loginOverlay.hidden = false;
    document.body.classList.add('is-locked');
    hideLoginError();
    if (el.loginIdInput) el.loginIdInput.value = '';
    if (el.loginPinInput) el.loginPinInput.value = '';
    if (el.loginPinRow) el.loginPinRow.hidden = true;

    // 名簿に教員がいるかチェック → いなければ初期設定ボタンを出す
    try {
      const all = await DB.listStudents();
      const hasTeacher = all.some(r => r.role === 'teacher');
      if (el.loginBootstrapBtn) el.loginBootstrapBtn.hidden = hasTeacher;
    } catch (_) {
      if (el.loginBootstrapBtn) el.loginBootstrapBtn.hidden = false;
    }

    setTimeout(() => { if (el.loginIdInput) el.loginIdInput.focus(); }, 50);
  }
  function hideLogin() {
    if (!el.loginOverlay) return;
    el.loginOverlay.hidden = true;
    document.body.classList.remove('is-locked');
  }

  // ── セッション開始/終了 ────────────────────────
  // 生徒（role=student）のみセッション記録。デモ・教員はメモリ上の開始時刻のみ。
  async function startSession(user) {
    if (user.role !== 'student') {
      state.sessionId = null;
      state.startedAt = new Date();
      return;
    }
    const sessionId = makeSessionId();
    const startedAt = new Date().toISOString();
    state.sessionId = sessionId;
    state.startedAt = new Date(startedAt);
    try {
      await DB.putSession({
        sessionId, studentId: user.id, role: user.role,
        startedAt, endedAt: null, durationMs: 0,
        mode: null, autoEnded: false,
      });
    } catch (err) {
      console.warn('[session] start failed:', err);
    }
  }
  async function endSession(opts) {
    if (!state.sessionId || !state.user) {
      state.sessionId = null;
      state.startedAt = null;
      return;
    }
    const autoEnded = !!(opts && opts.autoEnded);
    // autoEnded のときは最終活動時刻に巻き戻す（累計水増し防止）
    const endTs = (opts && typeof opts.endAtMs === 'number') ? opts.endAtMs : Date.now();
    const endedAt = new Date(endTs);
    const studentId = state.user.id;
    const startedAtMs = state.startedAt.getTime();
    const durationMs = Math.max(0, endedAt.getTime() - startedAtMs);

    // logger のプロファイルバッファを書き戻し（先に書く＝失敗しても累計は加算したい）
    if (global.OrgQuizLogger) {
      try { await global.OrgQuizLogger.flushToProfile(studentId); }
      catch (e) { console.warn('[session] flushToProfile failed:', e); }
    }
    try {
      const rec = await DB.getSession(state.sessionId);
      if (rec) {
        rec.endedAt = endedAt.toISOString();
        rec.durationMs = durationMs;
        rec.autoEnded = autoEnded;
        await DB.putSession(rec);
        // クラウド集約（設定時のみ。セッション要約を送信）
        if (global.OrgQuizSync) { try { global.OrgQuizSync.enqueueSession(rec); } catch (_) {} }
      }
      // プロファイル累計時間に加算
      const prof = (await DB.getProfile(studentId)) || {
        studentId,
        totalUsageMs: 0, sessionCount: 0,
        byLabel: {}, dictViewCounts: {},
      };
      prof.totalUsageMs = (prof.totalUsageMs || 0) + durationMs;
      prof.sessionCount = (prof.sessionCount || 0) + 1;
      prof.lastSeenAt = endedAt.toISOString();
      await DB.upsertProfile(prof);
    } catch (err) {
      console.warn('[session] end failed:', err);
    }
    state.sessionId = null;
    state.startedAt = null;
  }

  // ── ログイン処理 ───────────────────────────────
  async function attemptLogin() {
    hideLoginError();
    const raw = el.loginIdInput.value;
    const id = Auth.normalizeId(raw);
    if (!id) { showLoginError('ID を入力してください'); return; }
    if (!Auth.isValidIdFormat(id)) {
      showLoginError('ID の形式が正しくありません（例: 3101）');
      return;
    }
    // デモ
    if (Auth.isDemoId(id)) {
      await loginAsDemo();
      return;
    }
    // 名簿照合
    let rec;
    try { rec = await DB.getStudent(id); }
    catch (e) { showLoginError('データベースエラー: ' + (e && e.message)); return; }
    if (!rec) {
      showLoginError('この ID は登録されていません。教員に発行してもらってください。');
      return;
    }
    // 教員 → PIN 必須
    if (rec.role === 'teacher') {
      if (el.loginPinRow.hidden) {
        // PIN 行を表示して再入力を促す
        el.loginPinRow.hidden = false;
        setTimeout(() => el.loginPinInput.focus(), 50);
        showLoginError('教員アカウントです。PIN を入力してください。');
        return;
      }
      const pin = el.loginPinInput.value;
      if (!Auth.isValidPinFormat(pin)) {
        showLoginError('PIN は6桁の数字で入力してください。');
        return;
      }
      const hash = await Auth.hashPin(pin);
      if (!Auth.constantTimeEqual(hash, rec.pinHash || '')) {
        showLoginError('PIN が違います。');
        return;
      }
    }
    await commitLogin(rec);
  }

  async function loginAsDemo() {
    const demoUser = {
      id: Auth.DEMO_ID, role: 'demo', name: 'デモプレイ',
      grade: 0, classNo: 0, number: 0, initial: 'D',
    };
    state.user = demoUser;
    await startSession(demoUser);
    renderHeader();
    hideLogin();
    if (global.OrgQuizLogger) global.OrgQuizLogger.startIdleTimer();
    // デモは MRU 永続化しないので、念のためクリアして他生徒の履歴が残らないようにする
    if (global.OrgQuizAppHooks && global.OrgQuizAppHooks.clearLabMru) {
      global.OrgQuizAppHooks.clearLabMru();
    }
  }

  async function commitLogin(rec) {
    state.user = {
      id: rec.id, role: rec.role || 'student',
      name: rec.name || '',
      grade: rec.grade, classNo: rec.class, number: rec.number,
      initial: rec.initial,
    };
    await startSession(state.user);
    renderHeader();
    hideLogin();
    // アイドル検知は生徒のみ（教員・デモは無制限利用）
    if (state.user.role === 'student' && global.OrgQuizLogger) {
      global.OrgQuizLogger.startIdleTimer();
    }
    // Phase 6: 実験室の MRU を IndexedDB から復元（生徒のみ実体ロード、その他は空クリア）
    if (global.OrgQuizAppHooks && global.OrgQuizAppHooks.loadLabMruFromDB) {
      global.OrgQuizAppHooks.loadLabMruFromDB(state.user.id);
    }
  }

  // ── ログアウト処理 ─────────────────────────────
  async function logout() {
    if (global.OrgQuizLogger) global.OrgQuizLogger.stopIdleTimer();
    if (state.user && state.user.role === 'student') {
      await endSession({ autoEnded: false });
    } else if (global.OrgQuizLogger) {
      global.OrgQuizLogger.discardBuffers();
    }
    state.user = null;
    state.sessionId = null;
    state.startedAt = null;
    renderHeader();
    if (global.TeacherUI && global.TeacherUI.hide) global.TeacherUI.hide();
    // Phase 6: 別生徒の履歴が残らないよう MRU をクリア
    if (global.OrgQuizAppHooks && global.OrgQuizAppHooks.clearLabMru) {
      global.OrgQuizAppHooks.clearLabMru();
    }
    showLogin();
  }

  // ── アイドル自動終了（logger から呼ばれる）────
  // 生徒のみ呼ばれる（logger.checkIdle で role!=student はスキップされている）
  async function autoEnd(endAtMs) {
    if (!state.user) return;
    if (global.OrgQuizLogger) global.OrgQuizLogger.stopIdleTimer();
    if (state.user.role === 'student') {
      await endSession({ autoEnded: true, endAtMs });
    }
    state.user = null;
    state.sessionId = null;
    state.startedAt = null;
    renderHeader();
    if (global.TeacherUI && global.TeacherUI.hide) global.TeacherUI.hide();
    // Phase 6: 別生徒の履歴が残らないよう MRU をクリア
    if (global.OrgQuizAppHooks && global.OrgQuizAppHooks.clearLabMru) {
      global.OrgQuizAppHooks.clearLabMru();
    }
    // ログイン画面に戻す前に簡単な通知
    showLogin();
    setTimeout(() => {
      showLoginError('15分間操作がなかったため自動的にログアウトしました');
    }, 200);
  }

  // ── 教員モードボタン ───────────────────────────
  function openTeacherMode() {
    if (!state.user || state.user.role !== 'teacher') return;
    if (global.TeacherUI && global.TeacherUI.show) global.TeacherUI.show();
  }

  // ── 入力ハンドラ ───────────────────────────────
  function onIdInput() {
    if (!el.loginIdInput) return;
    const raw = el.loginIdInput.value;
    const norm = Auth.normalizeId(raw);
    if (norm !== raw) el.loginIdInput.value = norm;
    // 入力に応じて PIN 行を即時表示（教員IDパターンのとき）
    if (Auth.isValidTeacherIdFormat(norm)) {
      if (el.loginPinRow) el.loginPinRow.hidden = false;
    } else if (Auth.isValidStudentIdFormat(norm) || Auth.isDemoId(norm)) {
      if (el.loginPinRow) el.loginPinRow.hidden = true;
    }
  }
  function onIdKey(ev) {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      if (el.loginPinRow && !el.loginPinRow.hidden && document.activeElement === el.loginIdInput) {
        el.loginPinInput.focus();
      } else {
        attemptLogin();
      }
    }
  }
  function onPinKey(ev) {
    if (ev.key === 'Enter') { ev.preventDefault(); attemptLogin(); }
  }

  // ── 初期設定（最初の教員作成）─────────────────
  function showBootstrap() {
    if (!el.bootstrapOverlay) return;
    el.bootstrapOverlay.hidden = false;
    el.bsTeacherNumber.value = '1';
    el.bsTeacherInitial.value = '';
    el.bsTeacherName.value = '';
    el.bsPin1.value = '';
    el.bsPin2.value = '';
    el.bsError.hidden = true;
    updateBsPreview();
    setTimeout(() => el.bsTeacherNumber.focus(), 50);
  }
  function hideBootstrap() { if (el.bootstrapOverlay) el.bootstrapOverlay.hidden = true; }

  function updateBsPreview() {
    const num = Math.max(1, Math.min(99, Number(el.bsTeacherNumber.value || 1)));
    const ini = Auth.toAscii(el.bsTeacherInitial.value || '').trim().toUpperCase();
    const id = `9${0}${String(num).padStart(2, '0')}${ini || '?'}`;
    el.bsIdPreview.textContent = id;
    return id;
  }
  function showBsError(msg) { el.bsError.textContent = msg; el.bsError.hidden = false; }

  async function submitBootstrap() {
    el.bsError.hidden = true;
    const name = (el.bsTeacherName.value || '').trim();
    if (!name) { showBsError('氏名を入力してください'); return; }
    const ini = Auth.toAscii(el.bsTeacherInitial.value || '').trim().toUpperCase();
    if (!/^[A-Z]$/.test(ini)) { showBsError('イニシャルは A-Z の1文字で入力してください'); return; }
    const num = Math.max(1, Math.min(99, Number(el.bsTeacherNumber.value || 0)));
    if (!num) { showBsError('教員番号は1〜99で入力してください'); return; }
    const pin1 = Auth.normalizePin(el.bsPin1.value);
    const pin2 = Auth.normalizePin(el.bsPin2.value);
    if (!Auth.isValidPinFormat(pin1)) { showBsError('PIN は6桁の数字で入力してください'); return; }
    if (pin1 !== pin2) { showBsError('PIN（確認）が一致しません'); return; }
    const id = `9${0}${String(num).padStart(2, '0')}${ini}`;
    if (!Auth.isValidTeacherIdFormat(id)) { showBsError('生成されたIDが不正です'); return; }
    const exists = await DB.getStudent(id);
    if (exists) { showBsError(`${id} は既に登録されています`); return; }
    const hash = await Auth.hashPin(pin1);
    await DB.upsertStudent({
      id, role: 'teacher',
      grade: 9, class: 0, number: num,
      name, initial: ini,
      pinHash: hash,
      createdAt: new Date().toISOString(),
    });
    hideBootstrap();
    showLogin();  // 戻ったら作った教員IDでログイン可能に
    if (el.loginIdInput) el.loginIdInput.value = id;
    onIdInput();
    setTimeout(() => el.loginPinInput && el.loginPinInput.focus(), 100);
  }

  // ── アプリ操作ロック（is-locked 中は全カードを無効化）──
  function applyLockStyle() {
    // 既存の app-shell に対し pointer-events 制御を入れる（CSS 側で実装）
  }

  // ── 公開 API ───────────────────────────────────
  global.OrgQuizSession = {
    getUser:    () => state.user,
    getSessionId: () => state.sessionId,
    isLoggedIn: () => !!state.user,
    isDemo:     () => !!state.user && state.user.role === 'demo',
    isTeacher:  () => !!state.user && state.user.role === 'teacher',
    isStudent:  () => !!state.user && state.user.role === 'student',
    logout,
    autoEnd,
    showLogin,
  };

  // ── 既定名簿の自動投入（初回起動時のみ）────────
  // roster_seed.js の OrgQuizDefaultRoster を roster ストアへ登録する。
  // meta:rosterSeededVersion に投入済みの版を記録し、二重投入や
  // （教員が生徒を削除した後の）勝手な復活を防ぐ。名簿を更新したい
  // ときは roster_seed.js の版番号を上げる。
  async function seedDefaultRoster() {
    if (!DB) return;
    const roster = global.OrgQuizDefaultRoster;
    if (!Array.isArray(roster) || roster.length === 0) return;
    const version = global.OrgQuizDefaultRosterVersion || 1;
    try {
      const seeded = await DB.getMeta('rosterSeededVersion');
      if (seeded === version) return; // この版は投入済み
      for (const rec of roster) {
        const existing = await DB.getStudent(rec.id);
        if (existing) continue; // 既存（教員が編集済み等）は上書きしない
        await DB.upsertStudent(Object.assign({ createdAt: new Date().toISOString() }, rec));
      }
      await DB.setMeta('rosterSeededVersion', version);
    } catch (err) {
      console.warn('[roster] seed failed:', err);
    }
  }

  // ── 初期化 ─────────────────────────────────────
  function setup() {
    el = {
      loginOverlay:  document.getElementById('loginOverlay'),
      loginIdInput:  document.getElementById('loginIdInput'),
      loginPinRow:   document.getElementById('loginPinRow'),
      loginPinInput: document.getElementById('loginPinInput'),
      loginError:    document.getElementById('loginError'),
      loginSubmitBtn:document.getElementById('loginSubmitBtn'),
      loginDemoBtn:  document.getElementById('loginDemoBtn'),
      loginBootstrapBtn: document.getElementById('loginBootstrapBtn'),

      authStatus:    document.getElementById('authStatus'),
      authUserId:    document.getElementById('authUserId'),
      authUserName:  document.getElementById('authUserName'),
      authTeacherBtn:document.getElementById('authTeacherBtn'),
      authExportCodeBtn: document.getElementById('authExportCodeBtn'),
      authLogoutBtn: document.getElementById('authLogoutBtn'),

      logcodeOverlay:  document.getElementById('logcodeOverlay'),
      logcodeText:     document.getElementById('logcodeText'),
      logcodeCopyBtn:  document.getElementById('logcodeCopyBtn'),
      logcodeDownloadBtn: document.getElementById('logcodeDownloadBtn'),
      logcodeCloseBtn: document.getElementById('logcodeCloseBtn'),
      logcodeMsg:      document.getElementById('logcodeMsg'),

      bootstrapOverlay: document.getElementById('bootstrapOverlay'),
      bsTeacherNumber:  document.getElementById('bsTeacherNumber'),
      bsTeacherInitial: document.getElementById('bsTeacherInitial'),
      bsTeacherName:    document.getElementById('bsTeacherName'),
      bsIdPreview:      document.getElementById('bsIdPreview'),
      bsPin1:           document.getElementById('bsPin1'),
      bsPin2:           document.getElementById('bsPin2'),
      bsError:          document.getElementById('bsError'),
      bsCancelBtn:      document.getElementById('bsCancelBtn'),
      bsSubmitBtn:      document.getElementById('bsSubmitBtn'),
    };

    if (el.loginIdInput) {
      el.loginIdInput.addEventListener('input', onIdInput);
      el.loginIdInput.addEventListener('keydown', onIdKey);
    }
    if (el.loginPinInput) el.loginPinInput.addEventListener('keydown', onPinKey);
    if (el.loginSubmitBtn) el.loginSubmitBtn.addEventListener('click', attemptLogin);
    if (el.loginDemoBtn) el.loginDemoBtn.addEventListener('click', loginAsDemo);
    if (el.loginBootstrapBtn) el.loginBootstrapBtn.addEventListener('click', showBootstrap);

    if (el.authLogoutBtn) el.authLogoutBtn.addEventListener('click', logout);
    if (el.authTeacherBtn) el.authTeacherBtn.addEventListener('click', openTeacherMode);
    if (el.authExportCodeBtn) el.authExportCodeBtn.addEventListener('click', showLogCode);
    if (el.logcodeCopyBtn) el.logcodeCopyBtn.addEventListener('click', copyLogCode);
    if (el.logcodeDownloadBtn) el.logcodeDownloadBtn.addEventListener('click', downloadLogCode);
    if (el.logcodeCloseBtn) el.logcodeCloseBtn.addEventListener('click', hideLogCode);

    if (el.bsCancelBtn) el.bsCancelBtn.addEventListener('click', hideBootstrap);
    if (el.bsSubmitBtn) el.bsSubmitBtn.addEventListener('click', submitBootstrap);
    if (el.bsTeacherNumber) el.bsTeacherNumber.addEventListener('input', updateBsPreview);
    if (el.bsTeacherInitial) el.bsTeacherInitial.addEventListener('input', () => {
      el.bsTeacherInitial.value = Auth.toAscii(el.bsTeacherInitial.value).trim().toUpperCase();
      updateBsPreview();
    });

    // ページを離れるときにセッションを閉じる（autoEnded=false）
    window.addEventListener('beforeunload', () => {
      if (state.sessionId) {
        // 同期的に処理できないため durationMs だけ即時更新（ベストエフォート）
        try {
          DB.getSession(state.sessionId).then(rec => {
            if (!rec) return;
            rec.endedAt = new Date().toISOString();
            rec.durationMs = Date.now() - new Date(rec.startedAt).getTime();
            DB.putSession(rec);
          });
        } catch (_) {}
      }
    });

    // IndexedDB 起動 → localStorage マイグレーション → ログイン画面表示
    if (DB) {
      DB.openDB()
        .then(() => { if (DB.requestPersistence) DB.requestPersistence(); }) // 自動削除の抑止を要求（best-effort）
        .then(() => DB.migrateLocalStorage())
        .then(() => seedDefaultRoster())
        .then(() => showLogin())
        .catch(err => {
          console.warn('[storage] init failed:', err);
          // DB が使えなくてもデモプレイだけは可能にする
          showLogin();
        });
    } else {
      showLogin();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})(window);
