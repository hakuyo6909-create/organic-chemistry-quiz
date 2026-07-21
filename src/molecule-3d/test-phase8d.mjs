/**
 * Phase 8D 検証：軸不斉ヒントによる R/S 区別
 *   node 有機化学クイズ/src/molecule-3d/test-phase8d.mjs
 */
import { annotateHybridizations } from "./core/hybridization.js";
import { buildGeometry } from "./core/geometry-builder.js";
import { verifyStereochemistry, applyAxialChirality } from "./core/stereochemistry.js";

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
  if (inner[i] === "+") { charge = 1; i++; }
  else if (inner[i] === "-") { charge = -1; i++; }
  return { element, aromatic, hCount, charge, chirality };
}

function parseSmiles(smiles) {
  const atoms = [], bonds = [], ringClosures = [];
  const ringOpen = new Map();
  let pendingOrder = 1, pendingOrderExplicit = false, pendingDirection = null, prevId = null;
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
    bonds.push({ a, b, order, upAtomId });
    atoms[a].bonds.push({ otherId: b, order, upAtomId });
    atoms[b].bonds.push({ otherId: a, order, upAtomId });
    if (atoms[a].chirality && atoms[a].smilesNextIds && atoms[a].smilesPrevId !== b) {
      atoms[a].smilesNextIds.push(b);
    }
  };
  while (i < smiles.length) {
    const ch = smiles[i];
    if (ch === "(") { stack.push({ prevId, pendingOrder, pendingOrderExplicit }); pendingOrder = 1; pendingOrderExplicit = false; i++; continue; }
    if (ch === ")") { const p = stack.pop(); prevId = p.prevId; pendingOrder = p.pendingOrder; pendingOrderExplicit = p.pendingOrderExplicit; i++; continue; }
    if (ch === "=") { pendingOrder = 2; pendingOrderExplicit = true; i++; continue; }
    if (ch === "#") { pendingOrder = 3; pendingOrderExplicit = true; i++; continue; }
    if (ch === "-") { pendingOrder = 1; pendingOrderExplicit = true; i++; continue; }
    if (ch === "/") { pendingDirection = "up"; pendingOrder = 1; pendingOrderExplicit = true; i++; continue; }
    if (ch === "\\") { pendingDirection = "down"; pendingOrder = 1; pendingOrderExplicit = true; i++; continue; }
    if (/[0-9]/.test(ch)) {
      const num = +ch;
      if (ringOpen.has(num)) {
        const op = ringOpen.get(num);
        let order = pendingOrder;
        if (atoms[op].aromatic && atoms[prevId].aromatic && order === 1 && !pendingOrderExplicit) order = 1.5;
        addBond(op, prevId, order, pendingDirection);
        ringClosures.push({ a: op, b: prevId });
        ringOpen.delete(num);
      } else ringOpen.set(num, prevId);
      pendingOrder = 1; pendingOrderExplicit = false; pendingDirection = null; i++; continue;
    }
    if (ch === "[") {
      const close = smiles.indexOf("]", i);
      const parsed = parseBracket(smiles.slice(i + 1, close));
      const id = addAtom(parsed.element, { aromatic: parsed.aromatic, fromBracket: true, formalCharge: parsed.charge, explicitH: parsed.hCount, chirality: parsed.chirality, smilesPrevId: prevId });
      if (prevId !== null) {
        let order = pendingOrder;
        if (atoms[prevId].aromatic && parsed.aromatic && order === 1 && !pendingOrderExplicit) order = 1.5;
        addBond(prevId, id, order, pendingDirection);
      }
      prevId = id; pendingOrder = 1; pendingOrderExplicit = false; pendingDirection = null; i = close + 1; continue;
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
      if (atoms[prevId].aromatic && aromatic && order === 1 && !pendingOrderExplicit) order = 1.5;
      addBond(prevId, id, order, pendingDirection);
    }
    prevId = id; pendingOrder = 1; pendingOrderExplicit = false; pendingDirection = null;
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

function build(smiles, hint = null) {
  const mol = parseSmiles(smiles);
  annotateHybridizations(mol);
  buildGeometry(mol);
  mol.stereo = verifyStereochemistry(mol);
  if (hint) mol.axialChirality = applyAxialChirality(mol, hint);
  return mol;
}

function dihedralDeg(pA, pB, pC, pD) {
  const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
  const cross = (a, b) => ({ x: a.y*b.z - a.z*b.y, y: a.z*b.x - a.x*b.z, z: a.x*b.y - a.y*b.x });
  const dot = (a, b) => a.x*b.x + a.y*b.y + a.z*b.z;
  const len = (a) => Math.hypot(a.x, a.y, a.z);
  const b1 = sub(pB, pA), b2 = sub(pC, pB), b3 = sub(pD, pC);
  const n1 = cross(b1, b2), n2 = cross(b2, b3);
  const m1 = cross(n1, { x: b2.x/len(b2), y: b2.y/len(b2), z: b2.z/len(b2) });
  return Math.atan2(dot(m1, n2), dot(n1, n2)) * 180 / Math.PI;
}

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { console.log(`    ✓ ${msg}`); pass++; }
  else      { console.log(`    ✗ ${msg}`); fail++; }
}

