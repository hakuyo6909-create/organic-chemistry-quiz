/**
 * Phase 4 検証スクリプト（Node 実行）
 *
 *   node 有機化学クイズ/src/molecule-3d/test-phase4.mjs
 *
 * 対象：環構造、芳香族環、縮環、ブラケット記法。
 */
import { annotateHybridizations } from "./core/hybridization.js";
import { buildGeometry, detectRings } from "./core/geometry-builder.js";

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
  } else if (/[a-z]/.test(inner[i])) {
    element = inner[i].toUpperCase(); aromatic = true; i += 1;
  } else throw new Error(`Cannot parse bracket "${inner}"`);
  let hCount = 0;
  if (inner[i] === "H") { i++; if (/\d/.test(inner[i])) { hCount = +inner[i]; i++; } else hCount = 1; }
  let charge = 0;
  if (inner[i] === "+") { charge = 1; i++; }
  else if (inner[i] === "-") { charge = -1; i++; }
  return { element, aromatic, hCount, charge };
}

function parseSmiles(smiles) {
  const atoms = [];
  const bonds = [];
  const ringClosures = [];
  const ringOpen = new Map();
  let pendingOrder = 1, prevId = null;
  const stack = [];
  let i = 0;
  const addAtom = (element, opts = {}) => {
    const id = atoms.length;
    atoms.push({ id, element, aromatic: opts.aromatic ?? false, fromBracket: opts.fromBracket ?? false,
                 formalCharge: opts.formalCharge ?? 0, explicitHCount: opts.explicitH ?? 0,
                 implicitHCount: 0, bonds: [] });
    return id;
  };
  const addBond = (a, b, order) => {
    bonds.push({ a, b, order });
    atoms[a].bonds.push({ otherId: b, order });
    atoms[b].bonds.push({ otherId: a, order });
  };
  while (i < smiles.length) {
    const ch = smiles[i];
    if (ch === "(") { stack.push({ prevId, pendingOrder }); pendingOrder = 1; i++; continue; }
    if (ch === ")") { const pop = stack.pop(); prevId = pop.prevId; pendingOrder = pop.pendingOrder; i++; continue; }
    if (ch === "=") { pendingOrder = 2; i++; continue; }
    if (ch === "#") { pendingOrder = 3; i++; continue; }
    if (ch === "-") { pendingOrder = 1; i++; continue; }
    if (/[0-9]/.test(ch)) {
      const num = +ch;
      if (ringOpen.has(num)) {
        const op = ringOpen.get(num);
        let order = pendingOrder;
        if (atoms[op].aromatic && atoms[prevId].aromatic && order === 1) order = 1.5;
        addBond(op, prevId, order);
        ringClosures.push({ a: op, b: prevId });
        ringOpen.delete(num);
      } else ringOpen.set(num, prevId);
      pendingOrder = 1; i++; continue;
    }
    if (ch === "[") {
      const close = smiles.indexOf("]", i);
      const inner = smiles.slice(i + 1, close);
      const parsed = parseBracket(inner);
      const id = addAtom(parsed.element, { aromatic: parsed.aromatic, fromBracket: true, formalCharge: parsed.charge, explicitH: parsed.hCount });
      if (prevId !== null) {
        let order = pendingOrder;
        if (atoms[prevId].aromatic && parsed.aromatic && order === 1) order = 1.5;
        addBond(prevId, id, order);
      }
      prevId = id; pendingOrder = 1; i = close + 1; continue;
    }
    let element, isAromatic = false;
    if (ch === "C" && smiles[i + 1] === "l") { element = "Cl"; i += 2; }
    else if (ch === "B" && smiles[i + 1] === "r") { element = "Br"; i += 2; }
    else if (PHASE4_SINGLE_CHAR.has(ch)) { element = ch; i += 1; }
    else if (AROMATIC_SINGLE_CHAR.has(ch)) { element = ch.toUpperCase(); isAromatic = true; i += 1; }
    else throw new Error(`Unsupported "${ch}"`);
    const id = addAtom(element, { aromatic: isAromatic });
    if (prevId !== null) {
      let order = pendingOrder;
      if (atoms[prevId].aromatic && isAromatic && order === 1) order = 1.5;
      addBond(prevId, id, order);
    }
    prevId = id;
    pendingOrder = 1;
  }
  for (const a of atoms) {
    if (a.fromBracket) {
      a.implicitHCount = a.explicitHCount;
    } else {
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
  return mol;
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z); }
function angleDeg(a, b, c) {
  const v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const L1 = Math.hypot(v1.x, v1.y, v1.z);
  const L2 = Math.hypot(v2.x, v2.y, v2.z);
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

const tests = [
  {
    name: "シクロプロパン",
    smiles: "C1CC1",
    checks: (mol) => {
      const heavies = mol.atoms.filter((a) => a.element !== "H");
      assert(heavies.length === 3, `重原子 3 個`);
      // 環の 3 辺すべて 1.51 ± 0.01
      const ring = mol.ringClosures.length > 0 ? detectRings(mol)[0] : [0, 1, 2];
      for (let i = 0; i < ring.length; i++) {
        const a = mol.atoms[ring[i]], b = mol.atoms[ring[(i + 1) % ring.length]];
        const d = dist(a.position, b.position);
        assert(close(d, 1.51, 0.02), `C-C ${i} 長 ${d.toFixed(3)} ≈ 1.51`);
      }
    },
  },
  {
    name: "シクロブタン",
    smiles: "C1CCC1",
    checks: (mol) => {
      const ring = detectRings(mol)[0];
      assert(ring.length === 4, `環サイズ 4`);
      for (let i = 0; i < 4; i++) {
        const d = dist(mol.atoms[ring[i]].position, mol.atoms[ring[(i + 1) % 4]].position);
        assert(close(d, 1.55, 0.02), `C-C 長 ${d.toFixed(3)} ≈ 1.55`);
      }
    },
  },
  {
    name: "シクロペンタン",
    smiles: "C1CCCC1",
    checks: (mol) => {
      const ring = detectRings(mol)[0];
      assert(ring.length === 5, `環サイズ 5`);
      const angles = [];
      for (let i = 0; i < 5; i++) {
        const prev = mol.atoms[ring[(i + 4) % 5]];
        const cur = mol.atoms[ring[i]];
        const next = mol.atoms[ring[(i + 1) % 5]];
        angles.push(angleDeg(prev.position, cur.position, next.position));
      }
      const avg = angles.reduce((s, x) => s + x, 0) / 5;
      assert(close(avg, 108, 1), `環内角 平均 ${avg.toFixed(2)}° ≈ 108° (正五角形)`);
    },
  },
  {
    name: "シクロヘキサン (椅子型)",
    smiles: "C1CCCCC1",
    checks: (mol) => {
      const ring = detectRings(mol)[0];
      assert(ring.length === 6, `環サイズ 6`);
      // C-C すべて 1.54
      for (let i = 0; i < 6; i++) {
        const d = dist(mol.atoms[ring[i]].position, mol.atoms[ring[(i + 1) % 6]].position);
        assert(close(d, 1.54, 0.02), `C-C 長 ${d.toFixed(3)} ≈ 1.54`);
      }
      // 環内角すべて 109.47°
      const angles = [];
      for (let i = 0; i < 6; i++) {
        const prev = mol.atoms[ring[(i + 5) % 6]];
        const cur = mol.atoms[ring[i]];
        const next = mol.atoms[ring[(i + 1) % 6]];
        angles.push(angleDeg(prev.position, cur.position, next.position));
      }
      const avgA = angles.reduce((s, x) => s + x, 0) / 6;
      assert(close(avgA, 109.47, 0.5), `環内角 平均 ${avgA.toFixed(2)}° ≈ 109.47°`);
      // 椅子型 → 平面ではない（z 方向に厚みあり）
      const zs = ring.map((id) => mol.atoms[id].position.z);
      const dz = Math.max(...zs) - Math.min(...zs);
      assert(dz > 0.3, `z 方向の振幅 ${dz.toFixed(3)} > 0.3 (非平面=椅子型)`);
    },
  },
  {
    name: "ベンゼン",
    smiles: "c1ccccc1",
    checks: (mol) => {
      const ring = detectRings(mol)[0];
      assert(ring.length === 6, `環サイズ 6`);
      // 芳香族 → 全 C は sp²
      const ringAtoms = ring.map((id) => mol.atoms[id]);
      assert(ringAtoms.every((a) => a.hybridization === "sp2"), `全 C が sp²`);
      assert(ringAtoms.every((a) => a.aromatic), `全 C が aromatic`);
      // C-C すべて 1.40
      for (let i = 0; i < 6; i++) {
        const d = dist(mol.atoms[ring[i]].position, mol.atoms[ring[(i + 1) % 6]].position);
        assert(close(d, 1.40, 0.02), `C-C 長 ${d.toFixed(3)} ≈ 1.40`);
      }
      // 環内角すべて 120°
      const angles = [];
      for (let i = 0; i < 6; i++) {
        angles.push(angleDeg(
          mol.atoms[ring[(i + 5) % 6]].position,
          mol.atoms[ring[i]].position,
          mol.atoms[ring[(i + 1) % 6]].position,
        ));
      }
      const avgA = angles.reduce((s, x) => s + x, 0) / 6;
      assert(close(avgA, 120, 0.5), `環内角 平均 ${avgA.toFixed(2)}° ≈ 120°`);
      // 6 原子 + 6 H すべて平面
      assertPlanar(mol.atoms, 0.01, "全 12 原子の平面性");
    },
  },
  {
    name: "ピリジン",
    smiles: "n1ccccc1",
    checks: (mol) => {
      const ring = detectRings(mol)[0];
      assert(ring.length === 6, `環サイズ 6`);
      const N = mol.atoms.find((a) => a.element === "N");
      assert(N.aromatic && N.hybridization === "sp2", `N は芳香族 sp²`);
      assert(N.implicitHCount === 0, `ピリジン N に H なし`);
      assertPlanar(mol.atoms.filter((a) => a.element !== "H"), 0.01, "重原子の平面性");
    },
  },
  {
    name: "フラン",
    smiles: "c1ccoc1",
    checks: (mol) => {
      const ring = detectRings(mol)[0];
      assert(ring.length === 5, `環サイズ 5`);
      const O = mol.atoms.find((a) => a.element === "O");
      assert(O.aromatic && O.hybridization === "sp2", `O は芳香族 sp²`);
      assertPlanar(mol.atoms.filter((a) => a.element !== "H"), 0.01, "重原子の平面性");
    },
  },
  {
    name: "ピロール ([nH] 記法)",
    smiles: "c1cc[nH]c1",
    checks: (mol) => {
      const ring = detectRings(mol)[0];
      assert(ring.length === 5, `環サイズ 5`);
      const N = mol.atoms.find((a) => a.element === "N");
      assert(N.aromatic && N.hybridization === "sp2", `N は芳香族 sp²`);
      const nH = mol.atoms.filter((a) => a.element === "H" && a.bonds.some((b) => b.otherId === N.id));
      assert(nH.length === 1, `N に H 1 個 (explicit)`);
    },
  },
  {
    name: "ナフタレン (縮環)",
    smiles: "c1ccc2ccccc2c1",
    checks: (mol) => {
      const rings = detectRings(mol);
      assert(rings.length === 2, `環 2 つ`);
      assert(rings.every((r) => r.length === 6), `両方 6 員環`);
      // 縮環の共有原子は 2 個
      const shared = rings[0].filter((id) => rings[1].includes(id));
      assert(shared.length === 2, `共有原子 2 個 (縮環)`);
      // 全原子が平面
      assertPlanar(mol.atoms.filter((a) => a.element !== "H"), 0.05, "ナフタレン重原子の平面性");
      // 10 個の重原子すべて位置あり
      const placed = mol.atoms.filter((a) => a.element !== "H" && a.position !== undefined).length;
      assert(placed === 10, `10 個の重原子すべて配置 (実際 ${placed})`);
    },
  },
  {
    name: "トルエン (環+置換基)",
    smiles: "Cc1ccccc1",
    checks: (mol) => {
      const ring = detectRings(mol)[0];
      assert(ring.length === 6, `環サイズ 6`);
      // 環の重原子 6 + メチル C 1 + メチル H 3 + 環 H 5 = 15
      const heavies = mol.atoms.filter((a) => a.element !== "H");
      assert(heavies.length === 7, `重原子 7 個 (1 + 6)`);
      // メチル C は環外、sp³
      const methyl = mol.atoms.find((a) => a.id === 0);
      assert(methyl.hybridization === "sp3", `メチル C は sp³`);
      // メチル-環の結合長 sp³-sp²-1 = 1.50
      const ringC = mol.atoms.find((a) => a.id === 1);
      const d = dist(methyl.position, ringC.position);
      assert(close(d, 1.50, 0.02), `メチル-環 結合長 ${d.toFixed(3)} ≈ 1.50`);
    },
  },
];

for (const t of tests) {
  console.log(`\n=== ${t.name} (${t.smiles}) ===`);
  try {
    const mol = build(t.smiles);
    t.checks(mol);
  } catch (e) {
    console.log(`    ✗ 例外: ${e.message}`);
    fail++;
  }
}

console.log(`\n結果: ${pass} 合格 / ${fail} 失敗`);
process.exit(fail > 0 ? 1 : 0);
