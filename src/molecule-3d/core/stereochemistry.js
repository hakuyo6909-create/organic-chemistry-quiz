/**
 * 立体化学処理（Phase 6）
 *
 * 役割：
 *   1) 不斉中心の絶対立体配置（@/@@）と 3D 座標の整合チェック
 *   2) 不一致時は軽い置換基（H）の鏡像反射で修正
 *   3) C=C 周りの E/Z 配置（/ \）と dihedral の整合チェック
 *   4) 不一致時は二重結合軸まわりに片側部分木を 180° 回転で修正
 *
 * 化学法則：
 *   - SMILES @  ：CCW（反時計回り）, 4 隣接 SMILES 順で先頭背面から見て残り 3 が CCW
 *   - SMILES @@：CW
 *   - 符号付き四面体体積 V = (n₁-n₀)·((n₂-n₀)×(n₃-n₀)) で判定
 *      V > 0 ↔ CCW (@)
 *      V < 0 ↔ CW  (@@)
 *   - E/Z：両端の /\ が同じ → trans (E)、異なる → cis (Z)
 */

/* ─────────── ベクトル演算 ─────────── */
const v = (x, y, z) => ({ x, y, z });
const vAdd = (a, b) => v(a.x + b.x, a.y + b.y, a.z + b.z);
const vSub = (a, b) => v(a.x - b.x, a.y - b.y, a.z - b.z);
const vScale = (a, s) => v(a.x * s, a.y * s, a.z * s);
const vDot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const vCross = (a, b) => v(
  a.y * b.z - a.z * b.y,
  a.z * b.x - a.x * b.z,
  a.x * b.y - a.y * b.x,
);
const vLen = (a) => Math.sqrt(vDot(a, a));
const vNorm = (a) => { const L = vLen(a); return L < 1e-12 ? v(1, 0, 0) : vScale(a, 1 / L); };

function rotateAround(p, axisOrigin, axisDir, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const rel = vSub(p, axisOrigin);
  const k = axisDir;
  const term1 = vScale(rel, c);
  const term2 = vScale(vCross(k, rel), s);
  const term3 = vScale(k, vDot(k, rel) * (1 - c));
  return vAdd(axisOrigin, vAdd(vAdd(term1, term2), term3));
}

/* ─────────── キラリティ ─────────── */

/**
 * 中心原子の 4 個の隣接原子を SMILES 順で取得する。
 * SMILES 順：[prev_atom, implicit_H?, next1, next2, ...]
 *
 * 暗黙 H は SMILES 中で `[C@H]` のように原子の直後に来るため、SMILES 順序では
 * smilesPrevId の直後に挿入する。
 *
 * @param {Object} mol     分子グラフ
 * @param {Object} atom    キラリティを持つ原子
 * @returns {number[]|null}  SMILES 順の隣接原子 id 配列（4 つ）、不可なら null
 */
function getSmilesNeighborOrder(mol, atom) {
  if (!atom.chirality) return null;
  const order = [];
  if (atom.smilesPrevId !== null && atom.smilesPrevId !== undefined) {
    order.push(atom.smilesPrevId);
  }
  // 暗黙 H を SMILES 順に挿入（prev の直後）
  const hNeighbors = atom.bonds
    .filter((b) => mol.atoms[b.otherId].element === "H")
    .map((b) => b.otherId);
  for (const h of hNeighbors) order.push(h);
  // smilesNextIds（ブラケット後の隣接）を追加
  if (atom.smilesNextIds) {
    for (const id of atom.smilesNextIds) order.push(id);
  }
  if (order.length !== 4) return null;
  return order;
}

/**
 * 4 隣接の符号付き四面体体積を計算する。
 *   V = (p1 - p0) · ((p2 - p0) × (p3 - p0))
 * 規約：V > 0 ↔ SMILES @ (CCW)、V < 0 ↔ SMILES @@ (CW)
 */
function tetrahedralVolume(p0, p1, p2, p3) {
  const a = vSub(p1, p0);
  const b = vSub(p2, p0);
  const c = vSub(p3, p0);
  return vDot(a, vCross(b, c));
}

/**
 * H を他 3 隣接が成す平面で鏡像反射してキラリティを反転する。
 * 部分木が単純（H は他のヘテロ原子に接続していない）のため、安全な操作。
 *
 * @param {Object} mol       分子グラフ
 * @param {number[]} smilesOrder  SMILES 順 4 隣接 id
 * @returns {boolean}  反転に成功したか
 */
