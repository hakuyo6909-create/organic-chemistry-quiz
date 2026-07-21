/**
 * Three.js ベース 3D 分子レンダラ（Phase 1：原子球＋単結合シリンダー）
 *
 * 表示モデルは「球棒モデル (ball-and-stick)」。
 *   - 原子: SphereGeometry, 半径 = 共有結合半径 × scale
 *   - 結合: CylinderGeometry, 1 本の単結合のみ。多重結合は Phase 2 で対応。
 *
 * Three.js は CDN（unpkg）から ESM として import される前提（呼び出し側で
 * import "https://unpkg.com/three@0.160.0/build/three.module.js" を解決）。
 */

import { cpkColor, covalentRadius } from "../constants/cpk-colors.js";

const ATOM_RADIUS_SCALE = 0.28;
const BOND_RADIUS = 0.08;
const SPHERE_SEGMENTS = 24;
const CYLINDER_SEGMENTS = 16;
const DOUBLE_BOND_OFFSET = 0.16;   // 二重結合の各シリンダーの中心軸間距離（の半分）
const TRIPLE_BOND_OFFSET = 0.20;   // 三重結合の両端シリンダー位置

/**
 * Three.js 名前空間を保持するレンダラインスタンスを生成する。
 *
 * @param {Object} THREE Three.js モジュール（import * as THREE from ...）
 * @param {Object} OrbitControlsModule { OrbitControls } を含むモジュール
 * @returns {{
 *   init: (container: HTMLElement) => void,
 *   render: (mol3d: Object) => void,
 *   dispose: () => void,
 *   getScene: () => any
 * }}
 */
export function createMoleculeRenderer(THREE, OrbitControlsModule) {
  const state = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    container: null,
    moleculeGroup: null,
    animId: null,
  };

  function init(container) {
    state.container = container;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0xf6f7fb);

    state.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    state.camera.position.set(0, 0, 12);

    state.renderer = new THREE.WebGLRenderer({ antialias: true });
    state.renderer.setPixelRatio(window.devicePixelRatio || 1);
    state.renderer.setSize(width, height);
    container.appendChild(state.renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    state.scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(5, 5, 8);
    state.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-4, -2, -4);
    state.scene.add(fill);

    const Ctrl = OrbitControlsModule.OrbitControls;
    state.controls = new Ctrl(state.camera, state.renderer.domElement);
    state.controls.enableDamping = true;
    state.controls.dampingFactor = 0.08;

    const loop = () => {
      state.animId = requestAnimationFrame(loop);
      state.controls.update();
      state.renderer.render(state.scene, state.camera);
    };
    loop();

    window.addEventListener("resize", onResize);
  }

  function onResize() {
    if (!state.container || !state.renderer || !state.camera) return;
    const w = state.container.clientWidth || 600;
    const h = state.container.clientHeight || 600;
    state.camera.aspect = w / h;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(w, h);
  }

  /**
   * 分子の 3D オブジェクトをシーンに描画する。
   * 既存の moleculeGroup があれば破棄して置き換える。
   *
   * @param {Object} mol3d  { atoms: [{ element, position }], bonds: [{a,b,order}] }
   */
  function render(mol3d) {
    if (state.moleculeGroup) {
      disposeGroup(state.moleculeGroup);
      state.scene.remove(state.moleculeGroup);
    }
    const group = new THREE.Group();

    // 重心を原点に持っていく（カメラ設定が簡単になる）
    const center = computeCenter(mol3d.atoms);

    for (const atom of mol3d.atoms) {
      const r = covalentRadius(atom.element) * ATOM_RADIUS_SCALE;
      const geo = new THREE.SphereGeometry(r, SPHERE_SEGMENTS, SPHERE_SEGMENTS);
      const mat = new THREE.MeshStandardMaterial({
        color: cpkColor(atom.element),
        roughness: 0.35,
        metalness: 0.05,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        atom.position.x - center.x,
        atom.position.y - center.y,
        atom.position.z - center.z,
      );
      mesh.userData = { kind: "atom", atomId: atom.id, element: atom.element };
      group.add(mesh);
    }

    for (const bond of mol3d.bonds) {
      const a = mol3d.atoms[bond.a];
      const b = mol3d.atoms[bond.b];
      const pa = new THREE.Vector3(
        a.position.x - center.x,
        a.position.y - center.y,
        a.position.z - center.z,
      );
      const pb = new THREE.Vector3(
        b.position.x - center.x,
        b.position.y - center.y,
        b.position.z - center.z,
      );
      const offset = bondOffsetDirection(THREE, mol3d, bond, center);
      group.add(makeBondGroup(
        THREE, pa, pb,
        cpkColor(a.element), cpkColor(b.element),
        bond.order ?? 1, offset,
      ));
    }

    state.moleculeGroup = group;
    state.scene.add(group);
    fitCameraToObject(state.camera, state.controls, group);
  }

  function dispose() {
    if (state.animId != null) cancelAnimationFrame(state.animId);
    window.removeEventListener("resize", onResize);
    if (state.moleculeGroup) disposeGroup(state.moleculeGroup);
    if (state.renderer) {
      state.renderer.dispose();
      if (state.renderer.domElement.parentNode) {
        state.renderer.domElement.parentNode.removeChild(state.renderer.domElement);
      }
    }
    state.scene = null;
    state.camera = null;
    state.renderer = null;
    state.controls = null;
    state.moleculeGroup = null;
    state.container = null;
  }

  return { init, render, dispose, getScene: () => state.scene };
}

