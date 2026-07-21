/**
 * 3D 座標生成モジュール（Build-up 法）
 *
 * 分子グラフを幅優先で辿り、各原子を化学法則（結合長 + VSEPR 結合角）
 * に従って順次配置する。Phase 1 では sp³ 四面体のみを扱う。
 *
 * 座標系：右手系の三次元ユークリッド空間、単位 Å。
 *         配置の起点を原点 (0,0,0) におく。
 *
 * 主要関数：
 *   buildGeometry(mol)               メインエントリ
 *   placeNextAtom(center, ...)       次の原子の配置方向を決定
 *   addImplicitHydrogens(mol)        残り価数分の H を追加
 */

import { lookupBondLength } from "../constants/bond-lengths.js";
import { idealBondAngle, DEG_TO_RAD } from "../constants/bond-angles.js";
import { pickTemplate, applyRingTemplate } from "../constants/ring-templates.js";

/* ─────────── 最小限のベクトル演算 ─────────── */

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
const vNorm = (a) => {
  const L = vLen(a);
  return L < 1e-9 ? v(1, 0, 0) : vScale(a, 1 / L);
};
const vNeg = (a) => v(-a.x, -a.y, -a.z);

/** 任意軸 axis（単位ベクトル）まわりに angle ラジアン回転（Rodrigues） */
function vRotateAround(vec, axis, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const k = axis;
  const term1 = vScale(vec, c);
  const term2 = vScale(vCross(k, vec), s);
  const term3 = vScale(k, vDot(k, vec) * (1 - c));
  return vAdd(vAdd(term1, term2), term3);
}

/** ベクトル v に垂直な単位ベクトルを 1 つ返す */
function anyPerpendicular(vec) {
  const n = vNorm(vec);
  const helper = Math.abs(n.x) < 0.9 ? v(1, 0, 0) : v(0, 1, 0);
  return vNorm(vCross(n, helper));
}

/* ─────────── 配置方向の計算 ─────────── */

/**
 * 中心原子の混成と既存隣接方向ベクトル群から、次に配置する隣接原子の
 * 単位方向ベクトルを返す。
 *
 * VSEPR の幾何学的原則：
 *  - 既存 0 本 → 標準方向（+x）
 *  - 既存 1 本 → 既存方向に対し結合角だけ傾けた単位ベクトル
 *               （方位角の自由度は任意 → 0 をデフォルト）
 *  - 既存 2 本 → 既存 2 ベクトルが張る平面の二等分軸の逆向きに沿いつつ、
 *               その平面に垂直方向に四面体の角度を持つ位置（sp³）
 *  - 既存 3 本 → 既存 3 ベクトルの和の逆向き（一意に決まる）
 *
 * @param {string} hybridization 中心原子の混成
 * @param {Array<{x,y,z}>} existingDirs 中心から既存隣接原子への単位ベクトル群
 * @param {Object} [opts] { atomContext: ... } 結合角の実測値補正用
 * @returns {{x,y,z}} 次の隣接原子への単位方向ベクトル
 */