function flipChiralityByHReflection(mol, smilesOrder) {
  // H 隣接を探す
  let hIdx = -1;
  for (let k = 0; k < 4; k++) {
    if (mol.atoms[smilesOrder[k]].element === "H") { hIdx = k; break; }
  }
  if (hIdx === -1) return false;

  const others = [];
  for (let k = 0; k < 4; k++) {
    if (k !== hIdx) others.push(mol.atoms[smilesOrder[k]].position);
  }
  const [p1, p2, p3] = others;
  const normal = vNorm(vCross(vSub(p2, p1), vSub(p3, p1)));
  const hAtom = mol.atoms[smilesOrder[hIdx]];
  const d = vDot(vSub(hAtom.position, p1), normal);
  hAtom.position = vSub(hAtom.position, vScale(normal, 2 * d));
  return true;
}

/**
 * 分子内のすべてのキラリティ中心について、SMILES 指定と座標を整合させる。
 *
 * @param {Object} mol  分子グラフ
 * @returns {{checked: number, flipped: number}}
 */
export function verifyChirality(mol) {
  let checked = 0, flipped = 0;
  for (const atom of mol.atoms) {
    if (!atom.chirality) continue;
    const order = getSmilesNeighborOrder(mol, atom);
    if (!order) continue;
    checked++;
    const positions = order.map((id) => mol.atoms[id].position);
    const V = tetrahedralVolume(...positions);
    const actualChirality = V > 0 ? "CCW" : "CW";
    if (actualChirality !== atom.chirality) {
      if (flipChiralityByHReflection(mol, order)) flipped++;
    }
  }
  return { checked, flipped };
}

/* ─────────── E/Z 二重結合 ─────────── */

/**
 * 二面角 (deg) を計算する（pA-pB-pC-pD）。
 */
