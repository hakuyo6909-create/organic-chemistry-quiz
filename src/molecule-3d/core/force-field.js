/**
 * 簡易 UFF 力場（Phase 5）
 *
 * 全エネルギー：
 *   E = E_bond + E_angle + E_improper + E_vdW
 *
 * 解析勾配で各原子の force = -dE/dp を計算する。
 * 最適化アルゴリズム：最急降下法 + バックトラッキング線形探索。
 *
 *   bond:     E = ½ k_b (r - r₀)²
 *   angle:    E = ½ k_θ (θ - θ₀)²
 *   improper: E = ½ k_imp ω²  （sp² 中心、ω = out-of-plane 角）
 *   vdW:      LJ 12-6, 1-2, 1-3 結合は除外
 */

import { lookupBondLength } from "../constants/bond-lengths.js";
import { idealBondAngle, DEG_TO_RAD } from "../constants/bond-angles.js";
import {
  bondForceConstant,
  vdwPairParams,
  FF_ANGLE_K,
  FF_IMPROPER_K,
} from "../constants/ff-parameters.js";

/* ─────────── ベクトル演算 ─────────── */
const v = (x, y, z) => ({ x, y, z });
const vAdd = (a, b) => v(a.x + b.x, a.y + b.y, a.z + b.z);
const vSub = (a, b) => v(a.x - b.x, a.y - b.y, a.z - b.z);
const vScale = (a, s) => v(a.x * s, a.y * s, a.z * s);
const vDot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const vCross = (a, b) => v(
  a.y * b.z - a.z * b.y,
  a.z * b.x - a.x * b.z,
  a.x * b.y - a.y * b.x,
);
const vLen = (a) => Math.sqrt(vDot(a, a));
const vNorm = (a) => { const L = vLen(a); return L < 1e-12 ? v(0, 0, 0) : vScale(a, 1 / L); };
const vZero = () => v(0, 0, 0);

/* ─────────── 結合伸縮 ─────────── */

/**
 * 結合エネルギーと解析勾配。
 * E = ½ k (r - r₀)²
 * dE/dpA = k (r - r₀) (pA - pB) / r
 *
 * @returns {{energy, gradA, gradB}}
 */
function bondEnergyGrad(pA, pB, r0, k) {
  const diff = vSub(pA, pB);
  const r = vLen(diff);
  if (r < 1e-9) return { energy: 0, gradA: vZero(), gradB: vZero() };
  const dr = r - r0;
  const energy = 0.5 * k * dr * dr;
  const scale = k * dr / r;
  const gA = vScale(diff, scale);
  const gB = vScale(diff, -scale);
  return { energy, gradA: gA, gradB: gB };
}

/* ─────────── 結合角 ─────────── */

/**
 * 結合角エネルギーと解析勾配（中心 pC、両側 pI, pJ）。
 * E = ½ k (θ - θ₀)²
 *
 * 解析勾配の導出：
 *   u = pI - pC, v = pJ - pC,  cosθ = u·v / (|u||v|)
 *   d cosθ / d pI = (v̂ - cosθ · û) / |u|
 *   dθ/dpI = -(d cosθ/d pI) / sinθ = (cosθ·û - v̂) / (|u| sinθ)
 *   pJ も対称。pC は -(grad pI + grad pJ)。
 */
function angleEnergyGrad(pI, pC, pJ, theta0, k) {
  const u = vSub(pI, pC);
  const vv = vSub(pJ, pC);
  const uLen = vLen(u), vLenv = vLen(vv);
  if (uLen < 1e-9 || vLenv < 1e-9) {
    return { energy: 0, gradI: vZero(), gradC: vZero(), gradJ: vZero() };
  }
  let cosT = vDot(u, vv) / (uLen * vLenv);
  cosT = Math.max(-1, Math.min(1, cosT));
  const theta = Math.acos(cosT);
  const sinT = Math.sin(theta);
  const dtheta = theta - theta0;
  const energy = 0.5 * k * dtheta * dtheta;

  if (sinT < 1e-6) {
    // 直線配置 → 勾配は不安定。0 を返す（次のステップで動くと期待）
    return { energy, gradI: vZero(), gradC: vZero(), gradJ: vZero() };
  }

  const uHat = vScale(u, 1 / uLen);
  const vHat = vScale(vv, 1 / vLenv);
  // dθ/dpI = (cosθ · û - v̂) / (|u| sinθ)
  const factorI = 1 / (uLen * sinT);
  const gThetaI = vScale(vSub(vScale(uHat, cosT), vHat), factorI);
  const factorJ = 1 / (vLenv * sinT);
  const gThetaJ = vScale(vSub(vScale(vHat, cosT), uHat), factorJ);
  const gThetaC = vScale(vAdd(gThetaI, gThetaJ), -1);

  const dE_dtheta = k * dtheta;
  return {
    energy,
    gradI: vScale(gThetaI, dE_dtheta),
    gradC: vScale(gThetaC, dE_dtheta),
    gradJ: vScale(gThetaJ, dE_dtheta),
  };
}

