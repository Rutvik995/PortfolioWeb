'use client';

/**
 * DeveloperAvatar — Rutvik's GLB-based avatar + procedural hair & hoodie
 * ---------------------------------------------------------------------------
 * Loads /models/model.glb (Avaturn skinned avatar) and applies:
 *  1. Wavy medium-long dark hair attached to the Head bone
 *  2. Dark-brown hoodie material override on the suit/shirt mesh
 *  3. Bone-driven hoodie details: collar cowl, drawstrings, kangaroo pocket, cuffs, watch
 *  4. 60 FPS seated typing pose with breathing & head-glance animation (useFrame)
 *  5. All shadow flags on new meshes
 */

import { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

/* ─── Props ─────────────────────────────────────────────────────────────────── */
export interface DeveloperAvatarProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  standalone?: boolean;
}

/* ─── Shared constants ───────────────────────────────────────────────────────── */
const TAU   = Math.PI * 2;
const V3    = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const SHAD  = { castShadow: true, receiveShadow: true } as const;

// Colour palette
const HAIR_COL      = '#181210'; // near-black dark brown
const HOODIE_COL    = '#4a3022'; // rich matte brown
const HOODIE_DARK   = '#3a2318'; // shadow brown for collar / cuffs
const WATCH_COL     = '#111318';
const TROUSER_COL   = '#1e293b';

/* ─── Geometry helpers ──────────────────────────────────────────────────────── */

/** Build a TubeGeometry with a spatially varying radius. */
function taperedTube(
  curve: THREE.CatmullRomCurve3,
  segs: number,
  radSegs: number,
  radiusFn: (u: number) => number,
): THREE.TubeGeometry {
  const geom = new THREE.TubeGeometry(curve, segs, 0.01, radSegs, false);
  const pos  = geom.attributes.position as THREE.BufferAttribute;
  const frames = curve.computeFrenetFrames(segs, false);
  const p = new THREE.Vector3();

  for (let i = 0; i <= segs; i++) {
    const u  = i / segs;
    const r  = radiusFn(u);
    const o  = curve.getPointAt(u);
    const N  = frames.normals[i];
    const B  = frames.binormals[i];
    for (let j = 0; j <= radSegs; j++) {
      const idx = i * (radSegs + 1) + j;
      const a   = (j / radSegs) * TAU;
      p.copy(o)
       .addScaledVector(N,  -Math.cos(a) * r)
       .addScaledVector(B,   Math.sin(a) * r);
      pos.setXYZ(idx, p.x, p.y, p.z);
    }
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

function roundEnds(u: number, blend = 0.08) {
  return Math.sin(Math.min(1, u / blend) * Math.PI * 0.5) *
         Math.sin(Math.min(1, (1 - u) / blend) * Math.PI * 0.5);
}

function hairLock(pts: [number,number,number][], r: number): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x,y,z]) => V3(x,y,z)), false, 'centripetal');
  return taperedTube(curve, 28, 8, u => r * (1 - 0.5*u) * roundEnds(u, 0.06));
}

/* ─── Hair geometry (built once, reused) ────────────────────────────────────── */

/** All lock splines are in Head-local space.
 *  Head is roughly centred at world origin when the avatar is in rest pose.
 *  Y+ = up, Z+ = forward (face direction), X- = right side (camera-facing profile).
 */