function dihedralDeg(pA, pB, pC, pD) {
  const b1 = vSub(pB, pA);
  const b2 = vSub(pC, pB);
  const b3 = vSub(pD, pC);
  const n1 = vCross(b1, b2);
  const n2 = vCross(b2, b3);
  const m1 = vCross(n1, vNorm(b2));
  const x = vDot(n1, n2);
  const y = vDot(m1, n2);
  return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * C=C 二重結合の両端から、direction が付いた single bond を 1 本ずつ探す。
 * 両端の direction が同じ ↔ trans (E)、異なる ↔ cis (Z)。
 *
 * @param {Object} mol  分子グラフ
 * @returns {{checked: number, flipped: number}}
 */
export function verifyDoubleBondStereo(mol) {
  let checked = 0, flipped = 0;
  for (const bond of mol.bonds) {
    if (bond.order !== 2) continue;
    const A = mol.atoms[bond.a], B = mol.atoms[bond.b];
    // A の隣接で upAtomId を持つもの（B 以外）
    const aDirBond = A.bonds.find((bb) => bb.otherId !== B.id && bb.upAtomId != null);
    const bDirBond = B.bonds.find((bb) => bb.otherId !== A.id && bb.upAtomId != null);
    if (!aDirBond || !bDirBond) continue;
    checked++;

    // 規約：trans (E) ⇔ A と B の「up 状態」が互いに逆
    //   A 側で A が up かどうか = (aDirBond.upAtomId === A.id)
    //   B 側で B が up かどうか = (bDirBond.upAtomId === B.id)
    //   両者が異なる → 隣接 X と Y が C=C の反対側 → trans (E)
    const isAUp = aDirBond.upAtomId === A.id;
    const isBUp = bDirBond.upAtomId === B.id;
    const expectedTrans = isAUp !== isBUp;

    const aRefAtom = mol.atoms[aDirBond.otherId];
    const bRefAtom = mol.atoms[bDirBond.otherId];
    const dih = Math.abs(dihedralDeg(aRefAtom.position, A.position, B.position, bRefAtom.position));
    const actualTrans = dih > 90;

    if (actualTrans !== expectedTrans) {
      rotateBranchAroundAxis(mol, A.id, B.id, Math.PI);
      flipped++;
    }
  }
  return { checked, flipped };
}

/**
 * 二重結合軸 A-B のまわりに、B 側の連結部分木全体を angle ラジアン回転する。
 * A は固定。BFS で B から連結する原子を集めて回転。
 *
 * @param {Object} mol      分子グラフ
 * @param {number} aId      軸の起点（固定側）
 * @param {number} bId      軸の終点（回転起点）
 * @param {number} angle    回転角 [rad]
 */
function rotateBranchAroundAxis(mol, aId, bId, angle) {
  const pA = mol.atoms[aId].position;
  const pB = mol.atoms[bId].position;
  const axis = vNorm(vSub(pB, pA));

  // BFS で B 側の部分木を収集（A を渡らない）
  const visited = new Set([aId, bId]);
  const queue = [bId];
  const branch = [bId];
  while (queue.length > 0) {
    const cur = queue.shift();
    for (const b of mol.atoms[cur].bonds) {
      if (visited.has(b.otherId)) continue;
      visited.add(b.otherId);
      queue.push(b.otherId);
      branch.push(b.otherId);
    }
  }

  // 部分木の各原子を A まわりに回転
  for (const id of branch) {
    if (id === bId) continue;  // B 自体は軸上なので動かさない
    mol.atoms[id].position = rotateAround(mol.atoms[id].position, pA, axis, angle);
  }
}

/**
 * 立体化学全体の検証と修正を実行する。
 *
 * @param {Object} mol  分子グラフ
 * @returns {{chirality: {checked, flipped}, stereo: {checked, flipped}}}
 */
export function verifyStereochemistry(mol) {
  const chirality = verifyChirality(mol);
  const stereo = verifyDoubleBondStereo(mol);
  return { chirality, stereo };
}

/**
 * 軸不斉（biaryl 系）を chiralityHint に従って付与する。
 * SMILES に立体記号がなくても、分子 ID 由来の R/S ヒントから二面角を回転で設定する。
 *
 * - "R" ヒント: biaryl 結合の二面角を約 +90° (or -90°、CIP に依存) に
 * - "S" ヒント: 反対方向
 *
 * Phase 8D minimum: 簡易版として、R → 軸まわり +90°, S → -90° を適用。
 * 真の (R)/(S) 命名は CIP 順位を計算する必要があるが、ここでは Build-up 由来の
 * 同一構造に「ねじれを与える」目的で使用。
 *
 * @param {Object} mol
 * @param {"R"|"S"|null} hint
 * @returns {{applied: number, biarylBonds: number}}
 */
export function applyAxialChirality(mol, hint) {
  if (!hint) return { applied: 0, biarylBonds: 0 };
  const biarylBonds = findBiarylBonds(mol);
  if (biarylBonds.length === 0) return { applied: 0, biarylBonds: 0 };

  // 各 biaryl 結合まわりに ±90° 回転
  const targetDihedral = hint === "R" ? Math.PI / 2 : -Math.PI / 2;
  // Build-up が両環を coplanar にしている前提（dihedral ≈ 0 or π）→ 90° 増分でねじり付与
  for (const bond of biarylBonds) {
    rotateBranchAroundAxis(mol, bond.a, bond.b, targetDihedral);
  }
  return { applied: biarylBonds.length, biarylBonds: biarylBonds.length };
}

/**
 * 環外で「2 つの異なる芳香環をつなぐ単結合」を検出する。
 * 両端の原子が（aromatic な）異なる環に属していれば biaryl 結合。
 */
function findBiarylBonds(mol) {
  // 各原子が属する環を逆引きするマップを作る（既配置の環情報が必要）
  // ringAtomSet: 各原子が含まれる環セットの ID リスト
  // 簡易：原子が環内（aromatic）かどうかだけ判定 + 結合の両端が異なる「環単位」に属するか
  const result = [];
  for (const bond of mol.bonds) {
    if (bond.order !== 1) continue;
    const A = mol.atoms[bond.a], B = mol.atoms[bond.b];
    if (!A.aromatic || !B.aromatic) continue;
    // 同じ環内（あるいは縮環でつながる連結環）なら biaryl ではない
    // 判定：A の隣接環内原子集合と B の隣接環内原子集合が共通要素を持たないか
    if (!sharesRing(mol, A.id, B.id)) {
      result.push({ a: A.id, b: B.id });
    }
  }
  return result;
}

/** 2 つの原子が同じ環（または縮環で連結）に属するかを BFS で判定 */
function sharesRing(mol, aId, bId) {
  // A から「芳香族原子のみ」を辿って B に到達できるか（aId-bId のボンドを通らずに）
  const visited = new Set([aId]);
  const queue = [aId];
  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur === bId) return true;
    for (const b of mol.atoms[cur].bonds) {
      if (visited.has(b.otherId)) continue;
      // bond a-b 自体は通過しない
      if ((cur === aId && b.otherId === bId) || (cur === bId && b.otherId === aId)) continue;
      const next = mol.atoms[b.otherId];
      if (!next.aromatic) continue;  // 芳香族グラフ内のみ伝播
      visited.add(b.otherId);
      queue.push(b.otherId);
    }
  }
  return false;
}