/* ─────────── 内部ヘルパ ─────────── */

function computeCenter(atoms) {
  let cx = 0, cy = 0, cz = 0;
  for (const a of atoms) {
    cx += a.position.x;
    cy += a.position.y;
    cz += a.position.z;
  }
  const n = Math.max(1, atoms.length);
  return { x: cx / n, y: cy / n, z: cz / n };
}

/**
 * 結合次数（1/2/3）に応じてシリンダーを描く。
 *
 *   order=1: 中央 1 本（半分ずつ色分け）
 *   order=2: offset 方向に ±DOUBLE_BOND_OFFSET ずらした 2 本
 *   order=3: 中央 1 本 + offset 方向に ±TRIPLE_BOND_OFFSET ずらした 2 本
 *
 * @param {Object} THREE
 * @param {Vector3} pa  原子 A の位置（中心化後）
 * @param {Vector3} pb  原子 B の位置（中心化後）
 * @param {number} colorA  原子 A の CPK 色
 * @param {number} colorB
 * @param {number} order  結合次数
 * @param {Vector3} offsetDir  bond 軸に垂直な単位ベクトル（多重結合の分離方向）
 * @returns {Group}
 */
function makeBondGroup(THREE, pa, pb, colorA, colorB, order, offsetDir) {
  const group = new THREE.Group();
  group.userData = { kind: "bond", order };
  if (order === 1) {
    group.add(makeSplitCylinder(THREE, pa, pb, colorA, colorB));
    return group;
  }
  if (order === 2) {
    const off = offsetDir.clone().multiplyScalar(DOUBLE_BOND_OFFSET);
    group.add(makeSplitCylinder(THREE, pa.clone().add(off), pb.clone().add(off), colorA, colorB));
    group.add(makeSplitCylinder(THREE, pa.clone().sub(off), pb.clone().sub(off), colorA, colorB));
    return group;
  }
  if (order === 3) {
    const off = offsetDir.clone().multiplyScalar(TRIPLE_BOND_OFFSET);
    group.add(makeSplitCylinder(THREE, pa, pb, colorA, colorB));
    group.add(makeSplitCylinder(THREE, pa.clone().add(off), pb.clone().add(off), colorA, colorB));
    group.add(makeSplitCylinder(THREE, pa.clone().sub(off), pb.clone().sub(off), colorA, colorB));
    return group;
  }
  // 1.5（芳香）等の非整数オーダは Phase 4 で対応。現状は単結合扱い。
  group.add(makeSplitCylinder(THREE, pa, pb, colorA, colorB));
  return group;
}