console.log("\n=== BINOL: R と S で異なる二面角 ===");
{
  const smiles = "Oc1ccc2ccccc2c1-c1c(O)ccc2ccccc12";
  const molDefault = build(smiles);          // ヒントなし
  const molR = build(smiles, "R");           // R ヒント
  const molS = build(smiles, "S");           // S ヒント

  // biaryl 結合の両端原子と、その隣接（環内）原子を取り、二面角を計測
  // SMILES 上、左ナフトールの c1（atom 1）と右ナフトールの c1（"-" 直後）が biaryl 結合の両端
  // 簡易：bonds.filter(order === 1, 両端 aromatic, 同じ環でない) で biaryl を見つける
  function findBiarylAndDihedral(mol) {
    for (const b of mol.bonds) {
      if (b.order !== 1) continue;
      const A = mol.atoms[b.a], B = mol.atoms[b.b];
      if (!A.aromatic || !B.aromatic) continue;
      // ortho 原子: A の隣接で B でないもの、B の隣接で A でないもの
      const orthoA = A.bonds.find((bb) => bb.otherId !== B.id && mol.atoms[bb.otherId].aromatic);
      const orthoB = B.bonds.find((bb) => bb.otherId !== A.id && mol.atoms[bb.otherId].aromatic);
      if (!orthoA || !orthoB) continue;
      return dihedralDeg(
        mol.atoms[orthoA.otherId].position,
        A.position, B.position,
        mol.atoms[orthoB.otherId].position,
      );
    }
    return null;
  }

  const dihDefault = findBiarylAndDihedral(molDefault);
  const dihR = findBiarylAndDihedral(molR);
  const dihS = findBiarylAndDihedral(molS);
  console.log(`    BINOL default 二面角: ${dihDefault?.toFixed(2)}°`);
  console.log(`    BINOL (R)     二面角: ${dihR?.toFixed(2)}°`);
  console.log(`    BINOL (S)     二面角: ${dihS?.toFixed(2)}°`);

  assert(dihR !== null && dihS !== null, "biaryl 結合が検出される");
  assert(Math.abs(dihR - dihS) > 30, `R と S で二面角に差がある (差 ${Math.abs(dihR - dihS).toFixed(2)}°)`);
  assert(Math.abs(Math.abs(dihR) - 90) < 30 || Math.abs(Math.abs(dihS) - 90) < 30,
    "R か S のいずれかは ~90° に近い（ねじれ構造）");
}

console.log("\n=== ビフェニルジオール: R と S で異なる ===");
{
  const smiles = "CCc1ccc(O)c(-c2c(O)ccc(CC)c2)c1";
  const molR = build(smiles, "R");
  const molS = build(smiles, "S");

  function findBiarylAndDihedral(mol) {
    for (const b of mol.bonds) {
      if (b.order !== 1) continue;
      const A = mol.atoms[b.a], B = mol.atoms[b.b];
      if (!A.aromatic || !B.aromatic) continue;
      const orthoA = A.bonds.find((bb) => bb.otherId !== B.id && mol.atoms[bb.otherId].aromatic);
      const orthoB = B.bonds.find((bb) => bb.otherId !== A.id && mol.atoms[bb.otherId].aromatic);
      if (!orthoA || !orthoB) continue;
      return dihedralDeg(
        mol.atoms[orthoA.otherId].position, A.position, B.position,
        mol.atoms[orthoB.otherId].position,
      );
    }
    return null;
  }
  const dihR = findBiarylAndDihedral(molR);
  const dihS = findBiarylAndDihedral(molS);
  console.log(`    biphenylDiol (R) 二面角: ${dihR?.toFixed(2)}°`);
  console.log(`    biphenylDiol (S) 二面角: ${dihS?.toFixed(2)}°`);
  console.log(`    applyAxialChirality (R): ${JSON.stringify(molR.axialChirality)}`);
  console.log(`    applyAxialChirality (S): ${JSON.stringify(molS.axialChirality)}`);
  assert(dihR !== null, "biaryl 結合が検出される");
  assert(Math.abs(dihR - dihS) > 30, `R と S で二面角に差がある`);
}

console.log("\n=== 乳酸: ヒントなしでも壊れない ===");
{
  const mol = build("CC(O)C(=O)O");
  const heavies = mol.atoms.filter((a) => a.element !== "H");
  assert(heavies.length === 6, "乳酸の重原子 6 個");
  // すべての原子に position あり
  assert(mol.atoms.every((a) => a.position !== undefined), "すべての原子に位置情報");
}

console.log(`\n結果: ${pass} 合格 / ${fail} 失敗`);
process.exit(fail > 0 ? 1 : 0);