export function computeNextDirection(hybridization, existingDirs, opts = {}) {
  const angleDeg = idealBondAngle(hybridization, opts.atomContext);
  const angle = angleDeg * DEG_TO_RAD;

  if (existingDirs.length === 0) {
    return v(1, 0, 0);
  }

  if (existingDirs.length === 1) {
    // d1 から結合角 θ だけ離れた方向に置く。
    // 方位角の自由度は、dihedralAnchorRel（grandparent の中心相対位置）が与えられて
    // いれば「anti 二面角（180°）」を満たすように選ぶ。なければ任意の perp で固定。
    const d1 = vNorm(existingDirs[0]);
    if (opts.dihedralAnchorRel) {
      const gpVec = opts.dihedralAnchorRel;
      // d1 に垂直な平面への gpVec の射影
      const gpPerp = vSub(gpVec, vScale(d1, vDot(gpVec, d1)));
      if (vLen(gpPerp) >= 1e-6) {
        const gpPerpUnit = vNorm(gpPerp);
        const cosT = Math.cos(angle), sinT = Math.sin(angle);
        // anti 二面角 → 新方向の perp 成分は -gpPerpUnit
        return vNorm(vAdd(
          vScale(d1, cosT),
          vScale(vNeg(gpPerpUnit), sinT),
        ));
      }
    }
    const perp = anyPerpendicular(d1);
    return vNorm(vRotateAround(d1, perp, angle));
  }

  if (existingDirs.length === 2) {
    // sp³ 四面体の場合：残り 2 本は plane(a,b) の法線方向に開いた 1 対。
    // 新規方向 = cos(α)·(-bisector) + sin(α)·normal
    //   ここで α は -bisector とのなす角で、a と b それぞれと結合角 θ を満たす条件から
    //   α = arccos( cos(θ) / (-cos(angle(a,b)/2)) ) として一意に決まる。
    //   完全な sp³（θ=109.47°、angle(a,b)=109.47°）では α = arccos(1/√3) ≈ 54.7356°。
    const a = vNorm(existingDirs[0]);
    const b = vNorm(existingDirs[1]);
    const sumAB = vAdd(a, b);
    if (vLen(sumAB) < 1e-6) {
      // a, b が反平行（直線配置）→ a に垂直な方向に置く
      return anyPerpendicular(a);
    }
    const bisector = vNorm(sumAB);
    const crossAB = vCross(a, b);
    if (vLen(crossAB) < 1e-6) {
      // a, b が平行 → bisector の逆向きから θ 傾ける
      const perp = anyPerpendicular(bisector);
      return vNorm(vRotateAround(vNeg(bisector), perp, angle));
    }
    const normal = vNorm(crossAB);
    const cosThetaAB = Math.max(-1, Math.min(1, vDot(a, b)));
    const halfAB = Math.acos(cosThetaAB) / 2;
    const cosTheta = Math.cos(angle);
    const denom = -Math.cos(halfAB);
    let cosAlpha;
    if (Math.abs(denom) < 1e-6) {
      cosAlpha = 1 / Math.sqrt(3);  // 直線配置の極限ケース。理論値に退避
    } else {
      cosAlpha = cosTheta / denom;
      cosAlpha = Math.max(-1, Math.min(1, cosAlpha));
    }
    const sinAlpha = Math.sqrt(Math.max(0, 1 - cosAlpha * cosAlpha));
    return vNorm(vAdd(
      vScale(vNeg(bisector), cosAlpha),
      vScale(normal, sinAlpha),
    ));
  }

  if (existingDirs.length === 3) {
    let sum = v(0, 0, 0);
    for (const d of existingDirs) sum = vAdd(sum, vNorm(d));
    return vNorm(vNeg(sum));
  }

  // 4 本以上は基本ありえない（5 配位以上はここでは未対応）
  console.warn(`[geometry-builder] cannot place beyond 4 neighbors (sp3 limit)`);
  return v(0, 0, 1);
}

/* ─────────── Build-up メイン ─────────── */

/**
 * 分子グラフを受け取り、各原子に position {x, y, z} を書き込む。
 * 既に position が設定されている原子は固定（環テンプレート等から呼ばれる場合）。
 *
 * 戻り値は引数の mol（破壊的更新）。
 *
 * @param {Object} mol 分子グラフ
 *   atoms: [{ id, element, hybridization, lonePairs, bonds: [{otherId, order}] }]
 *   bonds: [{ a, b, order }]
 */
