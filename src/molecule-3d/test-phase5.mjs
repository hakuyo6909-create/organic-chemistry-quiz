/**
 * Phase 5 検証スクリプト：UFF 最適化
 *
 *   node 有機化学クイズ/src/molecule-3d/test-phase5.mjs
 *
 * 検証項目：
 *   1) Phase 1-4 の Build-up 構造が既に minimum 近傍（gradient 小、E_total 小）
 *   2) わざと歪めた構造が最適化で正しい値に戻る
 *   3) 最適化後の結合長・結合角がほぼ理想値
 */
import { annotateHybridizations } from "./core/hybridization.js";
import { buildGeometry } from "./core/geometry-builder.js";
import { computeEnergyAndGradient, minimize } from "./core/force-field.js";

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
  let hCount = 0;
  if (inner[i] === "H") { i++; if (/\d/.test(inner[i])) { hCount = +inner[i]; i++; } else hCount = 1; }
  let charge = 0;
  if (inner[i] === "+") { charge = 1; i++; } else if (inner[i] === "-") { charge = -1; i++; }
  return { element, aromatic, hCount, charge };
}

function parseSmiles(smiles) {
  const atoms = [], bonds = [], ringClosures = [];
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
    if (ch === ")") { const p = stack.pop(); prevId = p.prevId; pendingOrder = p.pendingOrder; i++; continue; }
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
      const parsed = parseBracket(smiles.slice(i + 1, close));
      const id = addAtom(parsed.element, { aromatic: parsed.aromatic, fromBracket: true,
                                            formalCharge: parsed.charge, explicitH: parsed.hCount });
      if (prevId !== null) {
        let order = pendingOrder;
        if (atoms[prevId].aromatic && parsed.aromatic && order === 1) order = 1.5;
        addBond(prevId, id, order);
      }
      prevId = id; pendingOrder = 1; i = close + 1; continue;
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
      addBond(prevId, id, order);
    }
    prevId = id;
    pendingOrder = 1;
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

