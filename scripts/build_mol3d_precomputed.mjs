#!/usr/bin/env node
/**
 * scripts/build_mol3d_precomputed.mjs
 *
 * 全分子の 3D 構造（MMFF94 で前計算された V2000 Molfile / SDF）を取得し、
 * `data/mol3d_precomputed.json` に書き出すビルドスクリプト。
 *
 * 取得元の優先順位：
 *   1) PubChem 3D-SDF（NIH 提供、MMFF94 で計算済み、Chem3D 同等品質）
 *   2) 自作モジュール（src/molecule-3d/）の fallback
 *
 * 実行：
 *   cd 有機化学クイズ
 *   node scripts/build_mol3d_precomputed.mjs
 *
 * 出力：
 *   data/mol3d_precomputed.json （リポジトリにコミット可能）
 *
 * 注意：
 *   PubChem REST API は 5 リクエスト/秒の制限あり。本スクリプトは throttling 済み。
 *   全 130 分子で約 1〜2 分かかります。
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// 自作モジュール（fallback 用 + UFF 緩和用）
import { annotateHybridizations } from "../src/molecule-3d/core/hybridization.js";
import { buildGeometry } from "../src/molecule-3d/core/geometry-builder.js";
import { verifyStereochemistry, applyAxialChirality } from "../src/molecule-3d/core/stereochemistry.js";
import { minimize, computeEnergyAndGradient } from "../src/molecule-3d/core/force-field.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SMILES_FILE = join(ROOT, "moleculeSMILES.js");
const OUT_FILE = join(ROOT, "data", "mol3d_precomputed.json");

// ─── 設定 ─────────────────────────────────────────

// PubChem 仕様の throttle（リクエスト間隔ミリ秒）
const REQUEST_INTERVAL_MS = 400;     // 2.5 req/sec、安全側
const REQUEST_TIMEOUT_MS = 15000;

// SMILES オーバーライド（PubChem 検索用の代替 SMILES）
const SMILES_OVERRIDE = {
  methylOrange: "CN(C)c1ccc(N=Nc2ccc(S(=O)(=O)O)cc2)cc1",
};

/**
 * 軸不斉分子の **実験的二面角値**（度、結晶構造・気相計算からの代表値）
 *   - BINOL (1,1'-Bi-2-naphthol)：±85° (X 線結晶構造平均、Cambridge Structural Database)
 *   - 3,3'-ジエチル-ビフェニル-2,2'-ジオール：±55°
 *     （単純ビフェニル骨格 + オルト OH と エチルの立体反発で 45〜60° に着座）
 *
 * 注意：UFF 最適化後の最終値は ± 数度の範囲で変動する可能性がある。
 */
const EXPERIMENTAL_DIHEDRALS = {
  binolR: -85,
  binolS:  85,
  biphenylDiolR: -55,
  biphenylDiolS:  55,
  // 6,6'-ジニトロジフェン酸：tetra-ortho 置換（2,2'-COOH, 6,6'-NO₂）により回転完全停止。
  // X 線結晶では約 ±80-90° で、±90° では COOH と NO₂ が biaryl 軸の周りに密集して
  // 視覚的に重なって見える。±75° まで下げて環を少し傾けることで官能基が広がる。
  carboxyNitroBiphenylR: -75,
  carboxyNitroBiphenylS:  75,
};

// 軸不斉分子ごとの UFF 緩和イテレーション数（既定は 80）。
// 4 つの嵩高い置換基を持つ tetra-ortho biphenyl は局所最適化により多くの反復が必要。
const AXIAL_UFF_ITERATIONS = {
  carboxyNitroBiphenylR: 300,
  carboxyNitroBiphenylS: 300,
};

// 高分子（moleculeSMILES.js には未登録）：教育用に「モノマー単位」の 3D 構造を表示
// app.js の molecules レジストリではこれらは camelCase で登録されている
const POLYMER_MONOMERS = {
  cellulose:        { smiles: "OCC1OC(O)C(O)C(O)C1O", name: "beta-D-glucopyranose" },
  starch:           { smiles: "OCC1OC(O)C(O)C(O)C1O", name: "alpha-D-glucopyranose" },
  naturalRubber:    { smiles: "CC(=C)C=C",             name: "isoprene" },
  nylon66:          { smiles: "OC(=O)CCCCC(=O)O",      name: "adipic acid" },
  pet:              { smiles: "OC(=O)c1ccc(C(=O)O)cc1", name: "terephthalic acid" },
  polyethylene:     { smiles: "C=C",                   name: "ethylene" },
  polypropylene:    { smiles: "C=CC",                  name: "propene" },
  polystyrene:      { smiles: "C=Cc1ccccc1",           name: "styrene" },
  polyvinylChloride:{ smiles: "C=CCl",                 name: "vinyl chloride" },
};