export function buildGeometry(mol) {
  if (mol.atoms.length === 0) return mol;

  // 1) 環検出と環テンプレート配置（Phase 4）
  const rings = detectRings(mol);
  if (rings.length > 0) {
    placeRings(mol, rings);
  }

  // 2) BFS 起点を決定
  const heavy = mol.atoms.filter((a) => a.element !== "H");
  if (heavy.length === 0) {
    mol.atoms[0].position = v(0, 0, 0);
    return mol;
  }

  const visited = new Set();
  const queue = [];
  // 環テンプレートで配置済みの原子を起点に登録
  for (const a of mol.atoms) {
    if (a.position !== undefined && a.element !== "H") {
      visited.add(a.id);
      queue.push(a);
    }
  }

  if (queue.length === 0) {
    // 環がない非環分子：Phase 1-3 と同じ root 選択
    let root = heavy[0];
    for (const a of heavy) {
      if (a.bonds.filter((b) => mol.atoms[b.otherId].element !== "H").length >
          root.bonds.filter((b) => mol.atoms[b.otherId].element !== "H").length) {
        root = a;
      }
    }
    if (!root.position) root.position = v(0, 0, 0);
    visited.add(root.id);
    queue.push(root);
  }

  while (queue.length > 0) {
    const center = queue.shift();
    const heavyNeighbors = center.bonds
      .map((b) => mol.atoms[b.otherId])
      .filter((a) => a.element !== "H");

    for (const nb of heavyNeighbors) {
      if (visited.has(nb.id)) continue;
      const placedNeighbors = center.bonds
        .map((b) => mol.atoms[b.otherId])
        .filter((a) => a.position !== undefined && a.id !== nb.id);
      const existingDirs = placedNeighbors.map((a) => vSub(a.position, center.position));

      // grandparent アンカー（anti 二面角でジグザグを実現）
      let dihedralAnchorRel = null;
      if (existingDirs.length === 1) {
        const parent = placedNeighbors[0];
        const anchor = findPlacedNeighbor(mol, parent, center.id);
        if (anchor) dihedralAnchorRel = vSub(anchor, center.position);
      }

      const dir = computeNextDirection(
        center.hybridization,
        existingDirs,
        {
          atomContext: {
            element: center.element,
            sigmaCount: center.bonds.length,
            lonePairCount: center.lonePairs ?? 0,
          },
          dihedralAnchorRel,
        },
      );
      const bondOrder = center.bonds.find((b) => b.otherId === nb.id).order;
      const length = lookupBondLength(
        center.element, nb.element,
        center.hybridization, nb.hybridization,
        bondOrder,
      );
      nb.position = vAdd(center.position, vScale(dir, length));
      visited.add(nb.id);
      queue.push(nb);
    }
  }

  addImplicitHydrogens(mol);
  return mol;
}

/**
 * 指定原子の既配置の隣接原子（除外 ID 以外）を 1 つ返す。なければ null。
 * @param {Object} mol  分子グラフ
 * @param {Object} atom  探索対象の原子
 * @param {number} excludeId  除外する原子の id
 * @returns {{x,y,z}|null} 隣接原子の position またはnull
 */
function findPlacedNeighbor(mol, atom, excludeId) {
  for (const b of atom.bonds) {
    if (b.otherId === excludeId) continue;
    const candidate = mol.atoms[b.otherId];
    if (candidate.position !== undefined) return candidate.position;
  }
  return null;
}

/* ─────────── 環検出 (簡易 SSSR) ─────────── */

/**
 * mol.ringClosures から各環を抽出する（簡易 SSSR）。
 *
 * 各閉環ボンドについて、最小の環を選ぶ。複数の閉環が交差する場合（縮環）には、
 * 2 パス BFS で正しい SSSR を導出する：
 *   pass1: 全閉環ボンドを除外して BFS → 純粋なチェーン経由の最短経路
 *   pass2: 当該閉環のみ除外して BFS → 他閉環をショートカットとして使う最短経路
 * pass2 が pass1 より厳密に短ければ pass2 を採用（共役ショートカット）、
 * そうでなければ pass1（純鎖、他環との非重複）を採用する。
 *
 * 例：ナフタレン c1ccc2ccccc2c1
 *   - 閉環 3-8：pass1=ring B [3,4,5,6,7,8] サイズ 6、pass2 も同じサイズ 6 → pass1 採用
 *   - 閉環 0-9：pass1=サイズ 10（外周）、pass2=ring A [0,1,2,3,8,9] サイズ 6 → pass2 採用
 *
 * @param {Object} mol  分子グラフ（ringClosures フィールドを持つ）
 * @returns {number[][]}  各環の原子 id 配列（巡回順）
 */
