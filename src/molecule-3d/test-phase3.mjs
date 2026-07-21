/**
 * Phase 3 検証スクリプト（Node 実行）
 *
 *   node 有機化学クイズ/src/molecule-3d/test-phase3.mjs
 *
 * 対象：ヘテロ原子（O, N, F, Cl, Br, I, S）、孤立電子対による
 *       角度補正（H₂O-like 104.5°、NH₃-like 107°）、分岐 SMILES。
 */
import { annotateHybridizations } from "./core/hybridization.js";
import { buildGeometry } from "./core/geometry-builder.js";

const STANDARD_VALENCE = { C: 4, N: 3, O: 2, H: 1, F: 1, Cl: 1, Br: 1, I: 1, S: 2, P: 3 };
const PHASE3_SINGLE_CHAR = new Set(["C", "N", "O", "F", "S", "P", "I"]);

function parseSmiles(smiles) {
  const atoms = [];
  const bonds = [];
  let pendingOrder = 1;
  let prevId = null;
  const stack = [];
  let i = 0;
  while (i < smiles.length) {
    const ch = smiles[i];
    if (ch === "(") { stack.push({ prevId, pendingOrder }); pendingOrder = 1; i++; continue; }
    if (ch === ")") {
      const popped = stack.pop();
      prevId = popped.prevId; pendingOrder = popped.pendingOrder; i++; continue;
    }
    if (ch === "=") { pendingOrder = 2; i++; continue; }
    if (ch === "#") { pendingOrder = 3; i++; continue; }
    if (ch === "-") { pendingOrder = 1; i++; continue; }
    let element;
    if (ch === "C" && smiles[i + 1] === "l") { element = "Cl"; i += 2; }
    else if (ch === "B" && smiles[i + 1] === "r") { element = "Br"; i += 2; }
    else if (PHASE3_SINGLE_CHAR.has(ch)) { element = ch; i++; }
    else throw new Error(`Unsupported "${ch}"`);
    const id = atoms.length;
    atoms.push({ id, element, formalCharge: 0, implicitHCount: 0, bonds: [] });
    if (prevId !== null) {
      bonds.push({ a: prevId, b: id, order: pendingOrder });
      atoms[prevId].bonds.push({ otherId: id, order: pendingOrder });
      atoms[id].bonds.push({ otherId: prevId, order: pendingOrder });
    }
    prevId = id;
    pendingOrder = 1;
  }
  for (const a of atoms) {
    const used = a.bonds.reduce((s, b) => s + b.order, 0);
    a.implicitHCount = Math.max(0, (STANDARD_VALENCE[a.element] ?? 4) - used);
  }
  return { atoms, bonds };
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

function findH(mol, parentId) {
  return mol.atoms.filter((a) => a.element === "H" && a.bonds.some((b) => b.otherId === parentId));
}
function findById(mol, ...filters) {
  // filters は { element, neighborIds[] } など
  for (const a of mol.atoms) {
    let ok = true;
    for (const f of filters) {
      if (f.element && a.element !== f.element) { ok = false; break; }
      if (f.id !== undefined && a.id !== f.id) { ok = false; break; }
    }
    if (ok) return a;
  }
  return null;
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
    name: "メタノール CH₃OH",
    smiles: "CO",
    checks: (mol) => {
      const C = mol.atoms[0], O = mol.atoms[1];
      assert(C.hybridization === "sp3", `C は sp³ (実際 ${C.hybridization})`);
      assert(O.hybridization === "sp3", `O は sp³ (実際 ${O.hybridization})`);
      assert(close(dist(C.position, O.position), 1.43, 0.01), `C-O 長 ${dist(C.position, O.position).toFixed(3)} ≈ 1.43`);
      const oh = findH(mol, O.id);
      assert(oh.length === 1, `O に H 1 個`);
      const ohLen = dist(O.position, oh[0].position);
      assert(close(ohLen, 0.96, 0.01), `O-H 長 ${ohLen.toFixed(3)} ≈ 0.96`);
      const coh = angleDeg(C.position, O.position, oh[0].position);
      assert(close(coh, 104.5, 0.5), `C-O-H 角 ${coh.toFixed(2)}° ≈ 104.5° (孤立電子対補正)`);
    },
  },
  {
    name: "メチルアミン CH₃NH₂",
    smiles: "CN",
    checks: (mol) => {
      const C = mol.atoms[0], N = mol.atoms[1];
      assert(N.hybridization === "sp3", `N は sp³`);
      assert(close(dist(C.position, N.position), 1.47, 0.01), `C-N 長 ${dist(C.position, N.position).toFixed(3)} ≈ 1.47`);
      const nh = findH(mol, N.id);
      assert(nh.length === 2, `N に H 2 個`);
      const hnh = angleDeg(nh[0].position, N.position, nh[1].position);
      assert(close(hnh, 107, 0.5), `H-N-H 角 ${hnh.toFixed(2)}° ≈ 107° (三角錐)`);
      const cnh = angleDeg(C.position, N.position, nh[0].position);
      assert(close(cnh, 107, 0.5), `C-N-H 角 ${cnh.toFixed(2)}° ≈ 107°`);
    },
  },
  {
    name: "クロロメタン CH₃Cl",
    smiles: "CCl",
    checks: (mol) => {
      const C = mol.atoms[0], Cl = mol.atoms[1];
      assert(C.hybridization === "sp3", `C は sp³`);
      const ccl = dist(C.position, Cl.position);
      assert(close(ccl, 1.77, 0.01), `C-Cl 長 ${ccl.toFixed(3)} ≈ 1.77`);
      const hs = findH(mol, C.id);
      assert(hs.length === 3, `C に H 3 個`);
      const hch = angleDeg(hs[0].position, C.position, hs[1].position);
      assert(close(hch, 109.47, 0.5), `H-C-H 角 ${hch.toFixed(2)}° ≈ 109.47°`);
    },
  },
  {
    name: "アセトアルデヒド CH₃CHO",
    smiles: "CC=O",
    checks: (mol) => {
      const C0 = mol.atoms[0], C1 = mol.atoms[1], O = mol.atoms[2];
      assert(C0.hybridization === "sp3", `CH₃ の C は sp³`);
      assert(C1.hybridization === "sp2", `CHO の C は sp²`);
      assert(close(dist(C0.position, C1.position), 1.50, 0.01), `C-C 長 ≈ 1.50 (sp³-sp²)`);
      assert(close(dist(C1.position, O.position), 1.23, 0.01), `C=O 長 ≈ 1.23`);
      const ccoAng = angleDeg(C0.position, C1.position, O.position);
      assert(close(ccoAng, 120, 0.5), `C-C=O 角 ${ccoAng.toFixed(2)}° ≈ 120°`);
    },
  },
  {
    name: "アセトン (CH₃)₂CO",
    smiles: "CC(=O)C",
    checks: (mol) => {
      const C0 = mol.atoms[0], C1 = mol.atoms[1], O = mol.atoms[2], C3 = mol.atoms[3];
      assert(C1.hybridization === "sp2", `中央 C は sp²`);
      assert(C0.hybridization === "sp3" && C3.hybridization === "sp3", `両端 CH₃ は sp³`);
      // 中央 C 周りは 120° で平面
      const ccc = angleDeg(C0.position, C1.position, C3.position);
      assert(close(ccc, 120, 0.5), `C-C(=O)-C 角 ${ccc.toFixed(2)}° ≈ 120°`);
      const cco = angleDeg(C0.position, C1.position, O.position);
      assert(close(cco, 120, 0.5), `C-C=O 角 ${cco.toFixed(2)}° ≈ 120°`);
      // C0, C1, O, C3 が同一平面か
      assertPlanar([C0, C1, O, C3], 0.01, "カルボニル骨格 4 原子の平面性");
    },
  },
  {
    name: "ジメチルエーテル CH₃OCH₃",
    smiles: "COC",
    checks: (mol) => {
      const C0 = mol.atoms[0], O = mol.atoms[1], C2 = mol.atoms[2];
      assert(O.hybridization === "sp3", `O は sp³`);
      const coc = angleDeg(C0.position, O.position, C2.position);
      // sp³ O の 2σ+2lp は 104.5° 補正
      assert(close(coc, 104.5, 0.5), `C-O-C 角 ${coc.toFixed(2)}° ≈ 104.5° (孤立電子対補正)`);
    },
  },
  {
    name: "酢酸 CH₃COOH",
    smiles: "CC(=O)O",
    checks: (mol) => {
      const C0 = mol.atoms[0], C1 = mol.atoms[1], O2 = mol.atoms[2], O3 = mol.atoms[3];
      assert(C1.hybridization === "sp2", `カルボニル C は sp²`);
      assert(O2.hybridization === "sp2", `カルボニル O (=O) は sp²`);
      assert(close(dist(C1.position, O2.position), 1.23, 0.01), `C=O 長 ≈ 1.23`);
      assert(close(dist(C1.position, O3.position), 1.34, 0.01), `C-O(H) 長 ≈ 1.34 (sp²-sp³)`);
      // カルボキシ基 -C(=O)-OH は平面
      assertPlanar([C1, O2, O3], 0.01, "カルボキシ基 3 原子 (退化)");
      // C0, C1, O2, O3 の 4 原子で平面性
      assertPlanar([C0, C1, O2, O3], 0.01, "C0-C1-O2-O3 の平面性");
    },
  },
  {
    name: "酢酸メチル CH₃COOCH₃",
    smiles: "CC(=O)OC",
    checks: (mol) => {
      const C0 = mol.atoms[0], C1 = mol.atoms[1], O2 = mol.atoms[2], O3 = mol.atoms[3], C4 = mol.atoms[4];
      assert(C1.hybridization === "sp2", `カルボニル C は sp²`);
      assert(O3.hybridization === "sp3", `エステル O (-O-) は sp³`);
      // C1 周りの 3 結合は平面 120°
      const ccc = angleDeg(C0.position, C1.position, O3.position);
      assert(close(ccc, 120, 0.5), `C-C-O 角 (sp² C) ${ccc.toFixed(2)}° ≈ 120°`);
    },
  },
  {
    name: "エタノール C₂H₅OH",
    smiles: "CCO",
    checks: (mol) => {
      const C0 = mol.atoms[0], C1 = mol.atoms[1], O = mol.atoms[2];
      assert(C0.hybridization === "sp3" && C1.hybridization === "sp3", `両 C は sp³`);
      assert(O.hybridization === "sp3", `O は sp³`);
      assert(close(dist(C0.position, C1.position), 1.54, 0.01), `C-C 長 ≈ 1.54`);
      assert(close(dist(C1.position, O.position), 1.43, 0.01), `C-O 長 ≈ 1.43`);
      const cco = angleDeg(C0.position, C1.position, O.position);
      assert(close(cco, 109.47, 0.5), `C-C-O 角 ${cco.toFixed(2)}° ≈ 109.47° (sp³)`);
    },
  },
];

for (const t of tests) {
  console.log(`\n=== ${t.name} (${t.smiles}) ===`);
  try {
    const mol = build(t.smiles);
    const hyb = mol.atoms.filter((a) => a.element !== "H").map((a) => `${a.element}${a.id}:${a.hybridization}`).join(" ");
    console.log(`    混成: ${hyb}`);
    t.checks(mol);
  } catch (e) {
    console.log(`    ✗ 例外: ${e.message}`);
    fail++;
  }
}

console.log(`\n結果: ${pass} 合格 / ${fail} 失敗`);
process.exit(fail > 0 ? 1 : 0);
