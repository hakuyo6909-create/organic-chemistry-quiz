/**
 * 分子 3D モジュール 公開 API（Phase 1）
 *
 * smilesToMolecule3D(smiles)  ... SMILES → 3D 分子オブジェクト
 * render3DMolecule(mol, ...)  ... Three.js でコンテナに描画
 *
 * Phase 1 では直鎖アルカン（"C", "CC", "CCC", ...）のみ対応。
 * SMILES パーサは内製の極小実装。Phase 2 で RDKit.js に置き換える。
 */

import { annotateHybridizations } from "./core/hybridization.js";
import { buildGeometry } from "./core/geometry-builder.js";
import { minimize } from "./core/force-field.js";
import { verifyStereochemistry, applyAxialChirality } from "./core/stereochemistry.js";
import { createMoleculeRenderer } from "./render/three-renderer.js";
import {
  getFromMemory, putInMemory,
  getFromIndexedDB, putInIndexedDB,
  molToPayload, applyPayloadToMol,
} from "./cache/coord-cache.js";

/* ─────────── Phase 4 SMILES パーサ ───────────
 *
 * 対応：
 *   元素：C, N, O, F, S, P, I（1 文字）, Cl, Br（2 文字、先読み）
 *   芳香族小文字：c, n, o, s, p → 元素を大文字化＋ aromatic フラグ
 *   結合：=（二重）, #（三重）, -（単結合、省略可）
 *   分岐：(...) スタックで処理
 *   環番号：1/2/... → 同じ番号の 2 回目で閉環
 *   ブラケット：[nH], [NH2], [O-] 等の最小サポート（元素 + H 数 + 電荷）
 *
 * 未対応（Phase 5 以降）：立体記号 @/@@/, 同位体 [13C], 結合の方向 / \, % 二桁環番号
 *
 * 出力スキーマ：
 *   atoms: [{ id, element, aromatic, formalCharge, implicitHCount, bonds: [{otherId, order}] }]
 *   bonds: [{ a, b, order }]
 *   ringClosures: [{ a, b }]  // 閉環ボンドの両端（環検出に使う）
 */
const STANDARD_VALENCE = { C: 4, N: 3, O: 2, H: 1, F: 1, Cl: 1, Br: 1, I: 1, S: 2, P: 3 };
const PHASE4_SINGLE_CHAR = new Set(["C", "N", "O", "F", "S", "P", "I"]);
const AROMATIC_SINGLE_CHAR = new Set(["c", "n", "o", "s", "p"]);