export function detectRings(mol) {
  if (!mol.ringClosures || mol.ringClosures.length === 0) return [];
  const allClosures = mol.ringClosures;
  const rings = [];
  for (const cl of allClosures) {
    const conservative = shortestPathExcludingBonds(mol, cl.a, cl.b, allClosures);
    const liberal = shortestPathExcludingBonds(mol, cl.a, cl.b, [cl]);
    let chosen;
    if (liberal && conservative && liberal.length < conservative.length) {
      chosen = liberal;
    } else if (conservative) {
      chosen = conservative;
    } else {
      chosen = liberal;
    }
    if (chosen) rings.push(chosen);
  }
  return rings;
}

/**
 * start → end の最短経路を BFS で求める。excludedBonds に含まれるボンドは使わない。
 * @returns {number[]|null}  経路（両端含む）または見つからなければ null
 */
function shortestPathExcludingBonds(mol, start, end, excludedBonds) {
  const isExcluded = (a, b) =>
    excludedBonds.some((eb) =>
      (eb.a === a && eb.b === b) || (eb.b === a && eb.a === b),
    );
  const visited = new Set([start]);
  const parent = new Map();
  const queue = [start];
  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur === end) {
      const path = [];
      let n = end;
      while (n !== undefined) { path.unshift(n); n = parent.get(n); }
      return path;
    }
    for (const b of mol.atoms[cur].bonds) {
      const other = b.otherId;
      if (isExcluded(cur, other)) continue;
      if (visited.has(other)) continue;
      visited.add(other);
      parent.set(other, cur);
      queue.push(other);
    }
  }
  return null;
}

/**
 * 検出した環群を順に配置する。
 * 1 つ目は絶対座標、2 つ目以降は既配置の共有原子に合わせてリジッド変換。
 *
 * @param {Object} mol     分子グラフ
 * @param {number[][]} rings  環群（各環は原子 id 配列）
 */
function placeRings(mol, rings) {
  // すでに配置済みの原子を含む環を後に配置するため、複数パスで処理。
  // 配置順位（優先度高→低）:
  //   1) 初回の環（既配置原子なし）
  //   2) 共有原子 ≥ 2 の環（縮環、リジッド変換で配置）
  //   3) 共有原子 = 1 の環（並進のみで配置）
  //   4) 共有原子 = 0 だが「環外原子経由で既配置原子に連結」する環（ビフェニル型）
  //   5) 完全孤立の環（origin から大きくオフセットして配置）
  const remaining = rings.slice();
  let safetyPasses = remaining.length * 2 + 2;
  while (remaining.length > 0 && safetyPasses-- > 0) {
    let placed = false;
    // 優先度の高い順に試す
    const tryWithPriority = (priorityCheck) => {
      for (let idx = 0; idx < remaining.length; idx++) {
        const ring = remaining[idx];
        const sharedCount = ring.filter((id) => mol.atoms[id].position !== undefined).length;
        const isFirst = mol.atoms.every((a) => a.position === undefined);
        if (!priorityCheck(sharedCount, isFirst, ring)) continue;

        const atomsInRing = ring.map((id) => mol.atoms[id]);
        const template = pickTemplate(atomsInRing);
        if (!template) {
          remaining.splice(idx, 1);
          return true;
        }
        if (sharedCount === 0 && !isFirst) {
          // ビフェニル型：環外原子経由で連結する場合は、その連結点で位置を確定
          placeBridgedRing(mol, ring, template);
        } else {
          applyRingTemplate(mol, ring, template);
        }
        remaining.splice(idx, 1);
        return true;
      }
      return false;
    };

    placed =
      tryWithPriority((s, isFirst) => isFirst && s === 0) ||
      tryWithPriority((s, isFirst) => !isFirst && s >= 2) ||
      tryWithPriority((s, isFirst) => !isFirst && s === 1) ||
      tryWithPriority((s, isFirst, ring) =>
        !isFirst && s === 0 && hasBridgeToPlaced(mol, ring)) ||
      tryWithPriority((s, isFirst) => !isFirst && s === 0);

    if (!placed) {
      console.warn("[geometry-builder] could not place remaining rings:", remaining);
      break;
    }
  }
}

