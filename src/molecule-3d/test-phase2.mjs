/**
 * Phase 2 検証スクリプト（Node 実行）
 *
 *   node 有機化学クイズ/src/molecule-3d/test-phase2.mjs
 *
 * 対象：sp²（120°）、sp（180°）、多重結合の長さ。
 */
import { annotateHybridizations } from "./core/hybridization.js";
import { buildGeometry } from "./core/geometry-builder.js";

const STANDARD_VALENCE = { C: 4, N: 3, O: 2, H: 1 };
const PHASE2_ELEMENTS = new Set(["C", "N", "O"]);

function parseChainSmiles(smiles) {
  const atoms = [];
  const bonds = [];
  let pendingOrder = 1;
  let prevId = null;
  for (const ch of smiles) {
    if (ch === "=") { pendingOrder = 2; continue; }
    if (ch === "#") { pendingOrder = 3; continue; }
    if (ch === "-") { pendingOrder = 1; continue; }
    if (!PHASE2_ELEMENTS.has(ch)) throw new Error(`Unsupported "${ch}"`);
    const id = atoms.length;
    atoms.push({ id, element: ch, formalCharge: 0, implicitHCount: 0, bonds: [] });
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
  const mol = parseChainSmiles(smiles);
  annotateHybridizations(mol);
  buildGeometry(mol);
  return mol;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}
function angleDeg(a, b, c) {
  const v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const L1 = Math.hypot(v1.x, v1.y, v1.z);
  const L2 = Math.hypot(v2.x, v2.y, v2.z);
  return Math.acos(Math.max(-1, Math.min(1, dot / (L1 * L2)))) * 180 / Math.PI;
}

const tests = [
  {
    name: "エチレン C₂H₄",
    smiles: "C=C",
    checks: (mol) => {
      const C0 = mol.atoms[0], C1 = mol.atoms[1];
      const cc = dist(C0.position, C1.position);
      assert(close(cc, 1.34, 0.01), `C=C 長 ${cc.toFixed(3)} ≈ 1.34`);
      // H-C-H 角 (≈120°), H-C=C 角 (≈120°)
      const hs0 = mol.atoms.filter((a) => a.element === "H" && a.bonds.some((b) => b.otherId === 0));
      const hs1 = mol.atoms.filter((a) => a.element === "H" && a.bonds.some((b) => b.otherId === 1));
      const ang_HCH = angleDeg(hs0[0].position, C0.position, hs0[1].position);
      assert(close(ang_HCH, 120, 0.5), `H-C-H 角 ${ang_HCH.toFixed(2)}° ≈ 120°`);
      const ang_HCC = angleDeg(hs0[0].position, C0.position, C1.position);
      assert(close(ang_HCC, 120, 0.5), `H-C=C 角 ${ang_HCC.toFixed(2)}° ≈ 120°`);
      // すべての原子が同一平面か
      assertPlanar(mol.atoms, 0.01, "全原子の平面性");
    },
  },
  {
    name: "アセチレン C₂H₂",
    smiles: "C#C",
    checks: (mol) => {
      const C0 = mol.atoms[0], C1 = mol.atoms[1];
      const cc = dist(C0.position, C1.position);
      assert(close(cc, 1.20, 0.01), `C≡C 長 ${cc.toFixed(3)} ≈ 1.20`);
      const hs = mol.atoms.filter((a) => a.element === "H");
      const ang = angleDeg(hs[0].position, C0.position, C1.position);
      assert(close(ang, 180, 0.5), `H-C-C 角 ${ang.toFixed(2)}° ≈ 180°`);
    },
  },
  {
    name: "ホルムアルデヒド HCHO",
    smiles: "C=O",
    checks: (mol) => {
      const C = mol.atoms[0], O = mol.atoms[1];
      const co = dist(C.position, O.position);
      assert(close(co, 1.23, 0.01), `C=O 長 ${co.toFixed(3)} ≈ 1.23`);
      const hs = mol.atoms.filter((a) => a.element === "H");
      const ang_HCO = angleDeg(hs[0].position, C.position, O.position);
      assert(close(ang_HCO, 120, 0.5), `H-C=O 角 ${ang_HCO.toFixed(2)}° ≈ 120°`);
    },
  },
  {
    name: "シアン化水素 HCN",
    smiles: "C#N",
    checks: (mol) => {
      const C = mol.atoms[0], N = mol.atoms[1];
      const cn = dist(C.position, N.position);
      assert(close(cn, 1.16, 0.01), `C≡N 長 ${cn.toFixed(3)} ≈ 1.16`);
      const hs = mol.atoms.filter((a) => a.element === "H");
      const ang = angleDeg(hs[0].position, C.position, N.position);
      assert(close(ang, 180, 0.5), `H-C≡N 角 ${ang.toFixed(2)}° ≈ 180°`);
    },
  },
  {
    name: "二酸化炭素 CO₂",
    smiles: "O=C=O",
    checks: (mol) => {
      const O0 = mol.atoms[0], C = mol.atoms[1], O1 = mol.atoms[2];
      const co1 = dist(O0.position, C.position);
      const co2 = dist(C.position, O1.position);
      assert(close(co1, 1.16, 0.01), `C=O (1) 長 ${co1.toFixed(3)} ≈ 1.16`);
      assert(close(co2, 1.16, 0.01), `C=O (2) 長 ${co2.toFixed(3)} ≈ 1.16`);
      const ang = angleDeg(O0.position, C.position, O1.position);
      assert(close(ang, 180, 0.5), `O=C=O 角 ${ang.toFixed(2)}° ≈ 180°`);
    },
  },
  {
    name: "アレン C₃H₄",
    smiles: "C=C=C",
    checks: (mol) => {
      const C0 = mol.atoms[0], C1 = mol.atoms[1], C2 = mol.atoms[2];
      const cc1 = dist(C0.position, C1.position);
      const cc2 = dist(C1.position, C2.position);
      assert(close(cc1, 1.31, 0.02), `C=C (1) 長 ${cc1.toFixed(3)} ≈ 1.31`);
      assert(close(cc2, 1.31, 0.02), `C=C (2) 長 ${cc2.toFixed(3)} ≈ 1.31`);
      const ang_CCC = angleDeg(C0.position, C1.position, C2.position);
      assert(close(ang_CCC, 180, 0.5), `C=C=C 角 ${ang_CCC.toFixed(2)}° ≈ 180°`);
      // 末端 C は sp² なので H-C=C 角は 120°
      const hs0 = mol.atoms.filter((a) => a.element === "H" && a.bonds.some((b) => b.otherId === 0));
      assert(hs0.length === 2, `末端 C₀ の H 数 = ${hs0.length} ≈ 2`);
      const ang_HCC = angleDeg(hs0[0].position, C0.position, C1.position);
      assert(close(ang_HCC, 120, 0.5), `H-C=C 角 ${ang_HCC.toFixed(2)}° ≈ 120°`);
    },
  },
];

let pass = 0, fail = 0;
function close(a, b, tol) { return Math.abs(a - b) <= tol; }
function assert(cond, msg) {
  if (cond) { console.log(`    ✓ ${msg}`); pass++; }
  else      { console.log(`    ✗ ${msg}`); fail++; }
}
function assertPlanar(atoms, tol, msg) {
  if (atoms.length < 4) { console.log(`    ✓ ${msg} (< 4 原子)`); pass++; return; }
  // 3 点で平面の法線を作り、4 点目以降の距離が tol 以下か
  const p = atoms.map((a) => a.position);
  const v1 = { x: p[1].x - p[0].x, y: p[1].y - p[0].y, z: p[1].z - p[0].z };
  const v2 = { x: p[2].x - p[0].x, y: p[2].y - p[0].y, z: p[2].z - p[0].z };
  const n = {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  };
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

for (const t of tests) {
  console.log(`\n=== ${t.name} (${t.smiles}) ===`);
  try {
    const mol = build(t.smiles);
    // 混成も表示
    const hyb = mol.atoms.filter((a) => a.element !== "H").map((a) => `${a.element}:${a.hybridization}`).join(" ");
    console.log(`    混成: ${hyb}`);
    t.checks(mol);
  } catch (e) {
    console.log(`    ✗ 例外: ${e.message}`);
    fail++;
  }
}

console.log(`\n結果: ${pass} 合格 / ${fail} 失敗`);
process.exit(fail > 0 ? 1 : 0);