// 対象外：現在は全分子を取り扱う方針（必要に応じて追加可能）
const BLACKLIST = new Set([]);

// 手動 SDF（PubChem に 3D-SDF がない無機塩等）
// 簡易な線形・原子配置を直接書き込む（教育用近似）
const MANUAL_SDF = {
  calcium_carbide: `calcium_carbide
  manual         3D

  3  2  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 Ca  0  0  0  0  0  0  0  0  0  0  0  0
    1.8000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  3  0  0  0  0
M  CHG  3   1   2   2  -1   3  -1
M  END
`,
};

// 表示用 displayName / 検索ヒント（PubChem が SMILES でヒットしない場合の name 検索フォールバック）
const NAME_HINTS = {
  // BINOL：R 体と S 体は別 CID（racemate=11762 ではない）
  binolR: "(R)-1,1'-bi-2-naphthol",
  binolS: "(S)-1,1'-bi-2-naphthol",
  // biphenylDiol は moleculeSMILES.js の SMILES が「3,3'-ジエチル-ビフェニル-2,2'-ジオール」
  // (CID 11390853 = 4-ethyl-2-(5-ethyl-2-hydroxyphenyl)phenol)。
  // NAME_HINTS を置かず、SMILES 検索で正しい CID を引かせる。
  // 旧 ヒント "octahydro-BINOL" は **別物（H8-BINOL）** だったため削除。
  // (-)-メントール = 天然型 (1R,2S,5R)、CID 1254 ／ (+)-メントール = (1S,2R,5S)、CID 16666
  // PubChem の SMILES 検索はステレオ記述子付き SMILES では不安定なため名前検索で確実に取得
  mentholR: "(-)-menthol",
  mentholS: "(+)-menthol",
  // キラルカルボン酸・アルコール類：SMILES ステレオ検索が不安定なため名前検索
  lacticAcidR:      "(R)-(-)-lactic acid",       // = D-(-)-lactic acid, CID 61503
  lacticAcidS:      "(S)-(+)-lactic acid",       // = L-(+)-lactic acid, CID 107689
  malicAcidR:       "(R)-(+)-malic acid",        // = D-(+)-malic acid, CID 92824
  malicAcidS:       "(S)-(-)-malic acid",        // = L-(-)-malic acid, CID 222656
  butanol2R:        "(R)-(-)-2-butanol",
  butanol2S:        "(S)-(+)-2-butanol",
  tartaricAcidRR:   "L-(+)-tartaric acid",       // (2R,3R), CID 444305
  tartaricAcidSS:   "D-(-)-tartaric acid",       // (2S,3S), CID 439655
  tartaricAcidMeso: "meso-tartaric acid",        // (2R,3S), CID 78011
  glucose: "alpha-D-glucopyranose",
  galactose: "beta-D-galactopyranose",
  fructose: "beta-D-fructofuranose",
  sucrose: "sucrose",
  maltose: "maltose",
  cellobiose: "cellobiose",
  lactose: "lactose",
  methylOrange: "Helianthin",  // 中性形 (CID 11037) は 3D-SDF あり。Na 塩 (23673835) はなし
  sudan1: "sudan I",
  phenolphthalein: "phenolphthalein",
  methylRed: "methyl red",
  indigo: "indigo",
  btb: "bromothymol blue",
  // イオン塩：PubChem では塩の 3D-SDF が登録されていないため、
  // 教育目的で対応する中性形（酸/塩基）の構造を表示する
  sodium_phenoxide: "phenol",                       // 共役酸を表示
  sodium_benzenesulfonate: "benzenesulfonic acid",  // 共役酸
  benzene_diazonium: "phenyldiazene",               // 中性類縁体
  sodium_salicylate: "salicylic acid",              // 共役酸
  calcium_carbide: "calcium carbide",
  vinyl_acetylene: "vinylacetylene",
};

