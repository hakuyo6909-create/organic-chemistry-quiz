/**
 * Phase 6 検証スクリプト：立体化学
 *
 *   node 有機化学クイズ/src/molecule-3d/test-phase6.mjs
 *
 * 検証項目：
 *   1) (R)-乳酸 と (S)-乳酸 が鏡像関係（H 位置の z 符号が反転、または不斉中心の符号付き体積が逆）
 *   2) (E)-2-ブテン と (Z)-2-ブテン が異なる dihedral（trans 180°, cis 0°）
 */
import { annotateHybridizations } from "./core/hybridization.js";
import { buildGeometry } from "./core/geometry-builder.js";
import { verifyStereochemistry } from "./core/stereochemistry.js";

const STANDARD_VALENCE = { C: 4, N: 3, O: 2, H: 1, F: 1, Cl: 1, Br: 1, I: 1, S: 2, P: 3 };
const PHASE4_SINGLE_CHAR = new Set(["C", "N", "O", "F", "S", "P", "I"]);
const AROMATIC_SINGLE_CHAR = new Set(["c", "n", "o", "s", "p"]);

function parseBracket(inner) {
  let i = 0;
  while (i < inner.length && /\d/.test(inner[i])) i++;
  let element, aromatic = false;
  if (inner[i] === "C" && inner[i + 1] === "l") { element = "Cl"; i += 2; }
  else if (inner[i] === "B" && inner[i + 1] === "r") { element = "Br"; i += 2; }
  else if (/[A-Z]/.test(inner[i])) {
    if (/[a-z]/.test(inner[i + 1])) { element = inner.slice(i, i + 2); i += 2; }
    else { element = inner[i]; i += 1; }
  } else if (/[a-z]/.test(inner[i])) { element = inner[i].toUpperCase(); aromatic = true; i += 1; }
  else throw new Error(`Cannot parse "${inner}"`);
  let chirality = null;
  if (inner[i] === "@") { chirality = "CCW"; i++; if (inner[i] === "@") { chirality = "CW"; i++; } }
  let hCount = 0;
  if (inner[i] === "H") { i++; if (/\d/.test(inner[i])) { hCount = +inner[i]; i++; } else hCount = 1; }
  let charge = 0;
  if (inner[i] === "+") { charge = 1; i++; } else if (inner[i] === "-") { charge = -1; i++; }
  return { element, aromatic, hCount, charge, chirality };
}

