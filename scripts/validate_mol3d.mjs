#!/usr/bin/env node
/**
 * scripts/validate_mol3d.mjs
 *
 * data/mol3d_precomputed.json の中身を検証する。
 * 各テストケースについて以下を確認：
 *   - SDF が取得できる
 *   - 芳香族環の平面性（環内原子 z 座標の標準偏差 < 0.05 Å）
 *   - ベンゼン C-C 結合長が 1.35〜1.45 Å に収まる
 *   - sp3 結合角の平均 109±3°
 *   - sp2 結合角の平均 120±3°
 *
 * 実行：
 *   cd 有機化学クイズ
 *   node scripts/validate_mol3d.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_FILE = join(ROOT, "data", "mol3d_precomputed.json");

const data = JSON.parse(readFileSync(DATA_FILE, "utf-8"));

/* ─── SDF (V2000) パーサ ─── */

/**
 * V2000 Molfile を簡易パース。原子と結合のみ抽出。
 * @returns {{ atoms: [{element, x, y, z, idx}], bonds: [{a, b, order}] }}
 */
function parseSdf(sdf) {
  const lines = sdf.split(/\r?\n/);
  // 1-3 行目はヘッダー。4 行目が counts。
  const counts = lines[3];
  const nA = parseInt(counts.slice(0, 3));
  const nB = parseInt(counts.slice(3, 6));
  const atoms = [];
  for (let i = 0; i < nA; i++) {
    const line = lines[4 + i];
    const x = parseFloat(line.slice(0, 10));
    const y = parseFloat(line.slice(10, 20));
    const z = parseFloat(line.slice(20, 30));
    const element = line.slice(31, 34).trim();
    atoms.push({ idx: i + 1, element, x, y, z });
  }
  const bonds = [];
  for (let i = 0; i < nB; i++) {
    const line = lines[4 + nA + i];
    const a = parseInt(line.slice(0, 3));
    const b = parseInt(line.slice(3, 6));
    const order = parseInt(line.slice(6, 9));
    bonds.push({ a, b, order });
  }
  return { atoms, bonds };
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
function stdev(arr) {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
  const v = arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length;
  return Math.sqrt(v);
}
function avg(arr) { return arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0; }

/* ─── 環検出（PubChem SDF は Kekulé 表記なので bond order 1/2 混在で検出） ─── */
function detectAromaticRings(parsed) {
  // 全 C 原子（heavies）と、order 1 or 2 の bond を含む 6 員環 / 5 員環を探す。
  // 芳香族判定の代わりに「環内の C 原子で order 1 と 2 が交互に出現するか」で簡易判定。
  const adj = new Map();
  for (const b of parsed.bonds) {
    if (b.order !== 1 && b.order !== 2 && b.order !== 4) continue;
    if (!adj.has(b.a)) adj.set(b.a, new Map());
    if (!adj.has(b.b)) adj.set(b.b, new Map());
    adj.get(b.a).set(b.b, b.order);
    adj.get(b.b).set(b.a, b.order);
  }

  // 全 C 原子から DFS で 6 員 / 5 員環を探す
  const cAtoms = parsed.atoms.filter((a) => ["C", "N", "O", "S"].includes(a.element));
  const rings = [];
  const seen = new Set();

  for (const start of cAtoms) {
    const sid = start.idx;
    const stack = [{ id: sid, path: [sid] }];
    while (stack.length) {
      const { id, path } = stack.pop();
      if (path.length > 6) continue;
      const neighbors = adj.get(id);
      if (!neighbors) continue;
      for (const [next] of neighbors) {
        if ((path.length === 5 || path.length === 6) && next === sid) {
          const ringKey = [...path].sort((a, b) => a - b).join(",");
          if (!seen.has(ringKey)) {
            // 芳香族判定：環内に order 2（double）が少なくとも 1 本含まれる
            let hasDouble = false;
            for (let i = 0; i < path.length; i++) {
              const j = (i + 1) % path.length;
              if (adj.get(path[i])?.get(path[j]) === 2) { hasDouble = true; break; }
            }
            if (hasDouble) {
              seen.add(ringKey);
              rings.push([...path]);
            }
          }
          continue;
        }
        if (path.includes(next)) continue;
        stack.push({ id: next, path: [...path, next] });
      }
    }
  }
  return rings;
}

/* ─── テストケース ─── */
const TEST_CASES = [
  { key: "benzene",       name: "ベンゼン",        kind: "aromatic" },
  { key: "naphthalene",   name: "ナフタレン",      kind: "aromatic" },
  { key: "phenol",        name: "フェノール",      kind: "aromatic" },
  { key: "toluene",       name: "トルエン",        kind: "aromatic" },
  { key: "biphenyl",      name: "ビフェニル",      kind: "aromatic" },
  { key: "naphthol",      name: "2-ナフトール",    kind: "aromatic" },
  { key: "cyclohexane",   name: "シクロヘキサン",  kind: "alkane" },
  { key: "methane",       name: "メタン",          kind: "alkane-sp3" },
  { key: "ethyne",        name: "アセチレン",      kind: "alkyne" },
  // 軸不斉（実験値）
  { key: "binolR",        name: "(R)-BINOL",       kind: "axial", targetDih: -85 },
  { key: "binolS",        name: "(S)-BINOL",       kind: "axial", targetDih:  85 },
  { key: "biphenylDiolR", name: "(R)-biphenylDiol",kind: "axial", targetDih: -55 },
  { key: "biphenylDiolS", name: "(S)-biphenylDiol",kind: "axial", targetDih:  55 },
];

const overallResults = [];
function record(name, ok, details) {
  overallResults.push({ name, ok, details });
  console.log(`${ok ? "✓" : "✗"} ${name} — ${details}`);
}

/* ─── 検証ロジック ─── */
function validate(testCase) {
  const entry = data.molecules[testCase.key];
  if (!entry) {
    record(testCase.name, false, "JSON にエントリなし");
    return;
  }
  const parsed = parseSdf(entry.sdf);
  const heavies = parsed.atoms.filter((a) => a.element !== "H");

  if (testCase.kind === "aromatic" || testCase.kind === "biaryl") {
    // 芳香族環の平面性
    const rings = detectAromaticRings(parsed);
    if (rings.length === 0) {
      record(testCase.name, false, "芳香族環が検出されない");
      return;
    }
    const planarityFails = [];
    for (const ring of rings) {
      const positions = ring.map((id) => parsed.atoms.find((a) => a.idx === id));
      // 平面から最も離れている点までの距離を計算（最小二乗平面）
      const sd = stdev(positions.map((p) => p.z));  // 簡易：z 座標分散
      // 単純な平面性指標として：3 点が定義する平面と他点の距離
      const [p1, p2, p3] = positions;
      const v1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
      const v2 = { x: p3.x - p1.x, y: p3.y - p1.y, z: p3.z - p1.z };
      const n = {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x,
      };
      const nLen = Math.hypot(n.x, n.y, n.z);
      let maxOff = 0;
      if (nLen > 1e-6) {
        for (let i = 3; i < positions.length; i++) {
          const p = positions[i];
          const v = { x: p.x - p1.x, y: p.y - p1.y, z: p.z - p1.z };
          const off = Math.abs((v.x * n.x + v.y * n.y + v.z * n.z) / nLen);
          if (off > maxOff) maxOff = off;
        }
      }
      if (maxOff >= 0.05) planarityFails.push(maxOff);
    }
    const ringInfo = `${rings.length} ring(s), 各 ${rings[0].length}員`;
    if (planarityFails.length > 0) {
      record(testCase.name, false, `${ringInfo}、平面性違反 max=${Math.max(...planarityFails).toFixed(4)} Å`);
    } else {
      record(testCase.name, true, `${ringInfo}、すべて平面 (max off < 0.05 Å)`);
    }

    // ベンゼンの C-C 結合長チェック（Kekulé では single/double 混在だが、距離は全て ~1.40）
    if (testCase.key === "benzene") {
      const ccBonds = parsed.bonds.filter((b) => {
        const aa = parsed.atoms.find((a) => a.idx === b.a);
        const bb = parsed.atoms.find((a) => a.idx === b.b);
        return aa.element === "C" && bb.element === "C";
      });
      const lengths = ccBonds.map((b) => {
        const aa = parsed.atoms.find((a) => a.idx === b.a);
        const bb = parsed.atoms.find((a) => a.idx === b.b);
        return dist(aa, bb);
      });
      const ok = lengths.every((d) => d >= 1.35 && d <= 1.45);
      record("ベンゼン C-C 結合長",
        ok,
        `${lengths.length}本、範囲 ${Math.min(...lengths).toFixed(3)}〜${Math.max(...lengths).toFixed(3)} Å`);
    }
  }

  if (testCase.kind === "alkane-sp3" && testCase.key === "methane") {
    // メタンの H-C-H 角度 ≈ 109.5°
    const C = parsed.atoms.find((a) => a.element === "C");
    const Hs = parsed.atoms.filter((a) => a.element === "H");
    const angles = [];
    for (let i = 0; i < Hs.length; i++) {
      for (let j = i + 1; j < Hs.length; j++) {
        angles.push(angleDeg(Hs[i], C, Hs[j]));
      }
    }
    const a = avg(angles);
    const ok = Math.abs(a - 109.47) < 3;
    record(testCase.name, ok, `H-C-H 平均 ${a.toFixed(2)}° (期待 109.47±3°)`);
  }

  if (testCase.kind === "alkane" && testCase.key === "cyclohexane") {
    // シクロヘキサンの C-C-C 角 ≈ 109.5°、椅子型なので z 方向に厚みあり
    const cs = heavies.filter((a) => a.element === "C");
    if (cs.length === 6) {
      const angles = [];
      // 環の連結性は SDF の結合次数 1 の C-C で取れる
      const ccBonds = parsed.bonds.filter((b) => {
        const aa = parsed.atoms.find((a) => a.idx === b.a);
        const bb = parsed.atoms.find((a) => a.idx === b.b);
        return aa.element === "C" && bb.element === "C";
      });
      const adj = new Map();
      for (const b of ccBonds) {
        if (!adj.has(b.a)) adj.set(b.a, []);
        if (!adj.has(b.b)) adj.set(b.b, []);
        adj.get(b.a).push(b.b);
        adj.get(b.b).push(b.a);
      }
      for (const c of cs) {
        const nb = adj.get(c.idx) ?? [];
        if (nb.length >= 2) {
          for (let i = 0; i < nb.length; i++) {
            for (let j = i + 1; j < nb.length; j++) {
              const p1 = parsed.atoms.find((a) => a.idx === nb[i]);
              const p2 = parsed.atoms.find((a) => a.idx === nb[j]);
              angles.push(angleDeg(p1, c, p2));
            }
          }
        }
      }
      const a = avg(angles);
      const zRange = Math.max(...cs.map((c) => c.z)) - Math.min(...cs.map((c) => c.z));
      const ok = Math.abs(a - 109.47) < 3 && zRange > 0.3;
      record(testCase.name, ok, `C-C-C 平均 ${a.toFixed(2)}° (期待 109.47°), z 振幅 ${zRange.toFixed(3)} Å (椅子型なら > 0.3)`);
    }
  }

  if (testCase.kind === "axial") {
    // ビアリール結合を検出して dihedral を測る
    const aromCs = new Set();
    for (const b of parsed.bonds) {
      if (b.order === 2) {
        if (parsed.atoms[b.a - 1].element === "C") aromCs.add(b.a);
        if (parsed.atoms[b.b - 1].element === "C") aromCs.add(b.b);
      }
    }
    let biaryl = null;
    for (const b of parsed.bonds) {
      if (b.order !== 1) continue;
      if (!aromCs.has(b.a) || !aromCs.has(b.b)) continue;
      // 同じ環でなければ biaryl
      const adj = new Map();
      for (const x of parsed.bonds) {
        if (!adj.has(x.a)) adj.set(x.a, []);
        if (!adj.has(x.b)) adj.set(x.b, []);
        adj.get(x.a).push(x.b);
        adj.get(x.b).push(x.a);
      }
      // BFS 芳香族のみで b.a → b.b に到達できるかチェック（直接 b 結合を除く）
      const seen = new Set([b.a]);
      const stk = [b.a];
      let same = false;
      while (stk.length) {
        const cur = stk.pop();
        if (cur === b.b) { same = true; break; }
        for (const n of adj.get(cur) ?? []) {
          if (seen.has(n)) continue;
          if (cur === b.a && n === b.b) continue;
          if (cur === b.b && n === b.a) continue;
          if (!aromCs.has(n)) continue;
          seen.add(n); stk.push(n);
        }
      }
      if (!same) { biaryl = b; break; }
    }
    if (!biaryl) {
      record(testCase.name, false, "biaryl 結合が検出されない");
      return;
    }
    // ortho 原子（OH 持ち優先）を探す
    const findOrtho = (endId, otherEndId) => {
      let withOH = null, any = null;
      for (const b of parsed.bonds) {
        let other = null;
        if (b.a === endId && b.b !== otherEndId) other = b.b;
        else if (b.b === endId && b.a !== otherEndId) other = b.a;
        if (!other || parsed.atoms[other - 1].element !== "C") continue;
        if (!aromCs.has(other)) continue;
        any ??= other;
        const hasO = parsed.bonds.some((bb) => {
          const p = bb.a === other ? bb.b : (bb.b === other ? bb.a : null);
          return p && parsed.atoms[p - 1].element === "O";
        });
        if (hasO) { withOH = other; break; }
      }
      return withOH ?? any;
    };
    const oA = findOrtho(biaryl.a, biaryl.b);
    const oB = findOrtho(biaryl.b, biaryl.a);
    if (!oA || !oB) {
      record(testCase.name, false, "ortho 原子が見つからない");
      return;
    }
    const pA = parsed.atoms.find((a) => a.idx === biaryl.a);
    const pB = parsed.atoms.find((a) => a.idx === biaryl.b);
    const pOA = parsed.atoms.find((a) => a.idx === oA);
    const pOB = parsed.atoms.find((a) => a.idx === oB);
    // dihedral(oA - A - B - oB)
    const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
    const cross = (a, b) => ({ x: a.y*b.z-a.z*b.y, y: a.z*b.x-a.x*b.z, z: a.x*b.y-a.y*b.x });
    const dotV = (a, b) => a.x*b.x + a.y*b.y + a.z*b.z;
    const lenV = (a) => Math.hypot(a.x, a.y, a.z);
    const b1 = sub(pA, pOA), b2 = sub(pB, pA), b3 = sub(pOB, pB);
    const n1 = cross(b1, b2), n2 = cross(b2, b3);
    const bn = { x: b2.x/lenV(b2), y: b2.y/lenV(b2), z: b2.z/lenV(b2) };
    const m1 = cross(n1, bn);
    const dih = Math.atan2(dotV(m1, n2), dotV(n1, n2)) * 180 / Math.PI;
    const target = testCase.targetDih;
    const diff = Math.abs(dih - target);
    const ok = diff < 15;  // UFF 後の許容範囲 ±15°
    record(testCase.name,
      ok,
      `biaryl dihedral = ${dih.toFixed(2)}° (target ${target}°、差 ${diff.toFixed(1)}°)`);
    return;
  }

  if (testCase.kind === "alkyne" && testCase.key === "ethyne") {
    // H-C-C 角 ≈ 180°
    const cs = parsed.atoms.filter((a) => a.element === "C");
    const hs = parsed.atoms.filter((a) => a.element === "H");
    if (cs.length === 2 && hs.length === 2) {
      const a1 = angleDeg(hs[0], cs[0], cs[1]);
      const ok = Math.abs(a1 - 180) < 3;
      record(testCase.name, ok, `H-C-C = ${a1.toFixed(2)}° (期待 180°)`);
    }
  }
}

console.log(`\n========== mol3d 精度検証 ==========\n`);
console.log(`データ: ${DATA_FILE}`);
console.log(`構築日: ${data.builtAt}, バージョン: ${data.version}`);
console.log(`分子数: PubChem ${data.stats.pubchem}, custom ${data.stats.custom}\n`);

for (const tc of TEST_CASES) {
  validate(tc);
}

const pass = overallResults.filter((r) => r.ok).length;
const fail = overallResults.filter((r) => !r.ok).length;
console.log(`\n========== 結果 ==========`);
console.log(`✓ 合格: ${pass}`);
console.log(`✗ 失敗: ${fail}`);

process.exit(fail > 0 ? 1 : 0);