/* ─────────── sp² 平面性（improper torsion） ─────────── */

/**
 * sp² 中心 C と 3 つの結合先 A, B, D に対し、D が平面 (A, B, C) からどれだけ
 * 離れているか（dihedral pseudo-angle）を harmonic で 0 に近づける。
 *
 * ω は D-C の方向が平面 (A, B, C) と成す角（垂直方向の符号付き角）。
 * E = ½ k_imp ω²、勾配は数値微分で計算（解析は煩雑なため）。
 *
 * Phase 5 minimum では「ω の sin」を平面性スカラーとして使い、harmonic とする：
 *   sinω = n̂ · d̂  where n̂ = norm((pA-pC) × (pB-pC)), d̂ = norm(pD-pC)
 *   E = ½ k_imp · (sinω)²
 */
function improperEnergyGrad(pA, pB, pC, pD, k, atoms, indices, gradient) {
  const u = vSub(pA, pC);
  const w = vSub(pB, pC);
  const d = vSub(pD, pC);
  const nVec = vCross(u, w);
  const nLen = vLen(nVec);
  const dLen = vLen(d);
  if (nLen < 1e-9 || dLen < 1e-9) return 0;
  const sinOmega = vDot(nVec, d) / (nLen * dLen);
  const energy = 0.5 * k * sinOmega * sinOmega;
  // 簡易：数値勾配を計算してアキュムレートする
  const step = 1e-5;
  const compute = () => {
    const u2 = vSub(pA, pC), w2 = vSub(pB, pC), d2 = vSub(pD, pC);
    const n2 = vCross(u2, w2);
    const nL = vLen(n2), dL = vLen(d2);
    if (nL < 1e-9 || dL < 1e-9) return 0;
    const so = vDot(n2, d2) / (nL * dL);
    return 0.5 * k * so * so;
  };
  for (const [idx, pt] of [[indices[0], pA], [indices[1], pB], [indices[2], pC], [indices[3], pD]]) {
    for (const axis of ["x", "y", "z"]) {
      const orig = pt[axis];
      pt[axis] = orig + step;
      const ep = compute();
      pt[axis] = orig - step;
      const em = compute();
      pt[axis] = orig;
      gradient[idx][axis] += (ep - em) / (2 * step);
    }
  }
  return energy;
}

/* ─────────── van der Waals (Lennard-Jones 12-6) ─────────── */

/**
 * LJ 12-6 エネルギーと解析勾配。
 * E = D [(x/r)^12 - 2 (x/r)^6]
 * dE/dr = D · 12/r [(x/r)^6 - (x/r)^12]
 */
function vdwEnergyGrad(pA, pB, D, x) {
  const diff = vSub(pA, pB);
  const r = vLen(diff);
  if (r < 1e-6) return { energy: 0, gradA: vZero(), gradB: vZero() };
  const xr = x / r;
  const xr6 = Math.pow(xr, 6);
  const xr12 = xr6 * xr6;
  const energy = D * (xr12 - 2 * xr6);
  const dE_dr = D * (12 / r) * (xr6 - xr12);
  const grad = vScale(diff, dE_dr / r);
  return { energy, gradA: grad, gradB: vScale(grad, -1) };
}

/* ─────────── 1-2 / 1-3 ペア除外用テーブル ─────────── */

function buildExclusionTable(mol) {
  const excl = mol.atoms.map(() => new Set());
  for (const a of mol.atoms) {
    for (const b of a.bonds) {
      excl[a.id].add(b.otherId);
      // 1-3 ペア（中心経由）
      for (const b2 of mol.atoms[b.otherId].bonds) {
        if (b2.otherId !== a.id) excl[a.id].add(b2.otherId);
      }
    }
  }
  return excl;
}

/* ─────────── 全エネルギーと全勾配 ─────────── */

/**
 * 分子の全 UFF エネルギーと、各原子に対する勾配を計算する。
 *
 * @param {Object} mol  分子グラフ
 * @returns {{energy: number, gradient: {x,y,z}[], details: Object}}
 *   details: { bond, angle, improper, vdw } の各成分エネルギー
 */