const HAIR_LOCKS: [number,number,number][][] = [
  // ── 1. Front quiff – arches up from forehead and sweeps back
  [[  0.00,  0.11,  0.11], [  0.00,  0.19,  0.09], [ -0.01,  0.21, -0.00], [ -0.01,  0.18, -0.09]],
  [[ -0.04,  0.09,  0.11], [ -0.05,  0.17,  0.08], [ -0.06,  0.20,  0.00], [ -0.07,  0.17, -0.09]],
  [[  0.04,  0.09,  0.11], [  0.05,  0.17,  0.08], [  0.05,  0.20,  0.00], [  0.06,  0.17, -0.09]],
  [[ -0.07,  0.08,  0.10], [ -0.09,  0.15,  0.07], [ -0.11,  0.19, -0.01], [ -0.11,  0.16, -0.09]],
  [[  0.07,  0.08,  0.10], [  0.09,  0.15,  0.07], [  0.11,  0.19, -0.01], [  0.11,  0.16, -0.09]],
  // ── 2. Crown volume
  [[ -0.02,  0.19,  0.02], [ -0.02,  0.19, -0.07], [ -0.03,  0.15, -0.13]],
  [[  0.04,  0.18,  0.02], [  0.04,  0.18, -0.07], [  0.05,  0.14, -0.13]],
  [[  0.00,  0.20, -0.03], [  0.00,  0.19, -0.09], [  0.00,  0.14, -0.14]],
  [[ -0.07,  0.17,  0.00], [ -0.07,  0.16, -0.08], [ -0.08,  0.12, -0.13]],
  // ── 3. Right side waves (camera-profile side, −X)
  [[ -0.09,  0.10,  0.09], [ -0.13,  0.07,  0.03], [ -0.15,  0.03, -0.05], [ -0.13, -0.02, -0.11]],
  [[ -0.11,  0.05,  0.08], [ -0.14,  0.01,  0.02], [ -0.15, -0.03, -0.05], [ -0.13, -0.07, -0.11]],
  [[ -0.10,  0.00,  0.07], [ -0.14, -0.04,  0.01], [ -0.14, -0.08, -0.05], [ -0.12, -0.12, -0.10]],
  [[ -0.10,  0.14,  0.05], [ -0.14,  0.10, -0.02], [ -0.15,  0.05, -0.09]],
  // ── 4. Left side waves (+X)
  [[  0.09,  0.10,  0.09], [  0.13,  0.07,  0.03], [  0.15,  0.03, -0.05], [  0.13, -0.02, -0.11]],
  [[  0.11,  0.05,  0.08], [  0.14,  0.01,  0.02], [  0.15, -0.03, -0.05], [  0.13, -0.07, -0.11]],
  [[  0.10,  0.00,  0.07], [  0.14, -0.04,  0.01], [  0.14, -0.08, -0.05], [  0.12, -0.12, -0.10]],
  // ── 5. Back / nape cascading mane
  [[ -0.04,  0.10, -0.11], [ -0.04, -0.00, -0.14], [ -0.05, -0.09, -0.14], [ -0.04, -0.16, -0.12]],
  [[  0.00,  0.10, -0.12], [  0.00, -0.01, -0.15], [  0.00, -0.10, -0.15], [  0.00, -0.17, -0.13]],
  [[  0.04,  0.10, -0.11], [  0.04, -0.00, -0.14], [  0.05, -0.09, -0.14], [  0.04, -0.16, -0.12]],
  [[ -0.09,  0.06, -0.10], [ -0.09, -0.03, -0.13], [ -0.10, -0.11, -0.13], [ -0.08, -0.16, -0.11]],
  [[  0.09,  0.06, -0.10], [  0.09, -0.03, -0.13], [  0.10, -0.11, -0.13], [  0.08, -0.16, -0.11]],
  [[  0.00, -0.07, -0.14], [  0.00, -0.14, -0.14], [  0.00, -0.18, -0.12]],
  // ── 6. Soft side-swept fringe falling across upper forehead
  [[ -0.03,  0.07,  0.14], [ -0.06,  0.07,  0.15], [ -0.09,  0.06,  0.14], [ -0.11,  0.03,  0.12]],
  [[ -0.02,  0.05,  0.14], [ -0.05,  0.06,  0.15], [ -0.08,  0.05,  0.14], [ -0.10,  0.02,  0.12]],
];

