/**
 * Phase 1 ジオメトリ単体テスト（Node から実行可能）
 *
 *   node 有機化学クイズ/src/molecule-3d/test-geometry.mjs
 */
import { annotateHybridizations } from "./core/hybridization.js";
import { buildGeometry } from "./core/geometry-builder.js";

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}
function angleDeg(a, b, c) {
  const v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const L1 = Math.hypot(v1.x, v1.y, v1.z);
  const L2 = Math.hypot(v2.x, v2.y, v2.z);
  return Math.acos(dot / (L1 * L2)) * 180 / Math.PI;
}

function buildAlkane(n) {
  const atoms = [];
  const bonds = [];
  for (let i = 0; i < n; i++) {
    atoms.push({ id: i, element: "C", formalCharge: 0, implicitHCount: 0, bonds: [] });
  }
  for (let i = 0; i < n - 1; i++) {
    bonds.push({ a: i, b: i + 1, order: 1 });
    atoms[i].bonds.push({ otherId: i + 1, order: 1 });
    atoms[i + 1].bonds.push({ otherId: i, order: 1 });
  }
  for (const a of atoms) {
    const used = a.bonds.reduce((s, b) => s + b.order, 0);
    a.implicitHCount = 4 - used;
  }
  const mol = { atoms, bonds };
  annotateHybridizations(mol);
  buildGeometry(mol);
  return mol;
}

function summarize(name, n) {
  const mol = buildAlkane(n);
  const heavies = mol.atoms.filter((a) => a.element !== "H");
  const ccDists = [];
  const chDists = [];
  for (const b of mol.bonds) {
    const A = mol.atoms[b.a], B = mol.atoms[b.b];
    const d = dist(A.position, B.position);
    if (A.element === "C" && B.element === "C") ccDists.push(d);
    if ((A.element === "C" && B.element === "H") || (A.element === "H" && B.element === "C")) chDists.push(d);
  }
  const angles = [];
  for (const c of heavies) {
    const nbrs = c.bonds.map((b) => mol.atoms[b.otherId]);
    for (let i = 0; i < nbrs.length; i++) {
      for (let j = i + 1; j < nbrs.length; j++) {
        angles.push(angleDeg(nbrs[i].position, c.position, nbrs[j].position));
      }
    }
  }
  const avg = (arr) => arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : NaN;
  const minMax = (arr) => arr.length ? [Math.min(...arr), Math.max(...arr)] : [NaN, NaN];

  const ccAvg = avg(ccDists);
  const chAvg = avg(chDists);
  const angAvg = avg(angles);
  const angRange = minMax(angles);

  console.log(`\n=== ${name} (n=${n}) ===`);
  console.log(`  原子数: ${mol.atoms.length} (重原子 ${heavies.length}, H ${mol.atoms.length - heavies.length})`);
  if (ccDists.length) console.log(`  C-C  平均: ${ccAvg.toFixed(4)} Å  (理想 1.5400)`);
  if (chDists.length) console.log(`  C-H  平均: ${chAvg.toFixed(4)} Å  (理想 1.0900)`);
  console.log(`  結合角 平均: ${angAvg.toFixed(3)}°  範囲: ${angRange[0].toFixed(2)}〜${angRange[1].toFixed(2)}°  (理想 109.471°)`);

  // 検証アサーション
  const tol = 0.01;
  let pass = true;
  if (ccDists.length && Math.abs(ccAvg - 1.54) > tol) { console.log("  ✗ C-C 平均が理想からずれる"); pass = false; }
  if (chDists.length && Math.abs(chAvg - 1.09) > tol) { console.log("  ✗ C-H 平均が理想からずれる"); pass = false; }
  if (Math.abs(angAvg - 109.47) > 2) { console.log("  ✗ 結合角 平均が 109.47° から 2° 以上ずれる"); pass = false; }
  if (pass) console.log("  ✓ すべての許容値内");
  return pass;
}

function dihedralDeg(p1, p2, p3, p4) {
  const b1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
  const b2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };
  const b3 = { x: p4.x - p3.x, y: p4.y - p3.y, z: p4.z - p3.z };
  const cross = (a, b) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  });
  const n1 = cross(b1, b2);
  const n2 = cross(b2, b3);
  const m1 = cross(n1, { x: b2.x, y: b2.y, z: b2.z });
  const lenB2 = Math.hypot(b2.x, b2.y, b2.z);
  const m1Scaled = { x: m1.x / lenB2, y: m1.y / lenB2, z: m1.z / lenB2 };
  const x = n1.x * n2.x + n1.y * n2.y + n1.z * n2.z;
  const y = m1Scaled.x * n2.x + m1Scaled.y * n2.y + m1Scaled.z * n2.z;
  return Math.atan2(y, x) * 180 / Math.PI;
}

let allPass = true;
allPass &= summarize("メタン", 1);
allPass &= summarize("エタン", 2);
allPass &= summarize("プロパン", 3);
allPass &= summarize("n-ブタン", 4);
allPass &= summarize("n-ペンタン", 5);

// 配座テスト：エタンの staggered と n-ブタンの anti
console.log("\n=== 配座検証 ===");
{
  const mol = buildAlkane(2);
  // C0=atoms[0], C1=atoms[1]. C0 の H 3 つは id 2,3,4。C1 の H 3 つは id 5,6,7。
  const dih = dihedralDeg(
    mol.atoms[2].position,  // C0-H
    mol.atoms[0].position,  // C0
    mol.atoms[1].position,  // C1
    mol.atoms[5].position,  // C1-H
  );
  const expected = 180;  // anti placement of first H pair
  const ok = Math.abs(Math.abs(dih) - expected) < 5;
  console.log(`  エタン H-C-C-H 二面角: ${dih.toFixed(2)}° (期待 ±${expected}° = staggered の anti ペア) ${ok ? "✓" : "✗"}`);
  if (!ok) allPass = false;
}
{
  const mol = buildAlkane(4);
  const dih = dihedralDeg(
    mol.atoms[0].position,
    mol.atoms[1].position,
    mol.atoms[2].position,
    mol.atoms[3].position,
  );
  const ok = Math.abs(Math.abs(dih) - 180) < 5;
  console.log(`  n-ブタン C-C-C-C 二面角: ${dih.toFixed(2)}° (期待 ±180° = anti / ジグザグ) ${ok ? "✓" : "✗"}`);
  if (!ok) allPass = false;
}

console.log("\n" + (allPass ? "[Phase 1] 全テスト合格" : "[Phase 1] 失敗あり"));
process.exit(allPass ? 0 : 1);