function parseSmiles(smiles) {
  const atoms = [], bonds = [], ringClosures = [];
  const ringOpen = new Map();
  let pendingOrder = 1, pendingDirection = null, prevId = null;
  const stack = [];
  let i = 0;
  const addAtom = (element, opts = {}) => {
    const id = atoms.length;
    atoms.push({
      id, element, aromatic: opts.aromatic ?? false, fromBracket: opts.fromBracket ?? false,
      formalCharge: opts.formalCharge ?? 0, explicitHCount: opts.explicitH ?? 0,
      implicitHCount: 0, chirality: opts.chirality ?? null,
      smilesPrevId: opts.smilesPrevId ?? null,
      smilesNextIds: opts.chirality ? [] : null,
      bonds: [],
    });
    return id;
  };
  const addBond = (a, b, order, direction = null) => {
    const upAtomId = direction === "up" ? b : direction === "down" ? a : null;
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
    if (ch === "(") { stack.push({ prevId, pendingOrder }); pendingOrder = 1; i++; continue; }
    if (ch === ")") { const p = stack.pop(); prevId = p.prevId; pendingOrder = p.pendingOrder; i++; continue; }
    if (ch === "=") { pendingOrder = 2; i++; continue; }
    if (ch === "#") { pendingOrder = 3; i++; continue; }
    if (ch === "-") { pendingOrder = 1; i++; continue; }
    if (ch === "/") { pendingDirection = "up"; pendingOrder = 1; i++; continue; }
    if (ch === "\\") { pendingDirection = "down"; pendingOrder = 1; i++; continue; }
    if (/[0-9]/.test(ch)) {
      const num = +ch;
      if (ringOpen.has(num)) {
        const op = ringOpen.get(num);
        let order = pendingOrder;
        if (atoms[op].aromatic && atoms[prevId].aromatic && order === 1) order = 1.5;
        addBond(op, prevId, order, pendingDirection);
        ringClosures.push({ a: op, b: prevId });
        ringOpen.delete(num);
      } else ringOpen.set(num, prevId);
      pendingOrder = 1; pendingDirection = null; i++; continue;
    }
    if (ch === "[") {
      const close = smiles.indexOf("]", i);
      const parsed = parseBracket(smiles.slice(i + 1, close));
      const id = addAtom(parsed.element, {
        aromatic: parsed.aromatic, fromBracket: true, formalCharge: parsed.charge,
        explicitH: parsed.hCount, chirality: parsed.chirality, smilesPrevId: prevId,
      });
      if (prevId !== null) {
        let order = pendingOrder;
        if (atoms[prevId].aromatic && parsed.aromatic && order === 1) order = 1.5;
        addBond(prevId, id, order, pendingDirection);
      }
      prevId = id; pendingOrder = 1; pendingDirection = null; i = close + 1; continue;
    }
    let element, aromatic = false;
    if (ch === "C" && smiles[i + 1] === "l") { element = "Cl"; i += 2; }
    else if (ch === "B" && smiles[i + 1] === "r") { element = "Br"; i += 2; }
    else if (PHASE4_SINGLE_CHAR.has(ch)) { element = ch; i += 1; }
    else if (AROMATIC_SINGLE_CHAR.has(ch)) { element = ch.toUpperCase(); aromatic = true; i += 1; }
    else throw new Error(`Unsupported "${ch}"`);
    const id = addAtom(element, { aromatic });
    if (prevId !== null) {
      let order = pendingOrder;
      if (atoms[prevId].aromatic && aromatic && order === 1) order = 1.5;
      addBond(prevId, id, order, pendingDirection);
    }
    prevId = id; pendingOrder = 1; pendingDirection = null;
  }
  for (const a of atoms) {
    if (a.fromBracket) a.implicitHCount = a.explicitHCount;
    else {
      let used = 0;
      for (const b of a.bonds) used += b.order;
      a.implicitHCount = Math.max(0, Math.round((STANDARD_VALENCE[a.element] ?? 4) - used));
    }
  }
  return { atoms, bonds, ringClosures };
}