/**
 * 環の任意の原子が、環外の既配置原子に連結しているかを確認。
 * （ビフェニル型 / 連結された disconnected ring 用）
 */
function hasBridgeToPlaced(mol, ring) {
  const ringSet = new Set(ring);
  for (const id of ring) {
    for (const b of mol.atoms[id].bonds) {
      if (ringSet.has(b.otherId)) continue;
      if (mol.atoms[b.otherId].position !== undefined) return true;
    }
  }
  return false;
}

/**
 * 共有原子 0 だが、環外で既配置原子と結合した環を配置する。
 *
 * 手順：
 *   1) 連結点（環内 anchorRingAtom と 既配置 anchorPlacedAtom）を見つける
 *   2) outDir = 既配置原子から見た「外側」方向（既配置隣接原子の合計の逆向き）
 *   3) **テンプレートを回転**：テンプレート内の anchor→center 方向を outDir と
 *      一致させる。これで環中心が anchorPlacedAtom から見て**より外側**に来る。
 *      （回転しないと環中心が placed atom にめり込み、原子が重なる）
 *   4) 並進：rotated[anchorIdx] が placedPos + outDir · bondLen に来るよう移動
 */
function placeBridgedRing(mol, ring, template) {
  const ringSet = new Set(ring);
  let anchorRingAtomIdx = -1;
  let anchorPlacedId = -1;
  let bondOrderToBridge = 1;
  for (let i = 0; i < ring.length; i++) {
    const id = ring[i];
    for (const b of mol.atoms[id].bonds) {
      if (ringSet.has(b.otherId)) continue;
      if (mol.atoms[b.otherId].position !== undefined) {
        anchorRingAtomIdx = i;
        anchorPlacedId = b.otherId;
        bondOrderToBridge = b.order;
        break;
      }
    }
    if (anchorRingAtomIdx !== -1) break;
  }

  if (anchorRingAtomIdx === -1) {
    // 完全孤立 → 大きくオフセット
    const offset = v(10, 0, 0);
    for (let i = 0; i < ring.length; i++) {
      mol.atoms[ring[i]].position = vAdd(template[i], offset);
    }
    return;
  }

  const placedPos = mol.atoms[anchorPlacedId].position;
  const placedAtom = mol.atoms[anchorPlacedId];
  let outDir = v(1, 0, 0);
  const otherNbrPositions = placedAtom.bonds
    .filter((bb) => mol.atoms[bb.otherId].position !== undefined && !ringSet.has(bb.otherId))
    .map((bb) => mol.atoms[bb.otherId].position);
  if (otherNbrPositions.length > 0) {
    let sum = v(0, 0, 0);
    for (const p of otherNbrPositions) sum = vAdd(sum, vNorm(vSub(p, placedPos)));
    if (vLen(sum) > 1e-6) outDir = vNorm(vScale(sum, -1));
  }

  const ringAnchorAtom = mol.atoms[ring[anchorRingAtomIdx]];
  const bondLen = lookupBondLength(
    placedAtom.element, ringAnchorAtom.element,
    placedAtom.hybridization, ringAnchorAtom.hybridization,
    bondOrderToBridge,
  );

  // ── テンプレートの回転：anchor→center 方向を outDir と整合させる ──
  // テンプレートでは center=原点、anchor=template[anchorIdx]。
  // 「anchor から center へ向かう方向」= -template[anchorIdx]（単位ベクトル化）
  // これを outDir に揃える回転を計算。
  const templateAnchor = template[anchorRingAtomIdx];
  const templateAnchorLen = vLen(templateAnchor);

  let rotated;
  if (templateAnchorLen < 1e-6) {
    rotated = template.slice();
  } else {
    const fromUnit = vScale(templateAnchor, -1 / templateAnchorLen);
    const dotFT = vDot(fromUnit, outDir);
    if (Math.abs(dotFT - 1) < 1e-9) {
      // すでに整合
      rotated = template.slice();
    } else if (Math.abs(dotFT + 1) < 1e-9) {
      // 反平行 → 180° 反転（任意の垂直軸まわり）
      const perp = Math.abs(fromUnit.x) < 0.9 ? v(1, 0, 0) : v(0, 1, 0);
      const rotAxis = vNorm(vCross(fromUnit, perp));
      rotated = template.map((p) => rotateVec(p, rotAxis, Math.PI));
    } else {
      const axis = vNorm(vCross(fromUnit, outDir));
      const angle = Math.acos(Math.max(-1, Math.min(1, dotFT)));
      rotated = template.map((p) => rotateVec(p, axis, angle));
    }
  }

  // 並進：rotated[anchorIdx] → placedPos + outDir · bondLen
  const targetAnchor = vAdd(placedPos, vScale(outDir, bondLen));
  const offset = vSub(targetAnchor, rotated[anchorRingAtomIdx]);
  for (let i = 0; i < ring.length; i++) {
    mol.atoms[ring[i]].position = vAdd(rotated[i], offset);
  }
}