/** 2 原子間に色分けされたシリンダーを 1 本作る（中点で 2 半円柱） */
function makeSplitCylinder(THREE, pa, pb, colorA, colorB) {
  const group = new THREE.Group();
  const mid = pa.clone().add(pb).multiplyScalar(0.5);
  group.add(makeHalfCylinder(THREE, pa, mid, colorA));
  group.add(makeHalfCylinder(THREE, mid, pb, colorB));
  return group;
}

/**
 * 多重結合の「ずらす方向」を求める。bond の両端のいずれかが別の隣接原子を持つなら、
 * その隣接原子方向を bond 軸に直交平面へ射影したベクトルを使う。
 * これにより、たとえばエチレンでは C-H 結合の方向に揃った 2 本の C=C が現れる。
 *
 * @param {Object} THREE
 * @param {Object} mol3d
 * @param {{a:number,b:number,order:number}} bond
 * @param {{x,y,z}} center  全体中心（座標オフセット）
 * @returns {Vector3}
 */
function bondOffsetDirection(THREE, mol3d, bond, center) {
  const a = mol3d.atoms[bond.a];
  const b = mol3d.atoms[bond.b];
  const axis = new THREE.Vector3(
    b.position.x - a.position.x,
    b.position.y - a.position.y,
    b.position.z - a.position.z,
  ).normalize();

  function tryAtom(atom, anchor) {
    for (const nb of atom.bonds) {
      if (nb.otherId === bond.a || nb.otherId === bond.b) continue;
      const other = mol3d.atoms[nb.otherId];
      if (!other.position) continue;
      const dir = new THREE.Vector3(
        other.position.x - anchor.position.x,
        other.position.y - anchor.position.y,
        other.position.z - anchor.position.z,
      );
      // axis 方向成分を除いた垂直成分
      dir.addScaledVector(axis, -dir.dot(axis));
      if (dir.lengthSq() > 1e-6) return dir.normalize();
    }
    return null;
  }
  const ofA = tryAtom(a, a);
  if (ofA) return ofA;
  const ofB = tryAtom(b, b);
  if (ofB) return ofB;

  // フォールバック：全体的な up 軸との外積
  const ref = Math.abs(axis.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  return new THREE.Vector3().crossVectors(axis, ref).normalize();
}

function makeHalfCylinder(THREE, from, to, color) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const length = dir.length();
  const geo = new THREE.CylinderGeometry(BOND_RADIUS, BOND_RADIUS, length, CYLINDER_SEGMENTS);
  const mat = new THREE.MeshStandardMaterial({
    color, roughness: 0.5, metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geo, mat);
  const mid = from.clone().add(to).multiplyScalar(0.5);
  mesh.position.copy(mid);
  // 円柱は y 軸沿いなので、y 軸 → dir に回転
  const up = new THREE.Vector3(0, 1, 0);
  mesh.quaternion.setFromUnitVectors(up, dir.clone().normalize());
  return mesh;
}

function disposeGroup(group) {
  group.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
  });
}

function fitCameraToObject(camera, controls, object) {
  const box = new (object.constructor.prototype === undefined
    ? null
    : Object.getPrototypeOf(object).constructor).Box3
    ?? null;
  // Use THREE.Box3 via the actual Three module accessible from object
  // Fallback to manual bounding by traversing
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  object.traverse((o) => {
    if (o.isMesh && o.geometry) {
      o.geometry.computeBoundingBox();
      const bb = o.geometry.boundingBox;
      const p = o.position;
      minX = Math.min(minX, bb.min.x + p.x);
      minY = Math.min(minY, bb.min.y + p.y);
      minZ = Math.min(minZ, bb.min.z + p.z);
      maxX = Math.max(maxX, bb.max.x + p.x);
      maxY = Math.max(maxY, bb.max.y + p.y);
      maxZ = Math.max(maxZ, bb.max.z + p.z);
    }
  });
  const sx = maxX - minX, sy = maxY - minY, sz = maxZ - minZ;
  const size = Math.max(sx, sy, sz, 2);
  const distance = size / (2 * Math.tan(Math.PI / 8)) * 1.4;
  camera.position.set(0, 0, distance);
  camera.lookAt(0, 0, 0);
  if (controls) {
    controls.target.set(0, 0, 0);
    controls.update();
  }
}
