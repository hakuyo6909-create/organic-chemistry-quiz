/**
 * 座標キャッシュ（Phase 7）
 *
 * 同じ SMILES に対する 3D 座標生成（パース → Build-up → 立体化学 → 最適化）を
 * 繰り返し行うのを避けるため、最終座標をキャッシュする。
 *
 * 2 階層構造：
 *   1) In-memory Map：常に有効、起動セッション中の高速ルックアップ
 *   2) IndexedDB：ブラウザ環境でのみ有効、永続化（Phase 7 minimum では put/get のみ）
 *
 * キー：正規化された SMILES 文字列（前後空白除去、内部空白除去）
 * 値：{ positions: [{x,y,z}, ...], elements: string[], bonds: [...], metadata: {...} }
 */

const MEMORY_CACHE = new Map();

const IDB_NAME = "orgQuiz_mol3d";
const IDB_STORE = "coords";
const IDB_VERSION = 1;

const isBrowser = typeof window !== "undefined" && typeof window.indexedDB !== "undefined";

/**
 * SMILES を正規化（前後空白・内部空白除去）。
 * Phase 7 では canonical SMILES への変換は行わず、表記そのままを使用。
 * RDKit.js 統合時に置換予定。
 *
 * @param {string} smiles
 * @returns {string}
 */
export function normalizeSmiles(smiles) {
  return smiles.trim().replace(/\s+/g, "");
}

/**
 * メモリキャッシュから読み出し。
 * @returns {Object|null}
 */
export function getFromMemory(smiles) {
  return MEMORY_CACHE.get(normalizeSmiles(smiles)) ?? null;
}

/**
 * メモリキャッシュへ書き込み。
 * @param {string} smiles
 * @param {Object} payload  { positions, elements, bonds, metadata }
 */
export function putInMemory(smiles, payload) {
  MEMORY_CACHE.set(normalizeSmiles(smiles), payload);
}

/** メモリキャッシュをクリア */
export function clearMemoryCache() {
  MEMORY_CACHE.clear();
}

/** メモリキャッシュのエントリ数 */
export function memoryCacheSize() {
  return MEMORY_CACHE.size;
}

/* ─────────── IndexedDB（ブラウザのみ） ─────────── */

/**
 * IndexedDB を開く（初回はストアを作成）。
 * @returns {Promise<IDBDatabase|null>}
 */
function openDB() {
  if (!isBrowser) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: "smiles" });
      }
    };
  });
}

/**
 * IndexedDB から読み出し。
 * @param {string} smiles
 * @returns {Promise<Object|null>}
 */
export async function getFromIndexedDB(smiles) {
  if (!isBrowser) return null;
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(normalizeSmiles(smiles));
      req.onsuccess = () => resolve(req.result?.payload ?? null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn("[coord-cache] IDB read failed:", e);
    return null;
  }
}

/**
 * IndexedDB へ書き込み。
 * @param {string} smiles
 * @param {Object} payload
 */
export async function putInIndexedDB(smiles, payload) {
  if (!isBrowser) return;
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    store.put({ smiles: normalizeSmiles(smiles), payload, timestamp: Date.now() });
  } catch (e) {
    console.warn("[coord-cache] IDB write failed:", e);
  }
}

/* ─────────── 公開ヘルパ：分子オブジェクト ⇄ キャッシュ payload ─────────── */

/**
 * 分子オブジェクトをキャッシュ用 payload に変換。
 * @param {Object} mol  3D 構築済み分子
 * @returns {Object}    payload
 */
export function molToPayload(mol) {
  return {
    elements: mol.atoms.map((a) => a.element),
    positions: mol.atoms.map((a) => ({ x: a.position.x, y: a.position.y, z: a.position.z })),
    bondsLite: mol.bonds.map((b) => ({ a: b.a, b: b.b, order: b.order })),
    metadata: {
      version: 1,
      createdAt: new Date().toISOString(),
      atomCount: mol.atoms.length,
    },
  };
}

/**
 * キャッシュ payload から座標を分子オブジェクトに復元（その他のフィールドは parseSmiles 再実行で取得）。
 *
 * @param {Object} mol      parseSmiles の出力（atoms/bonds が揃ったもの、positions は未設定）
 * @param {Object} payload  molToPayload で作った payload
 * @returns {boolean}       原子数が一致して復元できた場合 true
 */
export function applyPayloadToMol(mol, payload) {
  if (!payload || !payload.positions) return false;
  if (payload.positions.length !== mol.atoms.length) return false;
  for (let i = 0; i < mol.atoms.length; i++) {
    mol.atoms[i].position = { ...payload.positions[i] };
  }
  return true;
}
