/* ============================================================
   有機化学クイズ — IndexedDB ストレージ抽象化レイヤ（Phase 1）
   ------------------------------------------------------------
   オブジェクトストア構成:
     meta      key単一値（PIN ハッシュ、schemaVersion、settings 等）
     roster    生徒名簿（keyPath: id）
     profiles  累計プロファイル（keyPath: studentId）
     sessions  セッション記録（keyPath: sessionId, idx: studentId / startedAt）
     events    イベントログ（auto increment, idx: sessionId / studentId+t）
     mru       LRU リスト（keyPath: [studentId, scope]）
   既存 localStorage の `orgQuizSettings_v1` は migrateLocalStorage() で
   meta:settings にコピーする（localStorage 自体は当面残す＝既存コード互換）。
   ============================================================ */
(function (global) {
  'use strict';

  const DB_NAME = 'orgQuizDB';
  const DB_VERSION = 1;

  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!global.indexedDB) {
        reject(new Error('IndexedDB はこのブラウザで利用できません'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('roster')) {
          const s = db.createObjectStore('roster', { keyPath: 'id' });
          s.createIndex('byClass', ['grade', 'class'], { unique: false });
        }
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'studentId' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          const s = db.createObjectStore('sessions', { keyPath: 'sessionId' });
          s.createIndex('studentId', 'studentId', { unique: false });
          s.createIndex('startedAt', 'startedAt', { unique: false });
          s.createIndex('studentId_startedAt', ['studentId', 'startedAt'], { unique: false });
        }
        if (!db.objectStoreNames.contains('events')) {
          const s = db.createObjectStore('events', { keyPath: 'eventId', autoIncrement: true });
          s.createIndex('sessionId', 'sessionId', { unique: false });
          s.createIndex('studentId_t', ['studentId', 't'], { unique: false });
        }
        if (!db.objectStoreNames.contains('mru')) {
          db.createObjectStore('mru', { keyPath: ['studentId', 'scope'] });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('IndexedDB がブロックされています（他のタブを閉じてください）'));
    });
    return dbPromise;
  }

  function asPromise(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function txStore(storeName, mode) {
    const db = await openDB();
    return db.transaction(storeName, mode || 'readonly').objectStore(storeName);
  }

  // ── 汎用 CRUD ──────────────────────────────────
  async function get(storeName, key)        { return asPromise((await txStore(storeName)).get(key)); }
  async function put(storeName, value)      { return asPromise((await txStore(storeName, 'readwrite')).put(value)); }
  async function del(storeName, key)        { return asPromise((await txStore(storeName, 'readwrite')).delete(key)); }
  async function getAll(storeName, q, n)    { return asPromise((await txStore(storeName)).getAll(q, n)); }
  async function clear(storeName)           { return asPromise((await txStore(storeName, 'readwrite')).clear()); }
  async function getAllByIndex(storeName, indexName, q, n) {
    const store = await txStore(storeName);
    return asPromise(store.index(indexName).getAll(q, n));
  }

  // ── meta ────────────────────────────────────────
  async function getMeta(key) {
    const r = await get('meta', key);
    return r ? r.value : undefined;
  }
  async function setMeta(key, value) {
    return put('meta', { key, value, updatedAt: new Date().toISOString() });
  }

  // ── roster ─────────────────────────────────────
  async function getStudent(id)       { return get('roster', id); }
  async function listStudents()       { return getAll('roster'); }
  async function upsertStudent(rec)   { return put('roster', rec); }
  async function deleteStudent(id)    { return del('roster', id); }
  async function clearRoster()        { return clear('roster'); }

  // ── profiles ───────────────────────────────────
  async function getProfile(studentId)    { return get('profiles', studentId); }
  async function upsertProfile(profile)   { return put('profiles', profile); }
  async function deleteProfile(studentId) { return del('profiles', studentId); }

  // ── sessions ───────────────────────────────────
  async function putSession(s)              { return put('sessions', s); }
  async function getSession(id)             { return get('sessions', id); }
  async function listSessionsByStudent(sid) { return getAllByIndex('sessions', 'studentId', sid); }
  async function listAllSessions()          { return getAll('sessions'); }
  async function deleteSession(id)          { return del('sessions', id); }

  // ── events ─────────────────────────────────────
  async function putEvent(ev)                  { return put('events', ev); }
  async function listEventsBySession(sid)      { return getAllByIndex('events', 'sessionId', sid); }
  async function deleteEventsBySession(sid) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('events', 'readwrite');
      const idx = tx.objectStore('events').index('sessionId');
      const keyReq = idx.getAllKeys(sid);
      keyReq.onsuccess = () => {
        const keys = keyReq.result || [];
        const store = tx.objectStore('events');
        keys.forEach(k => store.delete(k));
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // ── mru ────────────────────────────────────────
  async function getMru(studentId, scope) {
    const r = await get('mru', [studentId, scope]);
    return r ? r.items : [];
  }
  async function setMru(studentId, scope, items) {
    return put('mru', { studentId, scope, items, updatedAt: new Date().toISOString() });
  }
  // LRU 追加：先頭に置き、重複削除、最大 N 件
  async function pushMru(studentId, scope, item, maxItems) {
    const cap = Math.max(1, maxItems || 20);
    const cur = await getMru(studentId, scope);
    const next = [item, ...cur.filter(x => x !== item)].slice(0, cap);
    await setMru(studentId, scope, next);
    return next;
  }

  // ── localStorage 移行 ──────────────────────────
  // 既存の orgQuizSettings_v1 を meta:settings にコピー（localStorage は破壊しない）
  async function migrateLocalStorage() {
    try {
      const raw = global.localStorage && global.localStorage.getItem('orgQuizSettings_v1');
      if (!raw) return false;
      const already = await getMeta('settings');
      if (already) return false;
      const parsed = JSON.parse(raw);
      await setMeta('settings', parsed);
      await setMeta('migratedFromLocalStorageAt', new Date().toISOString());
      return true;
    } catch (_) { return false; }
  }

  // ── 全消去（教員ページの「全データ初期化」用、将来呼び出し）──
  async function wipeAll() {
    for (const s of ['meta', 'roster', 'profiles', 'sessions', 'events', 'mru']) {
      await clear(s);
    }
  }

  // ── 永続ストレージ要求（ブラウザの自動削除を抑止）──
  // 対応ブラウザに「このサイトのデータを自動削除しないで」と要求する。
  // 学習記録を長期保存したいので初回に一度呼ぶ（拒否されても通常保存は継続）。
  async function requestPersistence() {
    try {
      const nav = global.navigator;
      if (!nav || !nav.storage || typeof nav.storage.persist !== 'function') return false;
      if (typeof nav.storage.persisted === 'function') {
        if (await nav.storage.persisted()) return true;   // 既に永続化済み
      }
      const granted = await nav.storage.persist();
      console.log('[storage] 永続ストレージ:', granted ? '許可（自動削除されません）' : '未許可（利用継続で許可される場合あり）');
      return granted;
    } catch (e) {
      console.warn('[storage] persist 要求に失敗:', e);
      return false;
    }
  }

  // ── ストレージ使用量の推定（教員が残量確認できるよう補助）──
  async function estimateStorage() {
    try {
      const nav = global.navigator;
      if (nav && nav.storage && typeof nav.storage.estimate === 'function') {
        return await nav.storage.estimate();  // { usage, quota }
      }
    } catch (_) {}
    return null;
  }

  global.OrgQuizDB = {
    openDB,
    getMeta, setMeta,
    getStudent, listStudents, upsertStudent, deleteStudent, clearRoster,
    getProfile, upsertProfile, deleteProfile,
    putSession, getSession, listSessionsByStudent, listAllSessions, deleteSession,
    putEvent, listEventsBySession, deleteEventsBySession,
    getMru, setMru, pushMru,
    migrateLocalStorage,
    wipeAll,
    requestPersistence, estimateStorage,
  };
})(window);