function parseSmiles(smiles) {
  const atoms = [];
  const bonds = [];
  const ringClosures = [];
  const ringOpen = new Map();
  let pendingOrder = 1;
  let pendingOrderExplicit = false;  // '-' / '=' / '#' で明示指定されたか
  let pendingDirection = null;
  let prevId = null;
  const stack = [];
  let i = 0;

  const addAtom = (element, opts = {}) => {
    const id = atoms.length;
    atoms.push({
      id,
      element,
      aromatic: opts.aromatic ?? false,
      fromBracket: opts.fromBracket ?? false,
      formalCharge: opts.formalCharge ?? 0,
      explicitHCount: opts.explicitH ?? 0,
      implicitHCount: 0,
      chirality: opts.chirality ?? null,
      // SMILES 順序追跡（キラリティ判定用）
      smilesPrevId: opts.smilesPrevId ?? null,
      smilesNextIds: opts.chirality ? [] : null,
      bonds: [],
    });
    return id;
  };

  const addBond = (a, b, order, direction = null) => {
    // direction の解釈（OpenSMILES）：
    //   "up"   = SMILES "/"。bond が左下→右上に伸びる、つまり右側原子 b が上にいる。
    //   "down" = SMILES "\"。左上→右下、つまり左側原子 a が上にいる。
    // 「どの原子が上か」を upAtomId として共有保存する（両端から見て一意）。
    const upAtomId = direction === "up" ? b
                   : direction === "down" ? a
                   : null;
    const bond = { a, b, order, upAtomId };
    bonds.push(bond);
    atoms[a].bonds.push({ otherId: b, order, upAtomId });
    atoms[b].bonds.push({ otherId: a, order, upAtomId });
    if (atoms[a].chirality && atoms[a].smilesNextIds && atoms[a].smilesPrevId !== b) {
      atoms[a].smilesNextIds.push(b);
    }
  };

  while (i < smiles.length) {
    const ch = smiles[i];

    if (ch === "(") {
      stack.push({ prevId, pendingOrder });
      pendingOrder = 1;
      i++; continue;
    }
    if (ch === ")") {
      if (stack.length === 0) throw new Error(`Unmatched ')' at position ${i} in "${smiles}"`);
      const popped = stack.pop();
      prevId = popped.prevId;
      pendingOrder = popped.pendingOrder;
      i++; continue;
    }
    if (ch === "=") { pendingOrder = 2; pendingOrderExplicit = true; i++; continue; }
    if (ch === "#") { pendingOrder = 3; pendingOrderExplicit = true; i++; continue; }
    if (ch === "-") { pendingOrder = 1; pendingOrderExplicit = true; i++; continue; }
    // E/Z 結合方向
    if (ch === "/") { pendingDirection = "up"; pendingOrder = 1; pendingOrderExplicit = true; i++; continue; }
    if (ch === "\\") { pendingDirection = "down"; pendingOrder = 1; pendingOrderExplicit = true; i++; continue; }

    // 環番号（1〜9）
    if (/[0-9]/.test(ch)) {
      const num = +ch;
      if (prevId === null) {
        throw new Error(`Ring closure digit "${num}" with no preceding atom in "${smiles}"`);
      }
      if (ringOpen.has(num)) {
        const openerId = ringOpen.get(num);
        let order = pendingOrder;
        // 暗黙の単結合かつ両端が芳香族 → 芳香族結合 1.5。明示 "-" は単結合のまま。
        if (atoms[openerId].aromatic && atoms[prevId].aromatic && order === 1 && !pendingOrderExplicit) {
          order = 1.5;
        }
        addBond(openerId, prevId, order, pendingDirection);
        ringClosures.push({ a: openerId, b: prevId });
        ringOpen.delete(num);
      } else {
        ringOpen.set(num, prevId);
      }
      pendingOrder = 1;
      pendingOrderExplicit = false;
      pendingDirection = null;
      i++; continue;
    }

    // ブラケット原子 [...]
    if (ch === "[") {
      const close = smiles.indexOf("]", i);
      if (close === -1) throw new Error(`Unclosed '[' in "${smiles}"`);
      const inner = smiles.slice(i + 1, close);
      const parsed = parseBracket(inner);
      const id = addAtom(parsed.element, {
        aromatic: parsed.aromatic,
        fromBracket: true,
        formalCharge: parsed.charge,
        explicitH: parsed.hCount,
        chirality: parsed.chirality,
        smilesPrevId: prevId,
      });
      if (prevId !== null) {
        let order = pendingOrder;
        if (atoms[prevId].aromatic && parsed.aromatic && order === 1 && !pendingOrderExplicit) order = 1.5;
        addBond(prevId, id, order, pendingDirection);
      }
      prevId = id;
      pendingOrder = 1;
      pendingOrderExplicit = false;
      pendingDirection = null;
      i = close + 1; continue;
    }

    // 元素文字列の認識
    let element, isAromatic = false;
    if (ch === "C" && smiles[i + 1] === "l") { element = "Cl"; i += 2; }
    else if (ch === "B" && smiles[i + 1] === "r") { element = "Br"; i += 2; }
    else if (PHASE4_SINGLE_CHAR.has(ch)) { element = ch; i += 1; }
    else if (AROMATIC_SINGLE_CHAR.has(ch)) {
      element = ch.toUpperCase();
      isAromatic = true;
      i += 1;
    } else {
      throw new Error(
        `[molecule-3d Phase 4] Unsupported character "${ch}" at position ${i} in "${smiles}".`,
      );
    }
    const id = addAtom(element, { aromatic: isAromatic });
    if (prevId !== null) {
      let order = pendingOrder;
      if (atoms[prevId].aromatic && isAromatic && order === 1 && !pendingOrderExplicit) order = 1.5;
      addBond(prevId, id, order, pendingDirection);
    }
    prevId = id;
    pendingOrder = 1;
    pendingOrderExplicit = false;
    pendingDirection = null;
  }

  if (stack.length > 0) throw new Error(`Unclosed '(' in "${smiles}"`);
  if (ringOpen.size > 0) throw new Error(`Unclosed ring(s) ${[...ringOpen.keys()].join(",")} in "${smiles}"`);

  // 水素数を確定。ブラケット原子（fromBracket=true）は explicitHCount を採用し、
  // 自動補完を行わない。非ブラケット原子のみ暗黙 H を自動計算。
  // この addImplicitHydrogens が両方を均一に処理するため、ここでは
  // implicitHCount に統合する。
  for (const a of atoms) {
    if (a.fromBracket) {
      a.implicitHCount = a.explicitHCount;
    } else {
      let used = 0;
      for (const b of a.bonds) used += b.order;
      const valence = STANDARD_VALENCE[a.element] ?? 4;
      a.implicitHCount = Math.max(0, Math.round(valence - used));
    }
  }

  return { atoms, bonds, ringClosures };
}

/**
 * ブラケット原子の中身を解析する。
 * フォーマット: [<isotope?><element><chirality?><Hn?><charge?>]
 * 例: "nH", "NH2", "n+", "O-", "CH3", "C@H", "C@@H", "13CH3"
 */
