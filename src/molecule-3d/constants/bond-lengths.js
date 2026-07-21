/**
 * 共有結合長テーブル（単位：Å オングストローム）
 *
 * 出典：気相電子回折・X 線結晶構造解析の代表値
 * （CRC Handbook of Chemistry and Physics, Allen et al. (1987), 等）
 *
 * テーブル構造：BOND_LENGTHS[elementPair][bondKey]
 *   elementPair: 元素を辞書順にソートし "-" で連結（"C-C", "C-H", "Br-C" 等）
 *   bondKey:     "sp3-sp3-1" のように「混成A-混成B-結合次数」
 *                混成を区別する必要のない場合や H 等は "_" を使う
 *
 * ハイブリッドのソート順序は elementPair に合わせる。lookup 内で逆順も試行する。
 */
export const BOND_LENGTHS = Object.freeze({
  /* ── 炭素同士 ───────────────────────────────── */
  "C-C": {
    "sp3-sp3-1": 1.54,
    "sp3-sp2-1": 1.50,
    "sp2-sp2-1": 1.47,   // 共役単結合（ブタジエン中央）
    "sp2-sp2-2": 1.34,   // C=C 二重結合
    "sp2-sp2-1.5": 1.40, // 芳香族 C-C（ベンゼン）
    "sp-sp-3": 1.20,     // C≡C 三重結合
    "sp2-sp-1": 1.43,    // sp²-sp 単結合
    "sp3-sp-1": 1.46,    // sp³-sp 単結合
    "sp2-sp-2": 1.31,    // cumulene 中央
    "sp-sp-1": 1.38,
  },

  /* ── 炭素-水素 ───────────────────────────────── */
  "C-H": {
    "sp3-_-1": 1.09,
    "sp2-_-1": 1.08,
    "sp-_-1":  1.06,
  },

  /* ── 炭素-酸素 ───────────────────────────────── */
  "C-O": {
    "sp3-sp3-1": 1.43,   // メタノール、エーテル
    "sp2-sp3-1": 1.34,   // カルボン酸の C-O(H)、エステル
    "sp2-sp2-1.5": 1.36, // 芳香族 C-O (furan)
    "sp2-sp2-2": 1.23,   // ケトン・アルデヒドの C=O
    "sp-sp2-2":  1.16,   // CO₂ の C=O
    "sp-sp-3":   1.13,   // CO（一酸化炭素）
  },

  /* ── 炭素-窒素 ───────────────────────────────── */
  "C-N": {
    "sp3-sp3-1": 1.47,   // アミン
    "sp2-sp3-1": 1.35,   // アミド共役
    "sp2-sp2-1": 1.40,   // アニリン類
    "sp2-sp2-1.5": 1.34, // 芳香族 C=N (pyridine)
    "sp2-sp2-2": 1.28,   // イミン
    "sp-sp-3":   1.16,   // ニトリル
  },

  /* ── 炭素-硫黄 ───────────────────────────────── */
  "C-S": {
    "sp3-sp3-1": 1.82,   // チオール、スルフィド
    "sp2-sp2-2": 1.61,   // チオカルボニル
  },

  /* ── 炭素-ハロゲン ───────────────────────────────── */
  "C-F":  { "sp3-_-1": 1.35, "sp2-_-1": 1.34 },
  "C-Cl": { "sp3-_-1": 1.77, "sp2-_-1": 1.74 },
  "Br-C": { "_-sp3-1": 1.94, "_-sp2-1": 1.89 },
  "C-I":  { "sp3-_-1": 2.14, "sp2-_-1": 2.08 },

  /* ── 水素-ヘテロ原子 ───────────────────────────────── */
  "H-O": { "_-sp3-1": 0.96 },
  "H-N": { "_-sp3-1": 1.01, "_-sp2-1": 1.01 },
  "H-S": { "_-sp3-1": 1.34 },
  "F-H": { "_-_-1": 0.92 },

  /* ── ヘテロ-ヘテロ ───────────────────────────────── */
  "N-O": {
    "sp3-sp3-1": 1.40,
    "sp2-sp2-2": 1.22,
    "sp2-sp3-1": 1.21,    // ニトロ N-O (formal charged)
    "sp3-sp3-2": 1.21,    // ニトロ群（イオン的）
  },
  "O-O": { "sp3-sp3-1": 1.48 },
  "N-N": { "sp3-sp3-1": 1.45, "sp2-sp2-2": 1.24, "sp2-sp2-1.5": 1.30, "sp2-sp2-1": 1.42 },
  "S-S": { "sp3-sp3-1": 2.05 },
  // 硫黄酸化物（スルホン基、スルホン酸、硫酸エステル等）
  "O-S": {
    "sp3-sp3-1": 1.57,    // S-O-H / S-O-C 単結合
    "sp2-sp3-1": 1.57,
    "sp3-sp3-2": 1.43,    // S=O（スルホニル）
    "sp2-sp2-2": 1.43,
    "sp3-sp2-2": 1.43,
    "_-_-2":     1.43,    // 雑多な S=O のフォールバック
  },
});

/**
 * 結合長を引く。
 *
 * @param {string} elementA   元素記号（"C", "Cl" など）
 * @param {string} elementB
 * @param {string} hybA       原子A の混成（'sp3' | 'sp2' | 'sp' | '_'）
 * @param {string} hybB
 * @param {number} bondOrder  結合次数（1, 2, 3, 1.5(芳香) ）
 * @returns {number} 結合長（Å）
 */
export function lookupBondLength(elementA, elementB, hybA, hybB, bondOrder) {
  // H など混成を持たない原子は "_" として扱う
  const normalize = (h) => (h === "none" || h === undefined || h === null) ? "_" : h;
  const sorted = [elementA, elementB].slice().sort();
  const pair = sorted.join("-");
  const table = BOND_LENGTHS[pair];
  if (!table) {
    console.warn(`[bond-lengths] no entry for pair "${pair}", fallback 1.5 Å`);
    return 1.5;
  }
  const elementAIsFirstSorted = sorted[0] === elementA;
  const [hA, hB] = elementAIsFirstSorted
    ? [normalize(hybA), normalize(hybB)]
    : [normalize(hybB), normalize(hybA)];

  // 1) 完全一致（芳香族 1.5 も含む）
  const direct = table[`${hA}-${hB}-${bondOrder}`];
  if (direct !== undefined) return direct;
  const swapped = table[`${hB}-${hA}-${bondOrder}`];
  if (swapped !== undefined) return swapped;

  // 2) 芳香族 (1.5) の場合は二重結合長にフォールバック
  if (bondOrder === 1.5) {
    const fb = table[`${hA}-${hB}-2`] ?? table[`${hB}-${hA}-2`];
    if (fb !== undefined) return fb;
  }

  // 3) ハイブリッド非依存キー
  const anyAny = table[`_-_-${bondOrder}`];
  if (anyAny !== undefined) return anyAny;

  // 4) 同じ結合次数（整数）の任意のキー
  const targetOrder = bondOrder === 1.5 ? 2 : bondOrder;
  for (const key of Object.keys(table)) {
    if (key.endsWith(`-${targetOrder}`)) return table[key];
  }

  // 5) 最後の手段：テーブル先頭
  const firstKey = Object.keys(table)[0];
  if (firstKey) {
    console.warn(`[bond-lengths] fallback for ${pair} ${hA}-${hB}-${bondOrder} → ${firstKey}`);
    return table[firstKey];
  }
  return 1.5;
}