// ─── moleculeSMILES.js を読み込んで JS オブジェクトとして取得 ───

function loadMoleculeSmiles() {
  const src = readFileSync(SMILES_FILE, "utf-8");
  const match = src.match(/const\s+moleculeSMILES\s*=\s*(\{[\s\S]*?\n\});/);
  if (!match) throw new Error("moleculeSMILES オブジェクトを抽出できませんでした");
  // eslint-disable-next-line no-eval
  return eval(`(${match[1]})`);
}

// ─── PubChem REST API ───

async function fetchWithTimeout(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { signal: ctrl.signal });
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

async function pubchemCidFromSmiles(smiles) {
  // PubChem は "isomeric" / "canonical" 両方の SMILES を受け付ける
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/cids/JSON`;
  const resp = await fetchWithTimeout(url);
  if (!resp.ok) return null;
  const json = await resp.json();
  const cid = json?.IdentifierList?.CID?.[0];
  return (cid && cid !== 0) ? cid : null;
}

async function pubchemCidFromName(name) {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/cids/JSON`;
  const resp = await fetchWithTimeout(url);
  if (!resp.ok) return null;
  const json = await resp.json();
  const cid = json?.IdentifierList?.CID?.[0];
  return (cid && cid !== 0) ? cid : null;
}

