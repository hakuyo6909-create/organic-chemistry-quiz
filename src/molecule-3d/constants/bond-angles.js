/**
 * 理想結合角テーブル（単位：度）
 *
 * VSEPR 理論および混成軌道理論に基づく代表値。
 * 孤立電子対による「圧縮」は、化合物ごとの「現実値」として
 * idealBondAngle() の atomContext 引数で補正する。
 *
 * Phase 1 では sp³（109.47°）のみ使用。Phase 3 で H2O・NH3 の
 * 実測角度（104.5° / 107°）の補正分岐を有効化する。
 */

/** VSEPR 理想角（孤立電子対の効果を除く） */
export const VSEPR_IDEAL_ANGLES = Object.freeze({
  sp3: 109.47122063449069,
  sp2: 120.0,
  sp: 180.0,
  sp3d: 90.0,
  sp3d2: 90.0,
});

/**
 * 孤立電子対による圧縮補正後の「現実」結合角（教材値）
 * key: `${element}-${hyb}-${sigmaCount}-${lonePairCount}`
 *
 * 出典：気相マイクロ波分光等の実測値
 *   H2O: 104.5°,  NH3: 107.0°,  H2S: 92.0°
 */
export const REALISTIC_ANGLES = Object.freeze({
  "O-sp3-2-2": 104.5,
  "N-sp3-3-1": 107.0,
  "S-sp3-2-2": 92.0,
});

/**
 * 中心原子の混成（および任意で原子コンテキスト）から理想結合角を返す。
 *
 * @param {string} hybridization 'sp3' | 'sp2' | 'sp' | 'sp3d' | 'sp3d2'
 * @param {Object} [atomContext] { element, sigmaCount, lonePairCount } を渡すと
 *                                孤立電子対による圧縮を反映した「現実値」を返す
 * @returns {number} 結合角（度）
 */
export function idealBondAngle(hybridization, atomContext = null) {
  if (atomContext) {
    const { element, sigmaCount, lonePairCount } = atomContext;
    const key = `${element}-${hybridization}-${sigmaCount}-${lonePairCount}`;
    if (REALISTIC_ANGLES[key] !== undefined) return REALISTIC_ANGLES[key];
  }
  const angle = VSEPR_IDEAL_ANGLES[hybridization];
  if (angle === undefined) {
    console.warn(`[bond-angles] unknown hybridization "${hybridization}"`);
    return 109.47;
  }
  return angle;
}

/** 度→ラジアン変換のヘルパー */
export const DEG_TO_RAD = Math.PI / 180;
/** ラジアン→度変換のヘルパー */
export const RAD_TO_DEG = 180 / Math.PI;