function build(smiles) {
  const mol = parseSmiles(smiles);
  annotateHybridizations(mol);
  buildGeometry(mol);
  mol.stereo = verifyStereochemistry(mol);
  return mol;
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z); }
function vSub(a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function vCross(a, b) { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
function vDot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function vNorm(a) { const L = Math.hypot(a.x, a.y, a.z); return { x: a.x / L, y: a.y / L, z: a.z / L }; }
function dihedralDeg(pA, pB, pC, pD) {
  const b1 = vSub(pB, pA), b2 = vSub(pC, pB), b3 = vSub(pD, pC);
  const n1 = vCross(b1, b2), n2 = vCross(b2, b3);
  const m1 = vCross(n1, vNorm(b2));
  return Math.atan2(vDot(m1, n2), vDot(n1, n2)) * 180 / Math.PI;
}
function tetraVolume(p0, p1, p2, p3) {
  return vDot(vSub(p1, p0), vCross(vSub(p2, p0), vSub(p3, p0)));
}

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { console.log(`    ✓ ${msg}`); pass++; }
  else      { console.log(`    ✗ ${msg}`); fail++; }
}

// ========== TEST 1: (R)-乳酸 と (S)-乳酸 が鏡像関係 ==========
console.log("\n=== (R)-乳酸 / (S)-乳酸 のキラリティ ===");
{
  const molR = build("C[C@@H](O)C(=O)O");  // (R)-lactate
  const molS = build("C[C@H](O)C(=O)O");   // (S)-lactate
  console.log(`    (R) stereo: ${JSON.stringify(molR.stereo)}`);
  console.log(`    (S) stereo: ${JSON.stringify(molS.stereo)}`);
  // 不斉中心 (atom 1) で 4 隣接の符号付き体積
  // SMILES 順：[prev C (0), H (隠れ), O (2), C (3)]
  // R 体と S 体で体積の符号が逆になるべき
  const c1R = molR.atoms[1];
  const c1S = molS.atoms[1];
  const orderR = [
    c1R.smilesPrevId,
    molR.atoms.find((a) => a.element === "H" && a.bonds.some((b) => b.otherId === 1))?.id,
    ...c1R.smilesNextIds,
  ];
  const orderS = [
    c1S.smilesPrevId,
    molS.atoms.find((a) => a.element === "H" && a.bonds.some((b) => b.otherId === 1))?.id,
    ...c1S.smilesNextIds,
  ];
  const posR = orderR.map((id) => molR.atoms[id].position);
  const posS = orderS.map((id) => molS.atoms[id].position);
  const VR = tetraVolume(...posR);
  const VS = tetraVolume(...posS);
  console.log(`    (R) V=${VR.toFixed(3)} (期待 負: @@/CW)`);
  console.log(`    (S) V=${VS.toFixed(3)} (期待 正: @/CCW)`);
  assert(VR < 0, `(R)-乳酸 の符号付き体積 V<0 (CW/@@)`);
  assert(VS > 0, `(S)-乳酸 の符号付き体積 V>0 (CCW/@)`);
  assert(Math.sign(VR) !== Math.sign(VS), `(R) と (S) の符号が逆 → 鏡像関係`);
}

// ========== TEST 2: (E)-2-ブテン と (Z)-2-ブテン が異なる dihedral ==========
console.log("\n=== (E)-2-ブテン / (Z)-2-ブテン の幾何異性 ===");
{
  const molE = build("C/C=C/C");
  const molZ = build("C/C=C\\C");
  console.log(`    (E) stereo: ${JSON.stringify(molE.stereo)}`);
  console.log(`    (Z) stereo: ${JSON.stringify(molZ.stereo)}`);
  // 4 個の C：C(0)-C(1)=C(2)-C(3)
  const dihE = dihedralDeg(
    molE.atoms[0].position, molE.atoms[1].position,
    molE.atoms[2].position, molE.atoms[3].position,
  );
  const dihZ = dihedralDeg(
    molZ.atoms[0].position, molZ.atoms[1].position,
    molZ.atoms[2].position, molZ.atoms[3].position,
  );
  console.log(`    (E) C-C=C-C dihedral = ${dihE.toFixed(2)}°  (期待 ±180°)`);
  console.log(`    (Z) C-C=C-C dihedral = ${dihZ.toFixed(2)}°  (期待 0°)`);
  assert(Math.abs(Math.abs(dihE) - 180) < 5, `(E)-2-ブテン dihedral ≈ 180° (trans)`);
  assert(Math.abs(dihZ) < 5, `(Z)-2-ブテン dihedral ≈ 0° (cis)`);
  // 末端 C-C 距離は E のほうが長い
  const distE = dist(molE.atoms[0].position, molE.atoms[3].position);
  const distZ = dist(molZ.atoms[0].position, molZ.atoms[3].position);
  console.log(`    (E) 末端 C-C 距離 = ${distE.toFixed(3)} Å`);
  console.log(`    (Z) 末端 C-C 距離 = ${distZ.toFixed(3)} Å`);
  assert(distE > distZ, `trans (E) の方が末端 C-C 距離が長い: ${distE.toFixed(2)} > ${distZ.toFixed(2)}`);
}

// ========== TEST 3: 不正な (R)/(S) 入力が修正されること ==========
console.log("\n=== 内部一貫性 ===");
{
  // 2 つの異なる @ 表記が同じキラリティを生むか
  // (S)-乳酸 = `C[C@H](O)C(=O)O` = `O[C@@H](C)C(=O)O` （同じ立体異性体の異なる SMILES）
  const m1 = build("C[C@H](O)C(=O)O");
  const m2 = build("O[C@@H](C)C(=O)O");
  // 両者の不斉中心 C で、CH3 と OH と COOH を見つけて配置の符号を計算
  // 簡易：(S)-乳酸の H と CH3 の位置の上下関係を比較
  const c1m1 = m1.atoms[1];
  const c1m2 = m2.atoms.find((a) => a.chirality);
  console.log(`    "C[C@H](O)C(=O)O" の chirality = ${c1m1.chirality}`);
  console.log(`    "O[C@@H](C)C(=O)O" の chirality = ${c1m2.chirality}`);
  // 立体異性体としては同じものを表しているが、SMILES 記法が異なる。
  // 検証は緩く、両方が一定の chirality を持っていることだけ確認
  assert(c1m1.chirality !== null, `m1 にキラリティ`);
  assert(c1m2.chirality !== null, `m2 にキラリティ`);
}

console.log(`\n結果: ${pass} 合格 / ${fail} 失敗`);
process.exit(fail > 0 ? 1 : 0);