export function computeEnergyAndGradient(mol) {
  const n = mol.atoms.length;
  const gradient = Array.from({ length: n }, () => vZero());
  let Ebond = 0, Eangle = 0, Eimp = 0, Evdw = 0;

  // 1) 結合
  for (const b of mol.bonds) {
    const A = mol.atoms[b.a], B = mol.atoms[b.b];
    const r0 = lookupBondLength(A.element, B.element, A.hybridization, B.hybridization, b.order);
    const k = bondForceConstant(A, B, r0);
    const r = bondEnergyGrad(A.position, B.position, r0, k);
    Ebond += r.energy;
    gradient[b.a] = vAdd(gradient[b.a], r.gradA);
    gradient[b.b] = vAdd(gradient[b.b], r.gradB);
  }

  // 2) 角度
  for (const center of mol.atoms) {
    if (center.bonds.length < 2 || center.element === "H") continue;
    const theta0 = idealBondAngle(center.hybridization, {
      element: center.element,
      sigmaCount: center.bonds.length,
      lonePairCount: center.lonePairs ?? 0,
    }) * DEG_TO_RAD;
    const nbrIds = center.bonds.map((bb) => bb.otherId);
    for (let i = 0; i < nbrIds.length; i++) {
      for (let j = i + 1; j < nbrIds.length; j++) {
        const I = mol.atoms[nbrIds[i]];
        const J = mol.atoms[nbrIds[j]];
        const r = angleEnergyGrad(I.position, center.position, J.position, theta0, FF_ANGLE_K);
        Eangle += r.energy;
        gradient[nbrIds[i]] = vAdd(gradient[nbrIds[i]], r.gradI);
        gradient[center.id] = vAdd(gradient[center.id], r.gradC);
        gradient[nbrIds[j]] = vAdd(gradient[nbrIds[j]], r.gradJ);
      }
    }
  }

  // 3) 平面性（sp² 原子で 3 結合を持つもの）
  for (const c of mol.atoms) {
    if (c.hybridization !== "sp2") continue;
    if (c.bonds.length !== 3) continue;
    const [a, b, d] = c.bonds.map((bb) => bb.otherId);
    Eimp += improperEnergyGrad(
      mol.atoms[a].position, mol.atoms[b].position,
      c.position, mol.atoms[d].position,
      FF_IMPROPER_K,
      mol.atoms, [a, b, c.id, d], gradient,
    );
  }

  // 4) van der Waals (1-2, 1-3 を除外)
  const excl = buildExclusionTable(mol);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (excl[i].has(j)) continue;
      const A = mol.atoms[i], B = mol.atoms[j];
      const { D, x } = vdwPairParams(A, B);
      const r = vdwEnergyGrad(A.position, B.position, D, x);
      Evdw += r.energy;
      gradient[i] = vAdd(gradient[i], r.gradA);
      gradient[j] = vAdd(gradient[j], r.gradB);
    }
  }

  return {
    energy: Ebond + Eangle + Eimp + Evdw,
    gradient,
    details: { bond: Ebond, angle: Eangle, improper: Eimp, vdw: Evdw },
  };
}

/* ─────────── 最適化（最急降下法 + バックトラッキング） ─────────── */

/**
 * 最急降下法による最適化。バックトラッキング線形探索でステップサイズを調整。
 *
 * @param {Object} mol      分子グラフ（position が設定済みの atoms を持つ）
 * @param {Object} [options]
 *   maxIter      最大反復数（既定 200）
 *   tol          最大力 |g|_max がこれ以下で収束（既定 0.05 kcal/mol/Å）
 *   initialStep  初期ステップサイズ（既定 0.05 Å）
 *   verbose      console.log を有効化（既定 false）
 * @returns {{ converged: boolean, iterations: number, finalEnergy: number }}
 */
export function minimize(mol, options = {}) {
  const maxIter = options.maxIter ?? 200;
  const tol = options.tol ?? 0.05;
  const verbose = options.verbose ?? false;
  let step = options.initialStep ?? 0.05;

  let { energy: prevE, gradient: prevG } = computeEnergyAndGradient(mol);
  const initialEnergy = prevE;
  let converged = false;
  let iter = 0;

  for (iter = 0; iter < maxIter; iter++) {
    const maxG = maxComponent(prevG);
    if (verbose && iter % 10 === 0) {
      console.log(`  iter ${iter}: E=${prevE.toFixed(4)} maxG=${maxG.toFixed(4)} step=${step.toFixed(4)}`);
    }
    if (maxG < tol) { converged = true; break; }

    // 試行ステップ：原子位置を -gradient 方向に動かす
    const trial = mol.atoms.map((a) => v(
      a.position.x - step * prevG[a.id].x,
      a.position.y - step * prevG[a.id].y,
      a.position.z - step * prevG[a.id].z,
    ));
    // 一時的に位置を交換してエネルギー評価
    const origPositions = mol.atoms.map((a) => ({ ...a.position }));
    for (let i = 0; i < mol.atoms.length; i++) mol.atoms[i].position = trial[i];
    const { energy: trialE, gradient: trialG } = computeEnergyAndGradient(mol);

    if (trialE < prevE) {
      // 改善：受理。次のステップは少し大きく
      prevE = trialE;
      prevG = trialG;
      step = Math.min(step * 1.2, 0.2);
    } else {
      // 改善せず：元に戻してステップを縮小
      for (let i = 0; i < mol.atoms.length; i++) mol.atoms[i].position = origPositions[i];
      step *= 0.5;
      if (step < 1e-6) break;
    }
  }

  return {
    converged,
    iterations: iter,
    initialEnergy,
    finalEnergy: prevE,
  };
}

/* ─────────── ヘルパ ─────────── */

function maxComponent(gradArr) {
  let m = 0;
  for (const g of gradArr) {
    const L = Math.sqrt(g.x * g.x + g.y * g.y + g.z * g.z);
    if (L > m) m = L;
  }
  return m;
}