function parseBracket(inner) {
  let i = 0;
  // 同位体（数字）はスキップ
  while (i < inner.length && /\d/.test(inner[i])) i++;

  // 元素
  let element, aromatic = false;
  if (inner[i] === "C" && inner[i + 1] === "l") { element = "Cl"; i += 2; }
  else if (inner[i] === "B" && inner[i + 1] === "r") { element = "Br"; i += 2; }
  else if (/[A-Z]/.test(inner[i])) {
    if (/[a-z]/.test(inner[i + 1])) { element = inner.slice(i, i + 2); i += 2; }
    else { element = inner[i]; i += 1; }
  } else if (/[a-z]/.test(inner[i])) {
    element = inner[i].toUpperCase();
    aromatic = true;
    i += 1;
  } else {
    throw new Error(`Cannot parse bracket "${inner}"`);
  }

  // キラリティ記号 @ / @@
  // @  = anti-clockwise (CCW), SMILES 順 4 隣接で先頭原子背面から見て CCW
  // @@ = clockwise (CW)
  let chirality = null;
  if (inner[i] === "@") {
    chirality = "CCW";
    i++;
    if (inner[i] === "@") { chirality = "CW"; i++; }
  }

  // 明示的 H 数
  let hCount = 0;
  if (inner[i] === "H") {
    i++;
    if (/\d/.test(inner[i])) { hCount = +inner[i]; i++; }
    else hCount = 1;
  }

  // 電荷
  let charge = 0;
  if (inner[i] === "+") { charge = 1; i++; if (/\d/.test(inner[i])) { charge = +inner[i]; i++; } }
  else if (inner[i] === "-") { charge = -1; i++; if (/\d/.test(inner[i])) { charge = -inner[i]; i++; } }

  return { element, aromatic, hCount, charge, chirality };
}

/**
 * SMILES から 3D 分子オブジェクトを生成する。
 *
 * 処理パイプライン（Phase 1）：
 *   SMILES → 分子グラフ → 混成判定 → Build-up で初期座標
 *   （Phase 5 で力場最適化を追加）
 *
 * @param {string} smiles SMILES 文字列
 * @param {Object} [options]
 * @returns {Promise<Object>} 分子オブジェクト { atoms, bonds }
 */
export async function smilesToMolecule3D(smiles, options = {}) {
  const useCache = options.useCache !== false;
  const mol = parseSmiles(smiles);
  annotateHybridizations(mol);

  // キャッシュキーは「SMILES + chirality hint」。R 体と S 体で別エントリ。
  const cacheKey = options.chiralityHint
    ? `${smiles}|chirality:${options.chiralityHint}`
    : smiles;

  // Phase 7: キャッシュ（メモリ → IndexedDB）から復元を試行
  if (useCache) {
    let cached = getFromMemory(cacheKey);
    if (!cached) cached = await getFromIndexedDB(cacheKey);
    if (cached) {
      buildGeometry(mol);
      if (applyPayloadToMol(mol, cached)) {
        mol.fromCache = true;
        mol.stereo = { chirality: { checked: 0, flipped: 0 }, stereo: { checked: 0, flipped: 0 } };
        return mol;
      }
    }
  }

  buildGeometry(mol);
  // Phase 6: 立体化学の整合（@/@@、/\）を確認し、不一致なら反転・回転で修正。
  mol.stereo = verifyStereochemistry(mol);
  // Phase 8D: 軸不斉（biaryl 系）のヒントから二面角を付与
  // SMILES に立体記号がない場合でも、分子 ID 由来の R/S ヒントで R 体 / S 体を区別可能
  if (options.chiralityHint) {
    mol.axialChirality = applyAxialChirality(mol, options.chiralityHint);
  }
  if (options.optimize !== false) {
    // Phase 5: 簡易 UFF で軽い精緻化。Build-up が既に良好なら数 step で収束する。
    const result = minimize(mol, {
      maxIter: options.maxIter ?? 100,
      tol: options.tol ?? 0.1,
      verbose: options.verbose ?? false,
    });
    mol.optimization = result;
  }

  // Phase 7: キャッシュに保存（chirality hint を含むキーで）
  if (useCache) {
    const payload = molToPayload(mol);
    putInMemory(cacheKey, payload);
    putInIndexedDB(cacheKey, payload);
  }
  mol.fromCache = false;
  return mol;
}

/**
 * Three.js とそのアドオンを動的に読み込む。
 *
 * 注意：OrbitControls.js の内部で `import { ... } from 'three'` のような
 *       bare specifier が使われているため、`<script type="importmap">` の
 *       設定が HTML 側に必要。詳細は index.html 参照。
 *
 *   {
 *     "imports": {
 *       "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
 *       "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
 *     }
 *   }
 */
async function loadThree() {
  const THREE = await import("three");
  const OrbitControlsModule = await import("three/addons/controls/OrbitControls.js");
  return { THREE, OrbitControlsModule };
}

/**
 * Three.js で分子を描画する。レンダラはコンテナごとに作り直す。
 * 戻り値の renderer は dispose() を呼ぶことで GPU リソースを解放できる。
 *
 * @param {Object} mol3d                 smilesToMolecule3D の戻り値
 * @param {HTMLElement} container        描画先 DOM 要素
 * @returns {Promise<{dispose: () => void}>}
 */
export async function render3DMolecule(mol3d, container) {
  const { THREE, OrbitControlsModule } = await loadThree();
  const renderer = createMoleculeRenderer(THREE, OrbitControlsModule);
  renderer.init(container);
  renderer.render(mol3d);
  return renderer;
}
