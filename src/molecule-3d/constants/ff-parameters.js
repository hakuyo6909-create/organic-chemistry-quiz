/**
 * 力場パラメータ（UFF 簡易版）
 *
 * 出典：Rappé, Casewit, Colwell, Goddard, Skiff,
 *       "UFF, a full periodic table force field for molecular mechanics
 *       and molecular dynamics simulations", J. Am. Chem. Soc. 1992, 114, 10024.
 *
 * Phase 5 minimum 実装で使用する項目：
 *   1) 結合伸縮：r₀ は bond-lengths.js を参照、k_b は次の式で導出
 *      k_b = 664.12 × Z_i* × Z_j* / r_ij³  (kcal/mol/Å²)
 *   2) 結合角振動：θ₀ は bond-angles.js を参照、k_θ は係数 100 kcal/mol/rad² で固定
 *   3) van der Waals: D_ij = √(D_i D_j), x_ij = √(x_i x_j), LJ 12-6
 *   4) sp² 平面性：k_imp = 50 kcal/mol/rad²
 */

/**
 * UFF 原子パラメータ
 *   r:    UFF 共有結合半径 [Å] （bond-lengths と独立、UFF 内部値）
 *   z:    UFF 有効電荷 Z*
 *   x:    van der Waals 半径 [Å]
 *   D:    van der Waals 井戸の深さ [kcal/mol]
 *
 * 原子タイプは「element_hybridization」記法（C_3=sp³、C_2=sp²、C_1=sp、C_R=芳香）。
 */
export const UFF_ATOM_PARAMS = Object.freeze({
  H:    { r: 0.354, z: 0.712, x: 2.886, D: 0.044 },
  C_3:  { r: 0.757, z: 1.912, x: 3.851, D: 0.105 },
  C_2:  { r: 0.732, z: 1.912, x: 3.851, D: 0.105 },
  C_R:  { r: 0.729, z: 1.912, x: 3.851, D: 0.105 },  // aromatic
  C_1:  { r: 0.706, z: 1.912, x: 3.851, D: 0.105 },
  N_3:  { r: 0.700, z: 2.544, x: 3.660, D: 0.069 },
  N_2:  { r: 0.685, z: 2.544, x: 3.660, D: 0.069 },
  N_R:  { r: 0.699, z: 2.544, x: 3.660, D: 0.069 },
  N_1:  { r: 0.656, z: 2.544, x: 3.660, D: 0.069 },
  O_3:  { r: 0.658, z: 2.300, x: 3.500, D: 0.060 },
  O_2:  { r: 0.634, z: 2.300, x: 3.500, D: 0.060 },
  O_R:  { r: 0.680, z: 2.300, x: 3.500, D: 0.060 },
  F:    { r: 0.668, z: 1.735, x: 3.364, D: 0.050 },
  S_3:  { r: 1.064, z: 2.703, x: 4.035, D: 0.274 },
  P_3:  { r: 1.101, z: 2.863, x: 4.147, D: 0.305 },
  Cl:   { r: 1.044, z: 2.348, x: 3.947, D: 0.227 },
  Br:   { r: 1.192, z: 2.519, x: 4.189, D: 0.251 },
  I:    { r: 1.382, z: 2.650, x: 4.500, D: 0.339 },
});

/** 角度のばね定数 [kcal/mol/rad²]（簡易版：原子に依らず一定） */
export const FF_ANGLE_K = 100.0;

/** 平面性ばね定数 [kcal/mol/rad²]（sp² 中心の out-of-plane） */
export const FF_IMPROPER_K = 50.0;

/** UFF 結合伸縮の比例定数 */
const KB_PREFACTOR = 664.12;

/**
 * 原子の UFF パラメータを返す（element + hybridization から原子タイプを決定）。
 * @param {Object} atom  分子グラフの原子
 * @returns {{r,z,x,D}}  パラメータ
 */
export function uffAtomParams(atom) {
  if (atom.element === "H") return UFF_ATOM_PARAMS.H;
  const hybSuffix = atom.aromatic ? "_R"
    : atom.hybridization === "sp3" ? "_3"
    : atom.hybridization === "sp2" ? "_2"
    : atom.hybridization === "sp"  ? "_1" : "_3";
  const key = atom.element + hybSuffix;
  if (UFF_ATOM_PARAMS[key]) return UFF_ATOM_PARAMS[key];
  // ハロゲンなど混成サフィックスを取らない原子はそのまま
  if (UFF_ATOM_PARAMS[atom.element]) return UFF_ATOM_PARAMS[atom.element];
  // フォールバック
  console.warn(`[ff-parameters] no UFF params for "${key}", using C_3`);
  return UFF_ATOM_PARAMS.C_3;
}

/**
 * 結合のばね定数 k_b [kcal/mol/Å²] を UFF 式で計算する。
 *   k_b = 664.12 × Z_i* × Z_j* / r_ij³
 *
 * @param {Object} atomA, atomB  両端の原子
 * @param {number} r0            理想結合長 [Å]
 * @returns {number} k_b
 */
export function bondForceConstant(atomA, atomB, r0) {
  const pA = uffAtomParams(atomA);
  const pB = uffAtomParams(atomB);
  return KB_PREFACTOR * pA.z * pB.z / (r0 * r0 * r0);
}

/**
 * van der Waals 相互作用の組合せ規則による (D_ij, x_ij)。
 *   D_ij = √(D_i D_j)
 *   x_ij = √(x_i x_j)
 *
 * @returns {{D, x}}
 */
export function vdwPairParams(atomA, atomB) {
  const pA = uffAtomParams(atomA);
  const pB = uffAtomParams(atomB);
  return {
    D: Math.sqrt(pA.D * pB.D),
    x: Math.sqrt(pA.x * pB.x),
  };
}
