/**
 * 環テンプレート（ローカル座標）
 *
 * 各テンプレートは「環内 N 原子の相対座標」を巡回順に並べたもの。
 *   - 平面環：xy 平面上の正 N 角形（環中心を原点）
 *   - シクロヘキサン椅子型：上3つ z=+h、下3つ z=-h で交互配置
 *
 * 出典：
 *   - シクロヘキサン椅子型：r²/2 - 4h² = cos(109.47°)·1.54² の連立から
 *     r = 1.452 Å, h = 0.257 Å を導出（全結合角 109.47°、全 C-C = 1.54Å）
 *   - 芳香族環：実測 C-C ≈ 1.40 Å（ベンゼン）、C-N ≈ 1.34 Å（ピリジン）
 *
 * applyRingTemplate(mol, ringAtomIds, template) で原子に座標を書き込む。
 * 縮環の場合は alignRingTemplate(...) で剛体変換してから適用。
 */

/**
 * 正 N 角形の頂点座標を返す（xy 平面、中心原点）。
 * @param {number} n     辺数
 * @param {number} edge  辺長 [Å]
 * @returns {{x,y,z}[]}  N 個の座標配列
 */
function planarNGon(n, edge) {
  const R = edge / (2 * Math.sin(Math.PI / n));
  const coords = [];
  for (let i = 0; i < n; i++) {
    const theta = 2 * Math.PI * i / n;
    coords.push({ x: R * Math.cos(theta), y: R * Math.sin(theta), z: 0 });
  }
  return coords;
}

/**
 * シクロヘキサン椅子型の座標を返す。
 * 6 原子を環中心まわりに 60° 間隔で配置し、z = +h と z = -h を交互に振る。
 * これで全 C-C-C 結合角が 109.47°、全 C-C 距離が 1.54 Å になる。
 */
function chairCyclohexane() {
  const r = 1.452;    // 環中心からの半径
  const h = 0.257;    // 椅子の上下振幅
  const coords = [];
  for (let i = 0; i < 6; i++) {
    const theta = i * Math.PI / 3;
    const z = (i % 2 === 0) ? h : -h;
    coords.push({ x: r * Math.cos(theta), y: r * Math.sin(theta), z });
  }
  return coords;
}

export const RING_TEMPLATES = {
  ring3_sp3:      () => planarNGon(3, 1.51),  // シクロプロパン
  ring4_sp3:      () => planarNGon(4, 1.55),  // シクロブタン（平面近似）
  ring5_sp3:      () => planarNGon(5, 1.55),  // シクロペンタン（平面近似）
  ring6_chair:    () => chairCyclohexane(),   // シクロヘキサン
  ring5_aromatic: () => planarNGon(5, 1.40),  // フラン、ピロール、チオフェン
  ring6_aromatic: () => planarNGon(6, 1.40),  // ベンゼン、ピリジン
};

/**
 * リング原子の構成からテンプレートを選択する。
 *
 * @param {Object[]} atomsInRing  環内原子の配列（順序は問わない）
 * @returns {{x,y,z}[]|null}  選択されたテンプレート座標配列、または null
 */
export function pickTemplate(atomsInRing) {
  const n = atomsInRing.length;
  const allAromatic = atomsInRing.every((a) => a.aromatic);
  const allSp3 = atomsInRing.every((a) => a.hybridization === "sp3");

  if (allAromatic) {
    if (n === 5) return RING_TEMPLATES.ring5_aromatic();
    if (n === 6) return RING_TEMPLATES.ring6_aromatic();
  }
  if (allSp3) {
    if (n === 3) return RING_TEMPLATES.ring3_sp3();
    if (n === 4) return RING_TEMPLATES.ring4_sp3();
    if (n === 5) return RING_TEMPLATES.ring5_sp3();
    if (n === 6) return RING_TEMPLATES.ring6_chair();
  }
  // 混合環（部分芳香、部分 sp3）等：平面 N 角形にフォールバック
  if (n === 5) return RING_TEMPLATES.ring5_aromatic();
  if (n === 6) return RING_TEMPLATES.ring6_aromatic();
  console.warn(`[ring-templates] no template for ${n}-membered ring`);
  return null;
}

/* ─────────── 3D ベクトル演算ヘルパ ─────────── */