/** Rodrigues 回転（軸 axis、角 angle [rad]） */
function rotateVec(p, axis, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const term1 = vScale(p, c);
  const term2 = vScale(vCross(axis, p), s);
  const term3 = vScale(axis, vDot(axis, p) * (1 - c));
  return vAdd(vAdd(term1, term2), term3);
}

/**
 * 各重原子の暗黙水素（atom.implicitHCount で指定されている分）を
 * Build-up 法で配置する。新規に H 原子を mol.atoms / mol.bonds に追加する。
 *
 * @param {Object} mol 分子グラフ
 */
export function addImplicitHydrogens(mol) {
  const heavies = mol.atoms.filter((a) => a.element !== "H");
  for (const center of heavies) {
    const hCount = center.implicitHCount ?? 0;
    // totalSigma は中心原子が最終的に持つσ結合数（不変）。
    // ループ中で center.bonds.length が増えるため、ループ外で確定させる必要がある。
    // これで O の 104.5°、N の 107° などの実測角ルックアップが正しく機能する。
    const totalSigma = center.bonds.length + hCount;
    for (let i = 0; i < hCount; i++) {
      const placedNeighbors = center.bonds
        .map((b) => mol.atoms[b.otherId])
        .filter((a) => a.position !== undefined);
      const existingDirs = placedNeighbors.map((a) => vSub(a.position, center.position));

      // 第 1 水素は、親（中心の既配置の隣接原子）が持つさらに別の既配置原子を
      // grandparent アンカーとして使い、anti 二面角で配置する。
      // → これによりエタン等が交互配座 (staggered) になる。
      let dihedralAnchorRel = null;
      if (existingDirs.length === 1) {
        const parent = placedNeighbors[0];
        const anchor = findPlacedNeighbor(mol, parent, center.id);
        if (anchor) dihedralAnchorRel = vSub(anchor, center.position);
      }

      const dir = computeNextDirection(center.hybridization, existingDirs, {
        atomContext: {
          element: center.element,
          sigmaCount: totalSigma,
          lonePairCount: center.lonePairs ?? 0,
        },
        dihedralAnchorRel,
      });
      const length = lookupBondLength(
        center.element, "H",
        center.hybridization, "_",
        1,
      );
      const newId = mol.atoms.length;
      const hAtom = {
        id: newId,
        element: "H",
        hybridization: "none",
        lonePairs: 0,
        bonds: [{ otherId: center.id, order: 1 }],
        position: vAdd(center.position, vScale(dir, length)),
        implicitHCount: 0,
      };
      mol.atoms.push(hAtom);
      center.bonds.push({ otherId: newId, order: 1 });
      mol.bonds.push({ a: center.id, b: newId, order: 1 });
    }
  }
}