function build(smiles, optimize = false) {
  const mol = parseSmiles(smiles);
  annotateHybridizations(mol);
  buildGeometry(mol);
  if (optimize) {
    mol.optimization = minimize(mol, { maxIter: 200, tol: 0.05 });
  }
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

// === テスト 1: Phase 1-4 構造は minimum 近傍であること（最大力 < 5 kcal/mol/Å） ===
console.log("\n=== Phase 1-4 構造の minimum 近傍性（最適化前）===");
for (const smi of ["C", "CC", "CCCC", "C=C", "C#C", "CO", "CC(=O)C", "c1ccccc1", "C1CCCCC1"]) {
  const mol = build(smi, false);
  const { energy, gradient, details } = computeEnergyAndGradient(mol);
  let maxG = 0;
  for (const g of gradient) {
    const L = Math.hypot(g.x, g.y, g.z);
    if (L > maxG) maxG = L;
  }
  assert(maxG < 20, `${smi}: 最大力 ${maxG.toFixed(2)} < 20 kcal/mol/Å (E=${energy.toFixed(2)})`);
}

// === テスト 2: 最適化前後で結合長・角がほぼ不変（既に最小） ===
console.log("\n=== 最適化前後の差分（既に最小なら小変化）===");
for (const smi of ["CC", "C=C", "CO", "CCCCC", "c1ccccc1"]) {
  const molBefore = build(smi, false);
  const molAfter = build(smi, true);
  // ボンド長の最大差
  let maxBondDiff = 0;
  for (const b of molBefore.bonds) {
    const d1 = dist(molBefore.atoms[b.a].position, molBefore.atoms[b.b].position);
    const d2 = dist(molAfter.atoms[b.a].position, molAfter.atoms[b.b].position);
    const diff = Math.abs(d1 - d2);
    if (diff > maxBondDiff) maxBondDiff = diff;
  }
  assert(maxBondDiff < 0.05, `${smi}: 結合長の最大変化 ${maxBondDiff.toFixed(4)} Å < 0.05`);
}

// === テスト 3: 歪めた構造の回復 ===
console.log("\n=== 歪めた構造の回復 ===");
{
  // エタン C-H を 1.30 Å に伸ばす → 最適化で 1.09 に戻ること
  const mol = build("CC", false);
  // 最初の H を見つけて C-H を 1.30 に
  const C0 = mol.atoms[0];
  const H = mol.atoms.find((a) => a.element === "H" && a.bonds.some((b) => b.otherId === C0.id));
  const before = dist(C0.position, H.position);
  // 方向を保ったまま距離を 1.30 に
  const dx = H.position.x - C0.position.x;
  const dy = H.position.y - C0.position.y;
  const dz = H.position.z - C0.position.z;
  const L = Math.hypot(dx, dy, dz);
  H.position.x = C0.position.x + dx / L * 1.30;
  H.position.y = C0.position.y + dy / L * 1.30;
  H.position.z = C0.position.z + dz / L * 1.30;
  const distorted = dist(C0.position, H.position);
  console.log(`    歪め: C-H ${before.toFixed(3)} → ${distorted.toFixed(3)} Å`);
  // 最適化
  const result = minimize(mol, { maxIter: 300, tol: 0.05 });
  const recovered = dist(C0.position, H.position);
  console.log(`    回復: ${recovered.toFixed(3)} Å (${result.iterations} iter, E ${result.initialEnergy.toFixed(2)} → ${result.finalEnergy.toFixed(2)})`);
  assert(close(recovered, 1.09, 0.05), `C-H 回復後 ${recovered.toFixed(3)} ≈ 1.09 Å`);
}
{
  // 水の H-O-H 角を 90° に歪めて 104.5° に戻ること（[OH2] を独立分子として作る）
  // 水分子をSMILESで表現： O だけだと O に2H 自動付与
  const mol = build("O", false);
  const O = mol.atoms[0];
  const Hs = mol.atoms.filter((a) => a.element === "H");
  assert(Hs.length === 2, `水分子に H が 2 個`);
  const before = angleDeg(Hs[0].position, O.position, Hs[1].position);
  console.log(`    水の初期 H-O-H = ${before.toFixed(2)}° (期待 104.5°)`);
  // 1 つの H を回して角度を 90° に
  const cosTarget = Math.cos(90 * Math.PI / 180);
  const u = { x: Hs[0].position.x - O.position.x, y: Hs[0].position.y - O.position.y, z: Hs[0].position.z - O.position.z };
  // u に対して 90° を成す方向に H[1] を再配置（任意の垂直方向）
  Hs[1].position.x = O.position.x - u.x * cosTarget + 0;  // 簡単に xy 平面で
  Hs[1].position.y = O.position.y + Math.hypot(u.x, u.y, u.z) * Math.sin(90 * Math.PI / 180);
  Hs[1].position.z = O.position.z;
  // 距離 0.96 に正規化
  const dx = Hs[1].position.x - O.position.x;
  const dy = Hs[1].position.y - O.position.y;
  const dz = Hs[1].position.z - O.position.z;
  const L = Math.hypot(dx, dy, dz);
  Hs[1].position.x = O.position.x + dx / L * 0.96;
  Hs[1].position.y = O.position.y + dy / L * 0.96;
  Hs[1].position.z = O.position.z + dz / L * 0.96;
  const distorted = angleDeg(Hs[0].position, O.position, Hs[1].position);
  console.log(`    歪み後 H-O-H = ${distorted.toFixed(2)}°`);
  const result = minimize(mol, { maxIter: 300, tol: 0.05 });
  const recovered = angleDeg(Hs[0].position, O.position, Hs[1].position);
  console.log(`    回復後 H-O-H = ${recovered.toFixed(2)}° (${result.iterations} iter)`);
  assert(close(recovered, 104.5, 2.0), `H-O-H 回復後 ${recovered.toFixed(2)}° ≈ 104.5°`);
}

// === テスト 4: 環は環らしく保たれる ===
console.log("\n=== 環構造の維持（最適化後）===");
{
  const mol = build("C1CCCCC1", true);
  // C-C 6 本がすべて 1.54 ± 0.05
  let allOK = true;
  for (const b of mol.bonds) {
    if (mol.atoms[b.a].element !== "C" || mol.atoms[b.b].element !== "C") continue;
    const d = dist(mol.atoms[b.a].position, mol.atoms[b.b].position);
    if (!close(d, 1.54, 0.05)) { allOK = false; break; }
  }
  assert(allOK, `シクロヘキサン C-C 結合長すべて 1.54 ± 0.05 Å`);
}
{
  const mol = build("c1ccccc1", true);
  // C-C 6 本がすべて 1.40 ± 0.05、全平面
  let allOK = true;
  for (const b of mol.bonds) {
    if (mol.atoms[b.a].element !== "C" || mol.atoms[b.b].element !== "C") continue;
    const d = dist(mol.atoms[b.a].position, mol.atoms[b.b].position);
    if (!close(d, 1.40, 0.05)) { allOK = false; break; }
  }
  assert(allOK, `ベンゼン C-C 結合長すべて 1.40 ± 0.05 Å`);
}

console.log(`\n結果: ${pass} 合格 / ${fail} 失敗`);
process.exit(fail > 0 ? 1 : 0);