function buildHairGroup(): THREE.Group {
  const mat = new THREE.MeshStandardMaterial({
    color: HAIR_COL, roughness: 0.80, metalness: 0.02, side: THREE.FrontSide,
  });
  const group = new THREE.Group();

  // Dark underlay cap so no skin shows through
  const cap = new THREE.SphereGeometry(0.108, 32, 24, 0, TAU, 0, Math.PI * 0.72);
  const capMesh = new THREE.Mesh(cap, mat);
  capMesh.castShadow = true;
  group.add(capMesh);

  // Back coverage cap
  const backCap = new THREE.SphereGeometry(0.11, 32, 24, Math.PI * 0.42, Math.PI * 1.18, 0, Math.PI * 0.78);
  const backMesh = new THREE.Mesh(backCap, mat);
  backMesh.castShadow = true;
  group.add(backMesh);

  // Individual locks
  for (const pts of HAIR_LOCKS) {
    const geo  = hairLock(pts, 0.030);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow    = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  return group;
}

/* ─── Hoodie detail geometries (Spine2 / neck bone space) ───────────────────── */

/** High crew-neck cowl covering the suit collar – built from a LatheGeometry ring. */
function buildCowlGroup(): THREE.Group {
  const mat = new THREE.MeshStandardMaterial({ color: HOODIE_DARK, roughness: 0.92, metalness: 0.0 });
  const g   = new THREE.Group();

  // Main thick turtleneck cylinder (open top+bottom)
  const pts = [
    new THREE.Vector2(0.095, 0.00),
    new THREE.Vector2(0.100, 0.03),
    new THREE.Vector2(0.105, 0.07),
    new THREE.Vector2(0.108, 0.10),
    new THREE.Vector2(0.108, 0.13),
    new THREE.Vector2(0.100, 0.145),
    new THREE.Vector2(0.090, 0.148),
  ];
  const lathe = new THREE.LatheGeometry(pts, 28);
  const cowl  = new THREE.Mesh(lathe, mat);
  cowl.castShadow    = true;
  cowl.receiveShadow = true;
  g.add(cowl);

  // Ribbed collar trim ring
  const rim = new THREE.TorusGeometry(0.098, 0.014, 10, 36);
  const rimMesh = new THREE.Mesh(rim, mat);
  rimMesh.position.set(0, 0.14, 0);
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.castShadow = true;
  g.add(rimMesh);

  return g;
}

/** Kangaroo pocket on the lower front of the torso. */
function buildPocketGroup(): THREE.Group {
  const mat = new THREE.MeshStandardMaterial({ color: HOODIE_COL, roughness: 0.95, metalness: 0.0 });
  const g   = new THREE.Group();

  // Pocket pouch (squashed sphere)
  const pouch = new THREE.SphereGeometry(0.11, 24, 16, 0, TAU, 0, Math.PI * 0.55);
  const mesh  = new THREE.Mesh(pouch, mat);
  mesh.scale.set(1.6, 0.9, 0.5);
  mesh.position.set(0, 0, 0.01);
  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  g.add(mesh);

  return g;
}

/** Drawstring cord (one side, mirrored externally). */
function buildDrawstring(side: 1 | -1): THREE.Mesh {
  const mat = new THREE.MeshStandardMaterial({ color: HOODIE_DARK, roughness: 0.9, metalness: 0.0 });
  const curve = new THREE.CatmullRomCurve3([
    V3(side * 0.030,  0.14,  0.095),
    V3(side * 0.034,  0.08,  0.100),
    V3(side * 0.036, -0.00,  0.096),
    V3(side * 0.038, -0.09,  0.090),
    V3(side * 0.040, -0.17,  0.082),
  ]);
  const geo  = new THREE.TubeGeometry(curve, 20, 0.0048, 7, false);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

/** Aglet tip for drawstring end. */
function buildAglet(side: 1 | -1): THREE.Mesh {
  const mat = new THREE.MeshStandardMaterial({ color: '#888', roughness: 0.4, metalness: 0.8 });
  const geo  = new THREE.CylinderGeometry(0.006, 0.0045, 0.022, 10);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(side * 0.040, -0.19, 0.082);
  mesh.castShadow = true;
  return mesh;
}

/** Ribbed wrist cuff ring. */
function buildCuff(): THREE.Mesh {
  const mat = new THREE.MeshStandardMaterial({ color: HOODIE_DARK, roughness: 0.9, metalness: 0.0 });
  const geo  = new THREE.TorusGeometry(0.038, 0.013, 10, 36);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Black wristwatch (left wrist). */
function buildWatch(): THREE.Group {
  const matCase  = new THREE.MeshStandardMaterial({ color: WATCH_COL, roughness: 0.35, metalness: 0.9 });
  const matFace  = new THREE.MeshStandardMaterial({ color: '#020408', roughness: 0.2, metalness: 0.1 });
  const matStrap = new THREE.MeshStandardMaterial({ color: '#0f0f0f', roughness: 0.85, metalness: 0.0 });
  const g = new THREE.Group();

  // Strap band
  const strap = new THREE.TorusGeometry(0.038, 0.009, 8, 36);
  const sm = new THREE.Mesh(strap, matStrap);
  sm.scale.set(1, 1, 1.5);
  sm.rotation.x = Math.PI / 2;
  sm.castShadow = true;
  g.add(sm);

  // Case
  const watchCase = new THREE.CylinderGeometry(0.026, 0.026, 0.009, 32);
  const cm = new THREE.Mesh(watchCase, matCase);
  cm.position.set(0, 0.038, 0);
  cm.rotation.x = Math.PI / 2;
  cm.castShadow = true;
  g.add(cm);

  // Dial
  const dial = new THREE.CylinderGeometry(0.021, 0.021, 0.001, 32);
  const dm = new THREE.Mesh(dial, matFace);
  dm.position.set(0, 0.038, 0.005);
  dm.rotation.x = Math.PI / 2;
  g.add(dm);

  return g;
}

/* ─── Bone-pose helper (seated typing pose) ─────────────────────────────────── */

type BoneMap = Record<string, THREE.Bone>;

function collectBones(root: THREE.Object3D): BoneMap {
  const map: BoneMap = {};
  root.traverse(o => {
    if ((o as THREE.Bone).isBone) map[o.name] = o as THREE.Bone;
  });
  return map;
}

/** Apply a seated, slightly forward-leaning typing pose to the skeleton. */
function applySeatedPose(bones: BoneMap): void {
  // ── Hips: low and tilted slightly forward
  if (bones.Hips) {
    bones.Hips.position.set(0, 0, 0);
    bones.Hips.rotation.set(-0.12, 0, 0);
  }
  // ── Spine chain: forward lean
  ['Spine', 'Spine1', 'Spine2'].forEach((n, i) => {
    if (bones[n]) bones[n].rotation.set(0.06 + i * 0.03, 0, 0);
  });
  // ── Head: slightly down toward monitors
  if (bones.Head) bones.Head.rotation.set(0.10, 0.08, 0);
  // ── Shoulders
  if (bones.LeftShoulder)  bones.LeftShoulder.rotation.set(0, 0,  0.1);
  if (bones.RightShoulder) bones.RightShoulder.rotation.set(0, 0, -0.1);
  // ── Upper arms: in toward keyboard
  if (bones.LeftArm)  bones.LeftArm.rotation.set(0.9, -0.3, -0.5);
  if (bones.RightArm) bones.RightArm.rotation.set(0.9,  0.3,  0.5);
  // ── Forearms: level to keyboard
  if (bones.LeftForeArm)  bones.LeftForeArm.rotation.set(-0.3, -0.1, 0);
  if (bones.RightForeArm) bones.RightForeArm.rotation.set(-0.3,  0.1, 0);
  // ── Hands: flat over keys
  if (bones.LeftHand)  bones.LeftHand.rotation.set( 0.1, 0,  0.1);
  if (bones.RightHand) bones.RightHand.rotation.set(0.1, 0, -0.1);
  // ── Legs: knees bent ~85°
  ['LeftUpLeg', 'RightUpLeg'].forEach(n => {
    if (bones[n]) bones[n].rotation.set(1.35, 0, 0);
  });
  if (bones.LeftLeg)  bones.LeftLeg.rotation.set(-1.20, 0, 0);
  if (bones.RightLeg) bones.RightLeg.rotation.set(-1.20, 0, 0);
  if (bones.LeftFoot)  bones.LeftFoot.rotation.set( 0.4, 0, 0);
  if (bones.RightFoot) bones.RightFoot.rotation.set(0.4, 0, 0);
}

/* ─── Material overrides ─────────────────────────────────────────────────────── */

const LOOK_MAT_NAMES = new Set(['avaturn_look_0_material']);
// hair and glasses materials are intentionally left untouched

function overrideMaterials(scene: THREE.Group): void {
  const hoodieMat = new THREE.MeshStandardMaterial({
    color: HOODIE_COL, roughness: 0.92, metalness: 0.0,
  });
  const trouserMat = new THREE.MeshStandardMaterial({
    color: TROUSER_COL, roughness: 0.80, metalness: 0.0,
  });

  scene.traverse(o => {
    if (!(o instanceof THREE.SkinnedMesh) && !(o instanceof THREE.Mesh)) return;
    const mesh = o as THREE.Mesh;
    mesh.castShadow    = true;
    mesh.receiveShadow = true;

    const applyMat = (m: THREE.Material) => {
      const name = m.name;
      if (LOOK_MAT_NAMES.has(name)) return hoodieMat;
      // Keep skin, glasses, hair, shoes as-is
      return m;
    };

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map(applyMat);
    } else {
      mesh.material = applyMat(mesh.material);
    }

    // Remap trouser area of the body mesh using morph or just the whole
    // body mesh lower half: since we can't split the body, leave body skin as-is.
    // The look_0 mesh covers suit jacket + shirt + trousers — we split intent:
    // Upper: hoodie.  Lower: trousers.  Since they're one mesh we do a name check.
    if (mesh.name === 'avaturn_look_0') {
      // The look mesh covers both upper and lower body.
      // Set upper to hoodie colour (done above). To approximate trouser distinction
      // we could use vertexColors but for simplicity use the same neutral dark material
      // and rely on the bone-attached collar/pocket to sell the hoodie.
      mesh.material = hoodieMat;
      void trouserMat; // kept for future vertex-colour split
    }
  });
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

type GLTFResult = GLTF & { scene: THREE.Group };

export function DeveloperAvatar({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: DeveloperAvatarProps) {
  // Load the Avaturn GLB
  const { scene: avatarScene } = useGLTF('/models/model.glb') as GLTFResult;

  // Refs
  const groupRef      = useRef<THREE.Group>(null);
  const bonesRef      = useRef<BoneMap>({});
  const hairGroupRef  = useRef<THREE.Group | null>(null);
  const poseApplied   = useRef(false);

  // Build all additive meshes once
  const hairGroup    = useMemo(() => buildHairGroup(), []);
  const cowlGroup    = useMemo(() => buildCowlGroup(), []);
  const pocketGroup  = useMemo(() => buildPocketGroup(), []);
  const leftCuff     = useMemo(() => buildCuff(), []);
  const rightCuff    = useMemo(() => buildCuff(), []);
  const leftWatch    = useMemo(() => buildWatch(), []);
  const lDraw        = useMemo(() => buildDrawstring(-1), []);
  const rDraw        = useMemo(() => buildDrawstring(1), []);
  const lAglet       = useMemo(() => buildAglet(-1), []);
  const rAglet       = useMemo(() => buildAglet(1), []);

  // Clone the scene so the same GLB can be used by multiple instances
  const clonedScene = useMemo(() => {
    const clone = avatarScene.clone(true);
    return clone;
  }, [avatarScene]);

  useEffect(() => {
    if (poseApplied.current) return;
    poseApplied.current = true;

    // 1. Material overrides
    overrideMaterials(clonedScene);

    // 2. Collect bones
    const bones = collectBones(clonedScene);
    bonesRef.current = bones;

    // 3. Apply seated typing pose
    applySeatedPose(bones);

    // 4. Attach hair to Head bone
    const headBone = bones['Head'];
    if (headBone) {
      // Hair sits slightly up and back relative to the head bone
      hairGroup.position.set(0, 0.02, 0);
      headBone.add(hairGroup);
      hairGroupRef.current = hairGroup;
    }

    // 5. Attach cowl to Spine2 / Neck
    const neckBone = bones['Neck'] ?? bones['Spine2'];
    if (neckBone) {
      cowlGroup.position.set(0, 0, 0);
      neckBone.add(cowlGroup);
    }

    // 6. Attach pocket + drawstrings to Spine
    const spineBone = bones['Spine'] ?? bones['Spine1'];
    if (spineBone) {
      pocketGroup.position.set(0, -0.14, 0.01);
      spineBone.add(pocketGroup);
      spineBone.add(lDraw);
      spineBone.add(rDraw);
      spineBone.add(lAglet);
      spineBone.add(rAglet);
    }

    // 7. Attach cuffs + watch to forearm bones
    const lfBone = bones['LeftForeArm'];
    if (lfBone) {
      leftCuff.position.set(0, -0.22, 0); // near wrist end
      lfBone.add(leftCuff);
      leftWatch.position.set(0.01, -0.21, 0);
      lfBone.add(leftWatch);
    }
    const rfBone = bones['RightForeArm'];
    if (rfBone) {
      rightCuff.position.set(0, -0.22, 0);
      rfBone.add(rightCuff);
    }
  }, [clonedScene, hairGroup, cowlGroup, pocketGroup, leftCuff, rightCuff, leftWatch, lDraw, rDraw, lAglet, rAglet]);

  // 60 FPS animation: breathing + head glance + typing
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const bones = bonesRef.current;

    // Breathing: subtle spine sway
    if (bones.Spine1) {
      bones.Spine1.rotation.x = 0.09 + 0.012 * Math.sin(t * 1.6);
    }

    // Head glance between monitors
    if (bones.Head) {
      bones.Head.rotation.x =  0.10 + 0.008 * Math.cos(t * 1.4);
      bones.Head.rotation.y =  0.08 + 0.06  * Math.sin(t * 0.7);
    }

    // Typing: alternating hand/forearm micro-movement
    if (bones.LeftForeArm) {
      bones.LeftForeArm.rotation.x  = -0.30 + 0.025 * Math.sin(t * 9.3);
    }
    if (bones.RightForeArm) {
      bones.RightForeArm.rotation.x = -0.30 + 0.025 * Math.sin(t * 9.3 + Math.PI);
    }
    if (bones.LeftHand) {
      bones.LeftHand.rotation.x  =  0.10 + 0.018 * Math.sin(t * 11.1);
    }
    if (bones.RightHand) {
      bones.RightHand.rotation.x  = 0.10 + 0.018 * Math.sin(t * 11.1 + Math.PI * 0.6);
    }

    // Fingers – gentle curl/uncurl on dominant typing keys
    const fingerBones = [
      'LeftHandIndex1','LeftHandMiddle1','LeftHandRing1','LeftHandPinky1',
      'RightHandIndex1','RightHandMiddle1','RightHandRing1','RightHandPinky1',
    ];
    fingerBones.forEach((n, i) => {
      if (bones[n]) {
        const tap = Math.max(0, Math.sin(t * 14 + i * 0.9));
        bones[n].rotation.x = -0.3 - 0.4 * tap;
      }
    });
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} {...SHAD} />
    </group>
  );
}

// Preload for faster first render
useGLTF.preload('/models/model.glb');

export default DeveloperAvatar;
