/**
 * Phase 8B 一括検証：moleculeSMILES.js の全分子について 3D 構造生成を試行し、
 * 失敗した分子を一覧にする。
 *
 *   node 有機化学クイズ/src/molecule-3d/test-bulk.mjs
 *
 * 失敗の種類：
 *   - パースエラー（SMILES の機能未対応）
 *   - geometry 構築エラー（環テンプレートマッチ失敗等）
 *   - 立体化学エラー
 *
 * ブラックリスト原子（糖類・イオン塩）は除外して評価する。
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { annotateHybridizations } from "./core/hybridization.js";
import { buildGeometry } from "./core/geometry-builder.js";
import { verifyStereochemistry } from "./core/stereochemistry.js";
import { minimize } from "./core/force-field.js";

// ─── moleculeSMILES.js を JS で読み込む（雑にスクリプトとして eval） ───
const __dirname = dirname(fileURLToPath(import.meta.url));
const smilesPath = join(__dirname, "..", "..", "moleculeSMILES.js");
const smilesSrc = readFileSync(smilesPath, "utf-8");
// `const moleculeSMILES = {...};` を取り出す
const match = smilesSrc.match(/const\s+moleculeSMILES\s*=\s*(\{[\s\S]*?\n\});/);
if (!match) throw new Error("Cannot find moleculeSMILES object");
// eslint-disable-next-line no-eval
const moleculeSMILES = eval(`(${match[1]})`);

// ─── ブラックリスト（app.js と同じ）───
const BLACKLIST = new Set([
  "glucose", "galactose", "fructose", "sucrose", "maltose", "cellobiose", "lactose",
  "sodium_phenoxide", "sodium_benzenesulfonate", "benzene_diazonium",
  "sodium_salicylate", "methylOrange", "calcium_carbide",
]);

// ─── SMILES パーサ（index.js の最新版と同じロジックを inline で） ───
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
      const id = addAtom(parsed.element, {
        aromatic: parsed.aromatic, fromBracket: true, formalCharge: parsed.charge,
        explicitH: parsed.hCount, chirality: parsed.chirality, smilesPrevId: prevId,
      });
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
    else throw new Error(`Unsupported "${ch}" at ${i}`);
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

function tryBuild(smiles) {
  const mol = parseSmiles(smiles);
  annotateHybridizations(mol);
  buildGeometry(mol);
  mol.stereo = verifyStereochemistry(mol);
  const opt = minimize(mol, { maxIter: 50, tol: 0.5 });
  return { mol, opt };
}

// ─── 実行 ───
const failures = [];
const successes = [];
const skipped = [];

const entries = Object.entries(moleculeSMILES);
for (const [key, smiles] of entries) {
  if (BLACKLIST.has(key)) { skipped.push({ key, reason: "blacklist" }); continue; }
  if (smiles.includes(".")) { skipped.push({ key, reason: "disconnected (.)" }); continue; }
  try {
    const { mol, opt } = tryBuild(smiles);
    successes.push({ key, atomCount: mol.atoms.length, iters: opt.iterations, energy: opt.finalEnergy });
  } catch (e) {
    failures.push({ key, smiles, error: e.message });
  }
}

console.log("\n========== Phase 8B 一括検証結果 ==========");
console.log(`総数: ${entries.length}`);
console.log(`成功: ${successes.length}`);
console.log(`失敗: ${failures.length}`);
console.log(`スキップ (ブラックリスト等): ${skipped.length}`);

if (failures.length > 0) {
  console.log("\n--- 失敗した分子 ---");
  for (const f of failures) {
    console.log(`  ✗ ${f.key.padEnd(28)}  SMILES=${f.smiles}`);
    console.log(`      ${f.error}`);
  }
}

if (skipped.length > 0) {
  console.log("\n--- スキップ ---");
  for (const s of skipped) {
    console.log(`  - ${s.key.padEnd(28)} (${s.reason})`);
  }
}

console.log("\n--- 全成功 ---");
for (const s of successes) {
  const flag = s.energy > 1000 ? " ⚠️ E高" : "";
  console.log(`  ✓ ${s.key.padEnd(28)} ${s.atomCount} atoms, ${s.iters} iter, E=${s.energy.toFixed(2)}${flag}`);
}

const highE = successes.filter((s) => s.energy > 1000);
console.log(`\n高エネルギー分子: ${highE.length} 件（E > 1000 kcal/mol、構造に問題あり）`);
for (const s of highE) {
  console.log(`  ${s.key}: E=${s.energy.toExponential(2)}`);
}

process.exit(failures.length > 0 ? 1 : 0);
