/**
 * CPK 配色（Corey–Pauling–Koltun 配色）
 *
 * 1952 年に Corey–Pauling が提案、1965 年に Koltun が改良した
 * 原子球モデル標準配色。Jmol / PyMOL 等で広く採用されている拡張版。
 *
 * 値は 0xRRGGBB 形式の 16 進数（Three.js Color に直接渡せる）。
 */
export const CPK_COLORS = Object.freeze({
  H:  0xffffff,  // 白
  C:  0x222222,  // 黒（教材視認性のため純黒より少し明るく）
  N:  0x3050f8,  // 青
  O:  0xff0d0d,  // 赤
  F:  0x90e050,  // 黄緑
  Cl: 0x1ff01f,  // 緑
  Br: 0xa62929,  // 暗赤茶
  I:  0x940094,  // 紫
  S:  0xffff30,  // 黄
  P:  0xff8000,  // 橙
  B:  0xffb5b5,  // 桃
  Si: 0xf0c8a0,  // ベージュ
  Na: 0xab5cf2,
  K:  0x8f40d4,
  Ca: 0x3dff00,
  Mg: 0x8aff00,
  Fe: 0xe06633,
  Cu: 0xc88033,
  Zn: 0x7d80b0,
});

/**
 * 共有結合半径（Å）— 原子球の表示半径の基礎値。
 * Cordero ら（2008）の最新の共有結合半径表より。
 *
 * 球棒モデルではこの半径に 0.25〜0.3 程度を掛けて使うのが慣例。
 */
export const COVALENT_RADII = Object.freeze({
  H: 0.31, C: 0.76, N: 0.71, O: 0.66, F: 0.57,
  P: 1.07, S: 1.05, Cl: 1.02, Br: 1.20, I: 1.39,
  B: 0.84, Si: 1.11,
  Na: 1.66, K: 2.03, Ca: 1.76, Mg: 1.41,
  Fe: 1.32, Cu: 1.32, Zn: 1.22,
});

/**
 * 元素から CPK 色を取得。未登録元素は紫グレーを返す。
 * @param {string} element 元素記号
 * @returns {number} 0xRRGGBB
 */
export function cpkColor(element) {
  const c = CPK_COLORS[element];
  if (c === undefined) {
    console.warn(`[cpk-colors] unknown element "${element}"`);
    return 0xb088ff;
  }
  return c;
}

/**
 * 元素の共有結合半径を返す。未登録は 0.7 Å をフォールバック。
 * @param {string} element 元素記号
 * @returns {number} 共有結合半径（Å）
 */
export function covalentRadius(element) {
  return COVALENT_RADII[element] ?? 0.7;
}