const v = (x, y, z) => ({ x, y, z });
const vSub = (a, b) => v(a.x - b.x, a.y - b.y, a.z - b.z);
const vAdd = (a, b) => v(a.x + b.x, a.y + b.y, a.z + b.z);
const vScale = (a, s) => v(a.x * s, a.y * s, a.z * s);
const vDot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const vCross = (a, b) => v(
  a.y * b.z - a.z * b.y,
  a.z * b.x - a.x * b.z,
  a.x * b.y - a.y * b.x,
);
const vLen = (a) => Math.sqrt(vDot(a, a));
const vNorm = (a) => { const L = vLen(a); return L < 1e-9 ? v(1, 0, 0) : vScale(a, 1 / L); };

/** ロドリゲスの回転公式：単位ベクトル axis まわりに angle ラジアン回転 */
function rotateAround(p, axis, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const k = axis;
  const term1 = vScale(p, c);
  const term2 = vScale(vCross(k, p), s);
  const term3 = vScale(k, vDot(k, p) * (1 - c));
  return vAdd(vAdd(term1, term2), term3);
}

function anyPerpendicular(vec) {
  const n = vNorm(vec);
  const helper = Math.abs(n.x) < 0.9 ? v(1, 0, 0) : v(0, 1, 0);
  return vNorm(vCross(n, helper));
}

/**
 * 環テンプレートを分子に適用する。
 * 共有原子（すでに位置が決まっている原子）がある場合はリジッド変換で位置を合わせる。
 *
 * @param {Object} mol           分子グラフ
 * @param {number[]} ringAtomIds 環原子の id 配列（巡回順）
 * @param {{x,y,z}[]} template   テンプレート座標（巡回順、ringAtomIds と同順）
 */
export function applyRingTemplate(mol, ringAtomIds, template) {
  if (ringAtomIds.length !== template.length) {
    throw new Error(
      `[ring-templates] ring size mismatch: ${ringAtomIds.length} atoms vs ${template.length} template positions`,
    );
  }

  // 既配置（共有）原子を見つける
  const sharedIdx = [];
  for (let i = 0; i < ringAtomIds.length; i++) {
    if (mol.atoms[ringAtomIds[i]].position !== undefined) sharedIdx.push(i);
  }

  if (sharedIdx.length === 0) {
    // 単環 — そのままテンプレート座標をコピー
    for (let i = 0; i < ringAtomIds.length; i++) {
      mol.atoms[ringAtomIds[i]].position = { ...template[i] };
    }
    return;
  }

  if (sharedIdx.length === 1) {
    // 1原子共有：平行移動のみ
    const i = sharedIdx[0];
    const realP = mol.atoms[ringAtomIds[i]].position;
    const offset = vSub(realP, template[i]);
    for (let k = 0; k < ringAtomIds.length; k++) {
      if (k === i) continue;
      mol.atoms[ringAtomIds[k]].position = vAdd(template[k], offset);
    }
    return;
  }

  // 2 原子以上共有：剛体変換（平行移動 + 回転）
  const i = sharedIdx[0];
  const j = sharedIdx[1];
  const t_i = template[i];
  const t_j = template[j];
  const p_i = mol.atoms[ringAtomIds[i]].position;
  const p_j = mol.atoms[ringAtomIds[j]].position;

  // 1) Template を t_i が原点になるよう平行移動
  const translated = template.map((t) => vSub(t, t_i));

  // 2) (t_j - t_i) を (p_j - p_i) に重ねる回転
  const v_t = vSub(t_j, t_i);
  const v_p = vSub(p_j, p_i);
  const axisRaw = vCross(v_t, v_p);
  const axisLen = vLen(axisRaw);

  let rotated;
  if (axisLen < 1e-9) {
    const dotTP = vDot(v_t, v_p);
    if (dotTP >= 0) {
      rotated = translated;  // 同方向 → 回転不要
    } else {
      // 反平行 → 180° 反転（任意の垂直軸まわり）
      const perp = anyPerpendicular(v_t);
      rotated = translated.map((p) => rotateAround(p, perp, Math.PI));
    }
  } else {
    const axisN = vScale(axisRaw, 1 / axisLen);
    const cosA = vDot(v_t, v_p) / (vLen(v_t) * vLen(v_p));
    const angle = Math.acos(Math.max(-1, Math.min(1, cosA)));
    rotated = translated.map((p) => rotateAround(p, axisN, angle));
  }

  // 3) p_i に平行移動
  const finalCoords = rotated.map((p) => vAdd(p, p_i));

  // 適用（共有原子はそのまま、新規原子のみ位置設定）
  for (let k = 0; k < ringAtomIds.length; k++) {
    if (mol.atoms[ringAtomIds[k]].position !== undefined) continue;
    mol.atoms[ringAtomIds[k]].position = finalCoords[k];
  }
}
