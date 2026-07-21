/**
 * Phase 7 検証スクリプト：複雑な多環縮環系 + 座標キャッシュ
 *
 *   node 有機化学クイズ/src/molecule-3d/test-phase7.mjs
 *
 * 検証項目：
 *   1) インドール（ベンゼン+ピロール縮環、5-6 fused）
 *   2) キノリン（ベンゼン+ピリジン縮環、6-6 fused）
 *   3) ナフタレン回帰（6-6 fused）
 *   4) 座標キャッシュ：2 回目の build が memory cache から復元される
 */
import { annotateHybridizations } from "./core/hybridization.js";
import { buildGeometry, detectRings } from "./core/geometry-builder.js";
import { verifyStereochemistry } from "./core/stereochemistry.js";
import {
  getFromMemory, putInMemory,
  clearMemoryCache, memoryCacheSize,
  molToPayload, applyPayloadToMol,
} from "./cache/coord-cache.js";

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
    bonds.push({ a, b, order, upAtomId });
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
function angleDeg(a, b, c) {
  const v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const L1 = Math.hypot(v1.x, v1.y, v1.z), L2 = Math.hypot(v2.x, v2.y, v2.z);
  return Math.acos(Math.max(-1, Math.min(1, dot / (L1 * L2)))) * 180 / Math.PI;
}

let pass = 0, fail = 0;
function close(a, b, tol) { return Math.abs(a - b) <= tol; }
function assert(cond, msg) {
  if (cond) { console.log(`    ✓ ${msg}`); pass++; }
  else      { console.log(`    ✗ ${msg}`); fail++; }
}
function assertPlanar(atoms, tol, msg) {
  if (atoms.length < 4) { console.log(`    ✓ ${msg} (< 4 原子)`); pass++; return; }
  const p = atoms.map((a) => a.position);
  const v1 = { x: p[1].x - p[0].x, y: p[1].y - p[0].y, z: p[1].z - p[0].z };
  const v2 = { x: p[2].x - p[0].x, y: p[2].y - p[0].y, z: p[2].z - p[0].z };
  const n = { x: v1.y * v2.z - v1.z * v2.y, y: v1.z * v2.x - v1.x * v2.z, z: v1.x * v2.y - v1.y * v2.x };
  const nLen = Math.hypot(n.x, n.y, n.z);
  if (nLen < 1e-6) { console.log(`    ✓ ${msg} (退化)`); pass++; return; }
  let maxOff = 0;
  for (let i = 3; i < p.length; i++) {
    const v = { x: p[i].x - p[0].x, y: p[i].y - p[0].y, z: p[i].z - p[0].z };
    const off = Math.abs((v.x * n.x + v.y * n.y + v.z * n.z) / nLen);
    if (off > maxOff) maxOff = off;
  }
  if (maxOff <= tol) { console.log(`    ✓ ${msg} (max off=${maxOff.toFixed(4)})`); pass++; }
  else { console.log(`    ✗ ${msg} (max off=${maxOff.toFixed(4)} > ${tol})`); fail++; }
}

console.log("\n=== インドール (5-6 縮環、ベンゼン+ピロール) ===");
{
  const mol = build("c1ccc2[nH]ccc2c1");
  const rings = detectRings(mol);
  assert(rings.length === 2, `環 2 つ`);
  const sizes = rings.map((r) => r.length).sort();
  assert(sizes[0] === 5 && sizes[1] === 6, `5 員 + 6 員環 (${sizes})`);
  const N = mol.atoms.find((a) => a.element === "N");
  assert(N && N.aromatic, `N が芳香族`);
  const nH = mol.atoms.filter((a) => a.element === "H" && a.bonds.some((b) => b.otherId === N.id));
  assert(nH.length === 1, `N に H 1 個（[nH]）`);
  // 共有原子 2 個
  const shared = rings[0].filter((id) => rings[1].includes(id));
  assert(shared.length === 2, `共有原子 2 個`);
  // 重原子の平面性
  assertPlanar(mol.atoms.filter((a) => a.element !== "H"), 0.05, "インドール重原子の平面性");
}

console.log("\n=== キノリン (6-6 縮環、ベンゼン+ピリジン) ===");
{
  const mol = build("n1ccc2ccccc2c1");
  const rings = detectRings(mol);
  assert(rings.length === 2, `環 2 つ`);
  assert(rings.every((r) => r.length === 6), `両方 6 員環`);
  const N = mol.atoms.find((a) => a.element === "N");
  assert(N && N.aromatic, `N が芳香族 (ピリジン型)`);
  assert(N.implicitHCount === 0, `ピリジン型 N に H なし`);
  const shared = rings[0].filter((id) => rings[1].includes(id));
  assert(shared.length === 2, `共有原子 2 個`);
  assertPlanar(mol.atoms.filter((a) => a.element !== "H"), 0.05, "キノリン重原子の平面性");
  // 環内角度の平均 ≈ 120°
  const allRingAngles = [];
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i++) {
      const prev = mol.atoms[ring[(i + ring.length - 1) % ring.length]];
      const cur = mol.atoms[ring[i]];
      const next = mol.atoms[ring[(i + 1) % ring.length]];
      allRingAngles.push(angleDeg(prev.position, cur.position, next.position));
    }
  }
  const avg = allRingAngles.reduce((s, x) => s + x, 0) / allRingAngles.length;
  assert(close(avg, 120, 1.5), `環内角平均 ${avg.toFixed(2)}° ≈ 120°`);
}

console.log("\n=== ナフタレン回帰 ===");
{
  const mol = build("c1ccc2ccccc2c1");
  const rings = detectRings(mol);
  assert(rings.length === 2, `環 2 つ`);
  assert(rings.every((r) => r.length === 6), `両方 6 員環`);
  assertPlanar(mol.atoms.filter((a) => a.element !== "H"), 0.05, "ナフタレン重原子の平面性");
  const shared = rings[0].filter((id) => rings[1].includes(id));
  assert(shared.length === 2, `共有原子 2 個`);
}

console.log("\n=== 座標キャッシュ ===");
{
  clearMemoryCache();
  assert(memoryCacheSize() === 0, `初期メモリキャッシュ空`);
  // 1 回目: build して保存（H 含む全原子）
  const mol1 = build("c1ccccc1");
  const payload = molToPayload(mol1);
  putInMemory("c1ccccc1", payload);
  assert(memoryCacheSize() === 1, `1 件キャッシュ済`);
  // 2 回目: パース + buildGeometry（原子数を揃える）→ payload で座標上書き
  const mol2 = parseSmiles("c1ccccc1");
  annotateHybridizations(mol2);
  buildGeometry(mol2);  // H 原子を生成
  const got = getFromMemory("c1ccccc1");
  assert(got !== null, `メモリキャッシュからヒット`);
  const ok = applyPayloadToMol(mol2, got);
  assert(ok, `payload 適用成功（原子数一致: ${mol2.atoms.length}）`);
  let maxDiff = 0;
  for (let i = 0; i < mol1.atoms.length; i++) {
    const d = dist(mol1.atoms[i].position, mol2.atoms[i].position);
    if (d > maxDiff) maxDiff = d;
  }
  assert(maxDiff < 1e-9, `復元座標一致 (max diff ${maxDiff})`);
}

console.log(`\n結果: ${pass} 合格 / ${fail} 失敗`);
process.exit(fail > 0 ? 1 : 0);