async function pubchemSdf3D(cid) {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`;
  const resp = await fetchWithTimeout(url);
  if (!resp.ok) return null;
  const sdf = await resp.text();
  if (!sdf || sdf.includes("PUGREST.NotFound")) return null;
  return sdf;
}

/** SMILES に "." がある場合、最も長いフラグメント（有機部分）を返す */
function getLargestFragment(smiles) {
  if (!smiles.includes(".")) return smiles;
  const parts = smiles.split(".");
  parts.sort((a, b) => b.length - a.length);
  return parts[0];
}

async function getPubChemSDF(key, smiles) {
  const isChiral = /[RS]$/.test(key);
  const isDisconnected = smiles.includes(".");
  const tryNameFirst = (isChiral || isDisconnected) && NAME_HINTS[key];

  const cidCandidates = [];

  // SMILES オーバーライド（明示的指定）を最優先で試す
  if (SMILES_OVERRIDE[key]) {
    try {
      const c = await pubchemCidFromSmiles(SMILES_OVERRIDE[key]);
      if (c) {
        cidCandidates.push({ cid: c, source: `smiles-override` });
        console.log(`    (smiles-override) "${SMILES_OVERRIDE[key]}" → CID=${c}`);
      }
    } catch (e) { /* ignore */ }
  }

  if (tryNameFirst) {
    try {
      const c = await pubchemCidFromName(NAME_HINTS[key]);
      if (c) {
        cidCandidates.push({ cid: c, source: `name(${NAME_HINTS[key]})` });
        console.log(`    (name-first) "${NAME_HINTS[key]}" → CID=${c}`);
      }
    } catch (e) { /* ignore */ }
  }
  try {
    const c = await pubchemCidFromSmiles(smiles);
    if (c && !cidCandidates.some((x) => x.cid === c)) {
      cidCandidates.push({ cid: c, source: "smiles" });
    }
  } catch (e) { /* ignore */ }
  // "." 分断 SMILES の場合は、有機部分（最大フラグメント）で再検索
  if (isDisconnected) {
    const frag = getLargestFragment(smiles);
    if (frag !== smiles) {
      try {
        const c = await pubchemCidFromSmiles(frag);
        if (c && !cidCandidates.some((x) => x.cid === c)) {
          cidCandidates.push({ cid: c, source: `smiles-frag(${frag})` });
          console.log(`    (fragment) "${frag}" → CID=${c}`);
        }
      } catch (e) { /* ignore */ }
    }
  }
  if (!tryNameFirst && NAME_HINTS[key]) {
    try {
      const c = await pubchemCidFromName(NAME_HINTS[key]);
      if (c && !cidCandidates.some((x) => x.cid === c)) {
        cidCandidates.push({ cid: c, source: `name(${NAME_HINTS[key]})` });
      }
    } catch (e) { /* ignore */ }
  }

  // 各 CID 候補について 3D-SDF を試す
  for (const cand of cidCandidates) {
    await sleep(REQUEST_INTERVAL_MS);
    const sdf = await pubchemSdf3D(cand.cid);
    if (sdf) return { sdf, cid: cand.cid, source: cand.source };
    console.log(`    [skip] CID=${cand.cid} (${cand.source}): 3D-SDF 未登録`);
  }
  return null;
}

// ─── 自作モジュールでの fallback 生成 ───

// 自作モジュールは ESM だが、parseSmiles 関数は index.js 内のローカル関数。
// ここではビルドスクリプト内に簡易版を再実装する（test-bulk.mjs と同等）。
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

function generateCustomSdf(key, smiles) {
  const chiralityHint = /R$/.test(key) ? "R" : /S$/.test(key) ? "S" : null;
  const mol = parseSmiles(smiles);
  annotateHybridizations(mol);
  buildGeometry(mol);
  verifyStereochemistry(mol);
  if (chiralityHint) applyAxialChirality(mol, chiralityHint);
  minimize(mol, { maxIter: 200, tol: 0.05 });
  return molToSdf(mol, key);
}

// ─── 軸不斉の後処理（PubChem racemate SDF → R/S 体）───

/**
 * SDF をパースして { atoms: [{element,x,y,z}], bonds: [{a,b,order}] } を返す。
 * （1-indexed の bond.a, bond.b）
 */
function parseSdfMinimal(sdf) {
  const lines = sdf.split(/\r?\n/);
  const counts = lines[3];
  const nA = parseInt(counts.slice(0, 3));
  const nB = parseInt(counts.slice(3, 6));
  const atoms = [];
  for (let i = 0; i < nA; i++) {
    const ln = lines[4 + i];
    atoms.push({
      x: parseFloat(ln.slice(0, 10)),
      y: parseFloat(ln.slice(10, 20)),
      z: parseFloat(ln.slice(20, 30)),
      element: ln.slice(31, 34).trim(),
      raw: ln,
    });
  }
  const bonds = [];
  for (let i = 0; i < nB; i++) {
    const ln = lines[4 + nA + i];
    bonds.push({
      a: parseInt(ln.slice(0, 3)),
      b: parseInt(ln.slice(3, 6)),
      order: parseInt(ln.slice(6, 9)),
      raw: ln,
    });
  }
  return { atoms, bonds, header: lines.slice(0, 4), tail: lines.slice(4 + nA + nB) };
}

/** SDF の atoms 配列を元に SDF 文字列を再構築 */
function rebuildSdf(parsed) {
  const out = [...parsed.header];
  for (const a of parsed.atoms) {
    const x = a.x.toFixed(4).padStart(10, " ");
    const y = a.y.toFixed(4).padStart(10, " ");
    const z = a.z.toFixed(4).padStart(10, " ");
    out.push(
      x + y + z + " " + (a.element + "   ").slice(0, 3) +
      " 0  0  0  0  0  0  0  0  0  0  0  0",
    );
  }
  for (const b of parsed.bonds) {
    out.push(b.raw);
  }
  out.push(...parsed.tail);
  return out.join("\n");
}

/** SDF に biaryl 軸（aromatic C 同士の単結合で、両端が異なる芳香族環）が存在するか */
function hasBiarylAxis(sdf) {
  const p = parseSdfMinimal(sdf);
  return findBiarylBond(p) !== null;
}

/** biaryl 結合（aromatic C–C 単結合、両端が異なる環）を 1 本探す */
function findBiarylBond(parsed) {
  // 芳香族 C 集合：C=C 二重結合に関与する C のみ（C=O のカルボニル C は除外）。
  // これによりフタルイミド等で C(ar)-C(=O) 結合を biaryl と誤検出するのを防ぐ。
  const aromCs = new Set();
  for (const b of parsed.bonds) {
    if (b.order !== 2) continue;
    const elA = parsed.atoms[b.a - 1].element;
    const elB = parsed.atoms[b.b - 1].element;
    // C=C 二重結合のみカウント（C=O, C=N は除く）
    if (elA === "C" && elB === "C") {
      aromCs.add(b.a);
      aromCs.add(b.b);
    }
  }
  // 隣接マップ（芳香族 C のみ）
  const adj = new Map();
  for (const b of parsed.bonds) {
    if (b.order !== 1 && b.order !== 2 && b.order !== 4) continue;
    if (!adj.has(b.a)) adj.set(b.a, []);
    if (!adj.has(b.b)) adj.set(b.b, []);
    adj.get(b.a).push(b.b);
    adj.get(b.b).push(b.a);
  }
  for (const b of parsed.bonds) {
    if (b.order !== 1) continue;
    if (!aromCs.has(b.a) || !aromCs.has(b.b)) continue;
    // sharesRing 判定：bond a-b を除いた芳香族グラフで a→b が辿れるか
    if (!sharesAromaticRing(adj, b.a, b.b, aromCs)) {
      return { a: b.a, b: b.b };
    }
  }
  return null;
}

function sharesAromaticRing(adj, aId, bId, aromCs) {
  const visited = new Set([aId]);
  const queue = [aId];
  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur === bId) return true;
    for (const next of adj.get(cur) ?? []) {
      if (visited.has(next)) continue;
      if (cur === aId && next === bId) continue;
      if (cur === bId && next === aId) continue;
      if (!aromCs.has(next)) continue;
      visited.add(next);
      queue.push(next);
    }
  }
  return false;
}

/** 二面角（pA-pB-pC-pD）を度で返す */
function dihedralDeg(pA, pB, pC, pD) {
  const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
  const cross = (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
  const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  const len = (a) => Math.hypot(a.x, a.y, a.z);
  const b1 = sub(pB, pA), b2 = sub(pC, pB), b3 = sub(pD, pC);
  const n1 = cross(b1, b2), n2 = cross(b2, b3);
  const bn = { x: b2.x / len(b2), y: b2.y / len(b2), z: b2.z / len(b2) };
  const m1 = cross(n1, bn);
  return Math.atan2(dot(m1, n2), dot(n1, n2)) * 180 / Math.PI;
}

/** 軸 (axisOriginIdx → axisDirIdx) を不動軸として、b 側の連結部分木を deg 度回転 */
function rotateBranch(parsed, axisAId, axisBId, deg) {
  const pA = parsed.atoms[axisAId - 1];
  const pB = parsed.atoms[axisBId - 1];
  const ax = { x: pB.x - pA.x, y: pB.y - pA.y, z: pB.z - pA.z };
  const aLen = Math.hypot(ax.x, ax.y, ax.z);
  const axN = { x: ax.x / aLen, y: ax.y / aLen, z: ax.z / aLen };
  const angle = deg * Math.PI / 180;
  const c = Math.cos(angle), s = Math.sin(angle);

  // 隣接マップ（全結合）
  const adj = new Map();
  for (const b of parsed.bonds) {
    if (!adj.has(b.a)) adj.set(b.a, []);
    if (!adj.has(b.b)) adj.set(b.b, []);
    adj.get(b.a).push(b.b);
    adj.get(b.b).push(b.a);
  }
  // B 側の連結部分木を BFS（A を渡らない）
  const visited = new Set([axisAId, axisBId]);
  const queue = [axisBId];
  const branch = [axisBId];
  while (queue.length > 0) {
    const cur = queue.shift();
    for (const next of adj.get(cur) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      queue.push(next);
      branch.push(next);
    }
  }
  // 部分木の各原子を pA まわりに axN 軸で回転（Rodrigues）
  for (const id of branch) {
    if (id === axisBId) continue;  // B は軸上
    const p = parsed.atoms[id - 1];
    const rel = { x: p.x - pA.x, y: p.y - pA.y, z: p.z - pA.z };
    const kxv = {
      x: axN.y * rel.z - axN.z * rel.y,
      y: axN.z * rel.x - axN.x * rel.z,
      z: axN.x * rel.y - axN.y * rel.x,
    };
    const kdot = axN.x * rel.x + axN.y * rel.y + axN.z * rel.z;
    p.x = pA.x + rel.x * c + kxv.x * s + axN.x * kdot * (1 - c);
    p.y = pA.y + rel.y * c + kxv.y * s + axN.y * kdot * (1 - c);
    p.z = pA.z + rel.z * c + kxv.z * s + axN.z * kdot * (1 - c);
  }
}

/**
 * PubChem racemate SDF を axial chirality (R/S) に変換する。
 * 規約：R 体 → dihedral 約 -90°、S 体 → +90°
 *
 * @param {string} sdf  PubChem からの SDF（racemate or 任意の dihedral）
 * @param {"R"|"S"} hint
 * @returns {string} 変換後の SDF
 */
/**
 * SDF → 自作 mol 形式に変換。hybridization は局所環境から自動推定。
 *
 * 各原子について：
 *   σ結合数 = bonds.length（多重結合も 1 σ）
 *   π結合数 = Σ(order - 1)
 *   sp3 / sp2 / sp は σ + lonePairs の合計（立体数）で決定
 */
function sdfToMol(parsed) {
  const atoms = parsed.atoms.map((a, i) => ({
    id: i,
    element: a.element,
    aromatic: false,    // Kekulé 表現で渡るため、aromatic フラグは hybridization 推定後に判定
    formalCharge: 0,
    implicitHCount: 0,
    bonds: [],
    position: { x: a.x, y: a.y, z: a.z },
    chirality: null,
    smilesPrevId: null,
    smilesNextIds: null,
  }));
  const bonds = [];
  for (const b of parsed.bonds) {
    const a = b.a - 1;
    const bb = b.b - 1;
    bonds.push({ a, b: bb, order: b.order });
    atoms[a].bonds.push({ otherId: bb, order: b.order });
    atoms[bb].bonds.push({ otherId: a, order: b.order });
  }
  const mol = { atoms, bonds };
  annotateHybridizations(mol);
  return mol;
}

/**
 * mol を SDF 文字列に変換（座標のみ更新、結合情報は元の形式を保持）。
 * 既存 SDF のフォーマットを再利用するため、原 SDF も渡す。
 */
function molToSdfWithOriginalBonds(mol, originalParsed) {
  const newAtoms = originalParsed.atoms.map((origAtom, i) => ({
    ...origAtom,
    x: mol.atoms[i].position.x,
    y: mol.atoms[i].position.y,
    z: mol.atoms[i].position.z,
  }));
  return rebuildSdf({ ...originalParsed, atoms: newAtoms });
}

/**
 * SDF に対して UFF 力場で軽く緩和を行う。回転で生じた局所歪み（OH-OH の接近等）を解消。
 *
 * @param {string} sdf  入力 SDF
 * @param {Object} opts
 *   @param {number} [opts.maxIter=80]   最大反復数。深く沈めない（PubChem MMFF94 座標を保持するため）
 *   @param {boolean} [opts.freezeAxis]  ビアリール結合の両端原子の位置を固定（dihedral 維持のため）
 *                                        Phase 8E では使わない（凍結なしでも局所最小には留まる想定）
 *   @param {string} [opts.key]          ログ表示用
 * @returns {string}  緩和後の SDF
 */
function relaxSdfWithUff(sdf, opts = {}) {
  const parsed = parseSdfMinimal(sdf);
  const mol = sdfToMol(parsed);

  // 緩和前のエネルギーを記録
  const before = computeEnergyAndGradient(mol);
  // 最大反復 maxIter、緩い tol。深く動かさない（MMFF94 座標から大きく離れないため）
  const result = minimize(mol, {
    maxIter: opts.maxIter ?? 80,
    tol: 0.5,           // 緩い収束基準。深い緩和は避ける
    initialStep: 0.01,  // 小さい初期ステップで PubChem 座標を尊重
  });
  console.log(`      UFF relax (${opts.key ?? ""}): E ${before.energy.toFixed(2)} → ${result.finalEnergy.toFixed(2)}, ${result.iterations} iter`);

  return molToSdfWithOriginalBonds(mol, parsed);
}

function applyAxialChiralityToSdf(sdf, hint, key) {
  const parsed = parseSdfMinimal(sdf);
  const biaryl = findBiarylBond(parsed);
  if (!biaryl) return sdf;

  // 隣接の ortho 原子を 1 個探す。
  // **OH 等のヘテロ原子置換基を持つ芳香族 C を優先**（CIP 順位の代用）。
  //   - BINOL では C2-OH を選ぶことになる（C8a の縮環 C ではなく）
  //   - これにより R/S 体の二面角の符号が CIP 規約と一致する
  const findOrthoForEnd = (endId, otherEndId) => {
    const candidates = [];
    for (const b of parsed.bonds) {
      let other = null;
      if (b.a === endId && b.b !== otherEndId) other = b.b;
      else if (b.b === endId && b.a !== otherEndId) other = b.a;
      if (!other) continue;
      const oa = parsed.atoms[other - 1];
      if (oa.element !== "C") continue;
      // 芳香族判定（order 2 結合を持つ C）
      const isAromatic = parsed.bonds.some(
        (b2) => (b2.a === other || b2.b === other) && b2.order === 2,
      );
      if (!isAromatic) continue;
      // ヘテロ原子置換基（O や N）を持つか
      const hasHetero = parsed.bonds.some((b2) => {
        const partner = b2.a === other ? b2.b : (b2.b === other ? b2.a : null);
        if (partner == null || partner === endId) return false;
        const el = parsed.atoms[partner - 1].element;
        return el === "O" || el === "N";
      });
      candidates.push({ id: other, hasHetero });
    }
    if (candidates.length === 0) return null;
    // ヘテロ置換基持ちを優先
    const withHetero = candidates.find((c) => c.hasHetero);
    return (withHetero ?? candidates[0]).id;
  };
  const orthoA = findOrthoForEnd(biaryl.a, biaryl.b);
  const orthoB = findOrthoForEnd(biaryl.b, biaryl.a);
  if (!orthoA || !orthoB) return sdf;

  const currentDih = dihedralDeg(
    parsed.atoms[orthoA - 1], parsed.atoms[biaryl.a - 1],
    parsed.atoms[biaryl.b - 1], parsed.atoms[orthoB - 1],
  );
  // 実験値があれば使う。なければ ±85° の汎用値
  const targetDih = EXPERIMENTAL_DIHEDRALS[key]
    ?? (hint === "R" ? -85 : +85);
  // dihedralDeg と rotateBranch の符号規約は逆向き
  //   （Rodrigues +α 回転で dihedral は -α 変化、IUPAC 慣習）
  // よって delta = current - target（逆向き）が正しい
  const delta = currentDih - targetDih;
  rotateBranch(parsed, biaryl.a, biaryl.b, delta);

  const afterDih = dihedralDeg(
    parsed.atoms[orthoA - 1], parsed.atoms[biaryl.a - 1],
    parsed.atoms[biaryl.b - 1], parsed.atoms[orthoB - 1],
  );
  console.log(`      axial: dihedral ${currentDih.toFixed(1)}° → ${afterDih.toFixed(1)}° (target ${targetDih}°, ortho ${orthoA}-A-B-${orthoB})`);

  // UFF 緩和（後段で実行）
  return rebuildSdf(parsed);
}

/** mol object → V2000 Molfile（SDF）文字列 */
function molToSdf(mol, title = "") {
  const lines = [];
  lines.push(title);                                             // 1: title
  lines.push("  custom-mol3d  " + new Date().toISOString().slice(0, 10).replace(/-/g, ""));  // 2: header
  lines.push("");                                                 // 3: comment
  const nA = mol.atoms.length;
  const nB = mol.bonds.length;
  lines.push(pad(nA, 3) + pad(nB, 3) + "  0  0  0  0  0  0  0  0999 V2000");
  for (const a of mol.atoms) {
    const x = (a.position?.x ?? 0).toFixed(4);
    const y = (a.position?.y ?? 0).toFixed(4);
    const z = (a.position?.z ?? 0).toFixed(4);
    lines.push(
      padLeft(x, 10) + padLeft(y, 10) + padLeft(z, 10) +
      " " + (a.element + "   ").slice(0, 3) +
      " 0  0  0  0  0  0  0  0  0  0  0  0",
    );
  }
  for (const b of mol.bonds) {
    const o = Math.round(b.order === 1.5 ? 4 : b.order);  // 4 = aromatic
    lines.push(pad(b.a + 1, 3) + pad(b.b + 1, 3) + pad(o, 3) + "  0  0  0  0");
  }
  lines.push("M  END");
  return lines.join("\n");
}

function pad(n, len) { return String(n).padStart(len, " "); }
function padLeft(s, len) { return String(s).padStart(len, " "); }

// ─── ユーティリティ ───

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ─── メイン ───

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const onlyKey = (() => {
    const idx = process.argv.indexOf("--only");
    return idx > -1 ? process.argv[idx + 1] : null;
  })();

  const smilesMap = loadMoleculeSmiles();
  // 高分子は moleculeSMILES.js には未登録のため、別途追加
  for (const [pkey, pinfo] of Object.entries(POLYMER_MONOMERS)) {
    if (!smilesMap[pkey]) smilesMap[pkey] = pinfo.smiles;
  }
  const allKeys = Object.keys(smilesMap);
  const keys = onlyKey ? [onlyKey] : allKeys;

  console.log(`[build-mol3d] 対象分子: ${keys.length} (全 ${allKeys.length})`);
  if (dryRun) console.log("[build-mol3d] dry-run モード（出力ファイルなし）");

  const molecules = {};
  const stats = { total: 0, pubchem: 0, custom: 0, failed: 0, skipped: 0 };

  for (const key of keys) {
    stats.total++;
    const smiles = smilesMap[key];
    if (!smiles) { stats.skipped++; continue; }
    if (BLACKLIST.has(key)) {
      console.log(`  [SKIP] ${key.padEnd(28)} (blacklist)`);
      stats.skipped++;
      continue;
    }

    // 0) 手動 SDF（PubChem に 3D 構造が登録されていない分子）
    let entry = null;
    if (MANUAL_SDF[key]) {
      entry = {
        smiles,
        sdf: MANUAL_SDF[key],
        source: "manual",
        metadata: { note: "手動定義（教育用近似）" },
      };
      console.log(`  [manual]  ${key.padEnd(28)} (手動 SDF)`);
      stats.custom++;
      molecules[key] = entry;
      continue;
    }

    // 1) PubChem を試す
    try {
      const pub = await getPubChemSDF(key, smiles);
      if (pub?.sdf) {
        // 軸不斉キー (R/S サフィックス) の場合、PubChem は通常 racemate のみ
        // 登録しているため、SDF を後処理して目的のエナンチオマーに変換する。
        const chiralityHint = /R$/.test(key) ? "R" : /S$/.test(key) ? "S" : null;
        let sdfOut = pub.sdf;
        let postProcessed = false;
        if (chiralityHint && hasBiarylAxis(pub.sdf)) {
          sdfOut = applyAxialChiralityToSdf(pub.sdf, chiralityHint, key);
          // UFF 緩和（軸不斉分子のみ、回転で生じた歪みを除く）
          const uffIters = AXIAL_UFF_ITERATIONS[key] ?? 80;
          try {
            sdfOut = relaxSdfWithUff(sdfOut, { maxIter: uffIters, freezeAxis: true, key });
          } catch (e) {
            console.warn(`      [UFF skip] ${key}: ${e.message}`);
          }
          postProcessed = true;
        }
        entry = {
          smiles,
          sdf: sdfOut,
          source: postProcessed ? "pubchem+axial" : "pubchem",
          metadata: {
            cid: pub.cid,
            fetchedAt: new Date().toISOString(),
            axialChirality: postProcessed ? chiralityHint : undefined,
          },
        };
        const tag = postProcessed ? `[PubChem+axial(${chiralityHint})]` : "[PubChem]";
        console.log(`  ${tag.padEnd(20)} ${key.padEnd(28)} CID=${pub.cid}`);
        stats.pubchem++;
      }
    } catch (e) {
      console.warn(`  [PubChem err] ${key}: ${e.message}`);
    }

    // 2) fallback：自作モジュール
    if (!entry) {
      try {
        const sdf = generateCustomSdf(key, smiles);
        entry = {
          smiles,
          sdf,
          source: "custom",
          metadata: { generatedAt: new Date().toISOString() },
        };
        console.log(`  [custom]  ${key.padEnd(28)} (PubChem 未取得)`);
        stats.custom++;
      } catch (e) {
        console.error(`  [FAIL]    ${key.padEnd(28)} ${e.message}`);
        stats.failed++;
      }
    }

    if (entry) molecules[key] = entry;
    await sleep(REQUEST_INTERVAL_MS);
  }

  const output = {
    version: "v1",
    builtAt: new Date().toISOString(),
    stats,
    molecules,
  };

  if (!dryRun) {
    if (!existsSync(dirname(OUT_FILE))) mkdirSync(dirname(OUT_FILE), { recursive: true });
    writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), "utf-8");
    console.log(`\n[build-mol3d] 書き出し完了: ${OUT_FILE}`);
  }

  console.log("\n========== 結果 ==========");
  console.log(`  PubChem 取得: ${stats.pubchem}`);
  console.log(`  custom 生成 : ${stats.custom}`);
  console.log(`  失敗        : ${stats.failed}`);
  console.log(`  スキップ    : ${stats.skipped}`);
  console.log(`  合計        : ${stats.total}`);
}

main().catch((e) => {
  console.error("[build-mol3d] 致命的エラー:", e);
  process.exit(1);
});
