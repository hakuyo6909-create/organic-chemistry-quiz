/**
 * 混成軌道判定モジュール
 *
 * VSEPR 理論の「立体数 (steric number) = σ結合数 + 孤立電子対数」を
 * 計算し、混成状態を導出する。
 *
 *   立体数 2 → sp（直線）
 *   立体数 3 → sp²（三角形）
 *   立体数 4 → sp³（四面体）
 *   立体数 5 → sp³d（三方両錐）
 *   立体数 6 → sp³d²（八面体）
 *
 * Phase 1 では sp³ 判定のみ実用。Phase 2 で sp²/sp を有効化、Phase 3
 * でヘテロ原子の孤立電子対カウントを精緻化する。
 */

/** 典型元素の標準価電子数 */
const VALENCE_ELECTRONS = Object.freeze({
  H: 1, C: 4, N: 5, O: 6, F: 7,
  P: 5, S: 6, Cl: 7, Br: 7, I: 7,
  B: 3, Si: 4,
});

/**
 * 1 つの原子について混成状態を判定する。
 *
 * 立体数の計算：
 *   σ結合数      = atom.bonds の長さ（多重結合も 1σ）
 *   結合電子数   = Σ bond.order（多重結合は 2 や 3）
 *   孤立電子対数 = floor((価電子 - 結合電子数 - formal charge補正) / 2)
 *
 * @param {Object} atom 分子グラフの原子オブジェクト
 *   @param {string} atom.element  元素記号
 *   @param {number} [atom.formalCharge] 形式電荷（既定 0）
 *   @param {Array<{other:Object, order:number}>} atom.bonds 結合リスト
 * @returns {'sp'|'sp2'|'sp3'|'sp3d'|'sp3d2'|'none'} 混成状態
 */
export function determineHybridization(atom) {
  const element = atom.element;
  if (element === "H") return "none";

  // 芳香族原子は強制的に sp²（Hückel 4n+2 π による）。
  // 立体数の計算は分数結合次数（1.5）で破綻するため、ここで早期 return する。
  if (atom.aromatic) return "sp2";

  const valence = VALENCE_ELECTRONS[element];
  if (valence === undefined) {
    console.warn(`[hybridization] unknown element "${element}", default sp3`);
    return "sp3";
  }

  const implicitH = atom.implicitHCount ?? 0;
  const sigmaCount = atom.bonds.length + implicitH;
  // 結合次数の合計（中心原子から見た電子使用量）。
  // 暗黙水素は単結合とみなす。
  let bondOrderSum = implicitH;
  for (const b of atom.bonds) bondOrderSum += b.order;

  const formal = atom.formalCharge ?? 0;
  const remaining = valence - formal - bondOrderSum;
  const lonePairs = Math.max(0, Math.floor(remaining / 2));

  const stericNumber = sigmaCount + lonePairs;

  switch (stericNumber) {
    case 2: return "sp";
    case 3: return "sp2";
    case 4: return "sp3";
    case 5: return "sp3d";
    case 6: return "sp3d2";
    default:
      console.warn(`[hybridization] unusual steric number ${stericNumber} for ${element}`);
      return "sp3";
  }
}

/**
 * 原子の孤立電子対数を返す（角度補正で使用）。
 * @param {Object} atom
 * @returns {number} 孤立電子対数（lone pair count）
 */
export function countLonePairs(atom) {
  const element = atom.element;
  if (element === "H") return 0;
  const valence = VALENCE_ELECTRONS[element];
  if (valence === undefined) return 0;
  // 芳香族原子の孤立電子対は π 系への寄与の有無で異なる。
  // 教材として正確な値を出すため、よくある場合だけハードコード。
  if (atom.aromatic) {
    if (element === "C") return 0;
    if (element === "N") {
      // ピリジン型（H なし）→ in-plane lone pair 1、ピロール型（H あり）→ 0
      const hasH = (atom.implicitHCount ?? 0) > 0
        || atom.bonds.some((b) => b.toHydrogen);
      return hasH ? 0 : 1;
    }
    if (element === "O") return 1;  // フラン型：1 つ in-plane、1 つ in π
    if (element === "S") return 1;
  }
  const implicitH = atom.implicitHCount ?? 0;
  let bondOrderSum = implicitH;
  for (const b of atom.bonds) bondOrderSum += b.order;
  const formal = atom.formalCharge ?? 0;
  const remaining = valence - formal - bondOrderSum;
  return Math.max(0, Math.floor(remaining / 2));
}

/**
 * 分子内のすべての重原子について混成を判定し、atom.hybridization に書き込む。
 * 水素には便宜上 'none' を入れる。
 *
 * @param {Object} mol  分子グラフ { atoms: [...], bonds: [...] }
 */
export function annotateHybridizations(mol) {
  for (const atom of mol.atoms) {
    atom.hybridization = determineHybridization(atom);
    atom.lonePairs = countLonePairs(atom);
  }
}
