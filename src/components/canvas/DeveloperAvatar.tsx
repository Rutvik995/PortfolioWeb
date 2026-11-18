'use client';

/**
 * DeveloperAvatar
 * ---------------------------------------------------------------------------
 * A fully procedural, stylized 3D developer seated at a desk and typing.
 *
 *  - No .glb / .gltf assets, no useGLTF.
 *  - No BoxGeometry anywhere. Everything is Lathe / Tube / Capsule / Torus /
 *    Sphere / Extrude (rounded-rect profiles) / Shape / Plane / Circle.
 *  - Hip pivot of the character is at [0, 0, 0], character faces +Z
 *    (toward the keyboard and the monitors). Floor is at y = -0.5 (local).
 *  - The character's LEFT side is +X, the RIGHT side is -X.
 *
 * Usage:
 *   <Canvas shadows camera={{ position: [2.2, 1.1, 2.4], fov: 35 }}>
 *     <DeveloperAvatar position={[0, -0.2, 0]} scale={1.2} />
 *   </Canvas>
 *
 * The component ships its own soft key light, fill and monitor-glow light so it
 * renders well standalone. Remove them if your scene already provides lighting.
 */

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export interface DeveloperAvatarProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  standalone?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Constants & small helpers                                                 */
/* -------------------------------------------------------------------------- */

const TAU = Math.PI * 2;
const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const SHADOWS = { castShadow: true, receiveShadow: true } as const;

/** Head ellipsoid radii (SphereGeometry r=0.15 scaled [0.92, 1.08, 0.98]). */
const HEAD_R = 0.15;
const HEAD_SCALE: [number, number, number] = [0.92, 1.08, 0.98];
const HR = { x: HEAD_R * 0.92, y: HEAD_R * 1.08, z: HEAD_R * 0.98 };

/** Point on the head ellipsoid, same parametrisation as THREE.SphereGeometry. */
function headPoint(theta: number, phi: number, off = 0): THREE.Vector3 {
  const st = Math.sin(theta);
  return V3(
    -(HR.x + off) * Math.cos(phi) * st,
    (HR.y + off) * Math.cos(theta),
    (HR.z + off) * Math.sin(phi) * st,
  );
}

/** Z of the front of the face at (x, y), head-local. */
function faceZ(x: number, y: number): number {
  const k = 1 - (x / HR.x) ** 2 - (y / HR.y) ** 2;
  return HR.z * Math.sqrt(Math.max(0, k));
}

/** Point sitting just above the face surface. */
const onFace = (x: number, y: number, off: number) => V3(x, y, faceZ(x, y) + off);

/** Tube with a custom radius profile along its length (organic, tapered, rounded). */
function taperedTube(
  curve: THREE.Curve<THREE.Vector3>,
  tubularSegments: number,
  radialSegments: number,
  radius: (u: number) => number,
): THREE.TubeGeometry {
  const geo = new THREE.TubeGeometry(curve, tubularSegments, 1, radialSegments, false);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const c = new THREE.Vector3();
  const p = new THREE.Vector3();
  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments;
    curve.getPointAt(u, c);
    const r = radius(u);
    for (let j = 0; j <= radialSegments; j++) {
      const idx = i * (radialSegments + 1) + j;
      p.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(r).add(c);
      pos.setXYZ(idx, p.x, p.y, p.z);
    }
  }
  pos.needsUpdate = true;
  return geo;
}

/** Radius multiplier that rounds off both ends of a tube. */
const roundEnds = (u: number, span = 0.07) =>
  Math.min(1, Math.sqrt(Math.max(0, Math.min(u, 1 - u)) / span));

function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Rounded, bevelled panel in the XY plane, thickness d along Z, centred. */
function panel(w: number, h: number, d: number, r: number): THREE.ExtrudeGeometry {
  const b = Math.min(r * 0.4, d * 0.3);
  const depth = Math.max(0.0001, d - 2 * b);
  const g = new THREE.ExtrudeGeometry(roundedRectShape(w - 2 * b, h - 2 * b, Math.max(0.001, r - b)), {
    depth,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 4,
    curveSegments: 12,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** Rounded horizontal slab, width x (along X), depth z (along Z), height h (along Y), centred. */
function slab(w: number, d: number, h: number, r: number): THREE.ExtrudeGeometry {
  const g = panel(w, d, h, r);
  g.rotateX(-Math.PI / 2);
  return g;
}

/** Capsule lying along +Z (baked). */
function capsuleZ(radius: number, length: number): THREE.CapsuleGeometry {
  const g = new THREE.CapsuleGeometry(radius, length, 8, 16);
  g.rotateX(Math.PI / 2);
  return g;
}

/** Rounded-rectangle (superellipse) loop points. */
function superellipse(a: number, b: number, n: number, count: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * TAU;
    const c = Math.cos(t);
    const s = Math.sin(t);
    pts.push(V3(a * Math.sign(c) * Math.abs(c) ** (2 / n), b * Math.sign(s) * Math.abs(s) ** (2 / n), 0));
  }
  return pts;
}

/* -------------------------------------------------------------------------- */
/*  Torso profile (hoodie)                                                    */
/* -------------------------------------------------------------------------- */

const TORSO_SCALE: [number, number, number] = [1.22, 1, 0.86];

const TORSO_PROFILE: THREE.Vector2[] = (() => {
  const raw: [number, number][] = [
    [0.0, -0.035],
    [0.15, -0.035],
    [0.185, -0.02], // soft waist hem
    [0.2, 0.05],
    [0.198, 0.18], // relaxed waist
    [0.222, 0.34],
    [0.236, 0.44], // chest
    [0.222, 0.53], // rounded shoulders
    [0.16, 0.6],
    [0.105, 0.63],
    [0.0, 0.645],
  ];
  const curve = new THREE.CatmullRomCurve3(raw.map(([r, y]) => V3(r, y, 0)), false, 'centripetal');
  return curve.getPoints(72).map((p) => new THREE.Vector2(Math.max(p.x, 0.0001), p.y));
})();

function torsoRadiusAt(y: number): number {
  for (let i = 0; i < TORSO_PROFILE.length - 1; i++) {
    const a = TORSO_PROFILE[i];
    const b = TORSO_PROFILE[i + 1];
    if (y >= a.y && y <= b.y) {
      const k = (y - a.y) / Math.max(1e-6, b.y - a.y);
      return a.x + (b.x - a.x) * k;
    }
  }
  return 0.2;
}

/** z of the hoodie's front surface at (x, y). */
function torsoFrontZ(x: number, y: number): number {
  const r = torsoRadiusAt(y);
  const k = 1 - (x / (r * TORSO_SCALE[0])) ** 2;
  return r * TORSO_SCALE[2] * Math.sqrt(Math.max(0, k));
}

/* -------------------------------------------------------------------------- */
/*  Hair lock definitions (20 wavy locks, wrapped along the skull)            */
/* -------------------------------------------------------------------------- */

interface LockSpec {
  t0: number; // start polar angle (0 = crown)
  p0: number; // start azimuth (pi/2 = straight ahead, 3pi/2 = back)
  t1: number;
  p1: number;
  amp: number; // wave amplitude (azimuth radians)
  waves: number; // number of waves along the lock
  r: number; // base thickness
  lift: number; // how much volume stands off the skull
  ph: number; // wave phase
}

const P = Math.PI;
const LOCKS: LockSpec[] = [
  // --- front fringe, side-swept across the forehead (6)
  { t0: 0.55, p0: 1.05, t1: 1.22, p1: 1.75, amp: 0.09, waves: 1.6, r: 0.026, lift: 0.026, ph: 0.0 },
  { t0: 0.5, p0: 1.3, t1: 1.2, p1: 2.05, amp: 0.1, waves: 1.4, r: 0.028, lift: 0.03, ph: 1.1 },
  { t0: 0.45, p0: 1.55, t1: 1.12, p1: 2.35, amp: 0.11, waves: 1.7, r: 0.028, lift: 0.032, ph: 2.0 },
  { t0: 0.5, p0: 0.8, t1: 1.2, p1: 1.45, amp: 0.08, waves: 1.3, r: 0.024, lift: 0.024, ph: 0.6 },
  { t0: 0.4, p0: 1.2, t1: 1.05, p1: 1.95, amp: 0.12, waves: 1.5, r: 0.03, lift: 0.04, ph: 2.6 },
  { t0: 0.35, p0: 1.7, t1: 1.0, p1: 2.7, amp: 0.1, waves: 1.8, r: 0.03, lift: 0.04, ph: 3.3 },
  // --- top volume (2)
  { t0: 0.25, p0: 2.4, t1: 0.95, p1: 3.3, amp: 0.1, waves: 1.6, r: 0.03, lift: 0.04, ph: 0.4 },
  { t0: 0.3, p0: 0.6, t1: 1.05, p1: -0.1, amp: 0.1, waves: 1.5, r: 0.03, lift: 0.04, ph: 1.7 },
  // --- right side (-X), over the ears (3)
  { t0: 0.95, p0: 0.4, t1: 2.15, p1: 0.15, amp: 0.08, waves: 2.2, r: 0.024, lift: 0.03, ph: 0.2 },
  { t0: 1.05, p0: 0.05, t1: 2.25, p1: -0.15, amp: 0.08, waves: 2.0, r: 0.024, lift: 0.032, ph: 1.3 },
  { t0: 0.85, p0: 0.7, t1: 1.95, p1: 0.5, amp: 0.07, waves: 2.1, r: 0.022, lift: 0.028, ph: 2.4 },
  // --- left side (+X), over the ears (3)
  { t0: 0.95, p0: P - 0.4, t1: 2.15, p1: P - 0.15, amp: 0.08, waves: 2.2, r: 0.024, lift: 0.03, ph: 0.9 },
  { t0: 1.05, p0: P - 0.05, t1: 2.25, p1: P + 0.15, amp: 0.08, waves: 2.0, r: 0.024, lift: 0.032, ph: 2.1 },
  { t0: 0.85, p0: P - 0.7, t1: 1.95, p1: P - 0.5, amp: 0.07, waves: 2.1, r: 0.022, lift: 0.028, ph: 3.0 },
  // --- back layers cascading to the nape (6)
  { t0: 1.0, p0: 4.0, t1: 2.55, p1: 3.85, amp: 0.09, waves: 2.4, r: 0.03, lift: 0.035, ph: 0.5 },
  { t0: 0.95, p0: 4.4, t1: 2.6, p1: 4.35, amp: 0.09, waves: 2.3, r: 0.032, lift: 0.036, ph: 1.6 },
  { t0: 0.95, p0: 4.8, t1: 2.6, p1: 4.85, amp: 0.09, waves: 2.5, r: 0.032, lift: 0.036, ph: 2.7 },
  { t0: 1.0, p0: 5.2, t1: 2.55, p1: 5.45, amp: 0.09, waves: 2.4, r: 0.03, lift: 0.035, ph: 3.6 },
  { t0: 1.35, p0: 3.7, t1: 2.55, p1: 3.5, amp: 0.08, waves: 2.0, r: 0.026, lift: 0.03, ph: 4.4 },
  { t0: 1.35, p0: 5.7, t1: 2.55, p1: 5.95, amp: 0.08, waves: 2.0, r: 0.026, lift: 0.03, ph: 5.0 },
];

function buildLock(s: LockSpec): THREE.TubeGeometry {
  const N = 10;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const wave = Math.sin(u * s.waves * TAU + s.ph);
    const theta = THREE.MathUtils.lerp(s.t0, s.t1, u) + 0.04 * Math.sin(u * s.waves * TAU + s.ph + 1.3);
    const phi = THREE.MathUtils.lerp(s.p0, s.p1, u) + s.amp * wave * Math.min(1, u * 2);
    const off = 0.008 + s.lift * (Math.sin(u * Math.PI) * 0.6 + 0.4 * u);
    pts.push(headPoint(Math.min(theta, 2.62), phi, off));
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  return taperedTube(curve, 56, 10, (u) => s.r * (1 - 0.5 * u) * roundEnds(u, 0.06));
}

/* -------------------------------------------------------------------------- */
/*  Geometry factory (built once)                                             */
/* -------------------------------------------------------------------------- */

function buildGeometries() {
  const side = [-1, 1] as const;

  /* ---- arms: shoulder -> bent elbow -> wrist ---- */
  const armCurves = side.map(
    (s) =>
      new THREE.CatmullRomCurve3(
        [V3(s * 0.3, 0.5, -0.01), V3(s * 0.36, 0.22, 0.06), V3(s * 0.115, 0.15, 0.36)],
        false,
        'catmullrom',
        0.5,
      ),
  );
  const sleeves = armCurves.map((c) =>
    taperedTube(c, 48, 18, (u) => {
      const cap = u < 0.04 ? Math.sqrt(u / 0.04) : 1;
      return (0.076 - 0.024 * Math.pow(u, 0.8) + 0.008 * Math.sin(u * Math.PI)) * cap;
    }),
  );
  const wristTangents = armCurves.map((c) => c.getTangentAt(1).normalize());

  /* ---- legs ---- */
  const thighCurves = side.map(
    (s) => new THREE.CatmullRomCurve3([V3(s * 0.1, -0.01, 0.0), V3(s * 0.105, -0.01, 0.24), V3(s * 0.115, 0.0, 0.46)]),
  );
  const thighs = thighCurves.map((c) => taperedTube(c, 32, 16, (u) => 0.082 - 0.019 * u));
  const calfCurves = side.map(
    (s) => new THREE.CatmullRomCurve3([V3(s * 0.115, 0.0, 0.46), V3(s * 0.115, -0.22, 0.495), V3(s * 0.115, -0.42, 0.5)]),
  );
  const calves = calfCurves.map((c) => taperedTube(c, 32, 16, (u) => 0.062 - 0.015 * u));

  /* ---- face details ---- */
  const brow = (s: number) =>
    taperedTube(
      new THREE.CatmullRomCurve3(
        [0.028, 0.045, 0.062, 0.078, 0.092].map((ax, i) => {
          const x = s * ax;
          const y = 0.047 + 0.011 * Math.sin((i / 4) * Math.PI * 0.9) - 0.003 * (i / 4);
          return onFace(x, y, 0.007);
        }),
      ),
      20,
      8,
      (u) => 0.0075 * (1 - 0.45 * u) * roundEnds(u, 0.12),
    );

  const lid = (s: number) =>
    taperedTube(
      new THREE.CatmullRomCurve3(
        [-0.022, -0.011, 0, 0.011, 0.022].map((dx, i) => {
          const x = s * 0.056 + dx;
          const y = 0.012 + 0.017 * Math.sin((i / 4) * Math.PI) ** 0.7;
          return onFace(x, y, 0.0085);
        }),
      ),
      16,
      6,
      (u) => 0.0034 * roundEnds(u, 0.2),
    );

  const mustache = (s: number) =>
    taperedTube(
      new THREE.CatmullRomCurve3([
        onFace(s * 0.003, -0.044, 0.0085),
        onFace(s * 0.018, -0.042, 0.0095),
        onFace(s * 0.034, -0.047, 0.0095),
        onFace(s * 0.049, -0.058, 0.0085),
      ]),
      20,
      8,
      (u) => 0.0092 * (1 - 0.55 * u) * roundEnds(u, 0.1),
    );

  const lipPts = (yBase: number, curl: number, half: number) =>
    new THREE.CatmullRomCurve3(
      [-1, -0.5, 0, 0.5, 1].map((k) => {
        const x = k * half;
        return onFace(x, yBase + curl * k * k, 0.0065);
      }),
    );

  /* ---- glasses ---- */
  const lensA = 0.047;
  const lensB = 0.037;
  const loop = superellipse(lensA, lensB, 4, 56);
  const frameCurve = new THREE.CatmullRomCurve3(loop, true, 'centripetal');
  const lensShape = new THREE.Shape(loop.map((p) => new THREE.Vector2(p.x, p.y)));

  const bridge = new THREE.CatmullRomCurve3([V3(-0.021, 0.014, 0.16), V3(0, 0.022, 0.167), V3(0.021, 0.014, 0.16)]);
  const temple = (s: number) =>
    new THREE.CatmullRomCurve3([
      V3(s * 0.107, 0.012, 0.118),
      V3(s * 0.136, 0.012, 0.07),
      V3(s * 0.147, 0.012, 0.0),
      V3(s * 0.146, -0.005, -0.06),
      V3(s * 0.14, -0.03, -0.085),
    ]);

  /* ---- drawstrings ---- */
  const string = (s: number) =>
    new THREE.CatmullRomCurve3([
      V3(s * 0.05, 0.6, torsoFrontZ(s * 0.05, 0.6) + 0.01),
      V3(s * 0.055, 0.5, torsoFrontZ(s * 0.055, 0.5) + 0.012),
      V3(s * 0.06, 0.36, torsoFrontZ(s * 0.06, 0.36) + 0.012),
    ]);

  const pocketSeam = (s: number) =>
    new THREE.CatmullRomCurve3([
      V3(s * 0.13, 0.03, 0.178),
      V3(s * 0.112, 0.085, 0.192),
      V3(s * 0.085, 0.145, 0.186),
    ]);

  /* ---- mug ---- */
  const mugProfile = [
    [0, 0],
    [0.034, 0],
    [0.038, 0.006],
    [0.04, 0.05],
    [0.039, 0.078],
    [0.035, 0.078],
    [0.034, 0.012],
    [0, 0.012],
  ].map(([r, y]) => new THREE.Vector2(r, y));

  /* ---- chair seat ---- */
  const seatProfile = [
    [0, -0.155],
    [0.25, -0.155],
    [0.285, -0.14],
    [0.295, -0.12],
    [0.28, -0.098],
    [0.2, -0.094],
    [0, -0.094],
  ].map(([r, y]) => new THREE.Vector2(r, y));

  return {
    // body
    head: new THREE.SphereGeometry(HEAD_R, 64, 48),
    ear: new THREE.SphereGeometry(0.03, 24, 20),
    neck: new THREE.CapsuleGeometry(0.052, 0.08, 8, 20),
    torso: new THREE.LatheGeometry(TORSO_PROFILE, 72),
    pocket: new THREE.CapsuleGeometry(0.045, 0.16, 10, 20),
    hem: new THREE.TorusGeometry(0.188, 0.02, 14, 72),
    collar: new THREE.TorusGeometry(0.115, 0.038, 18, 64),
    hoodPouch: new THREE.SphereGeometry(0.11, 32, 24),
    shoulder: new THREE.SphereGeometry(0.086, 24, 20),
    stringTube: [string(-1), string(1)].map((c) => new THREE.TubeGeometry(c, 24, 0.0055, 8, false)),
    aglet: new THREE.CapsuleGeometry(0.0075, 0.02, 4, 8),
    pocketSeam: [pocketSeam(-1), pocketSeam(1)].map((c) => new THREE.TubeGeometry(c, 16, 0.0032, 6, false)),
    sleeves,
    wristTangents,
    cuffTorus: new THREE.TorusGeometry(0.04, 0.0125, 14, 40),
    // hands
    palm: capsuleZ(0.03, 0.03),
    wrist: capsuleZ(0.033, 0.03),
    finProx: capsuleZ(0.0085, 0.03),
    finDist: capsuleZ(0.0078, 0.02),
    thumbProx: capsuleZ(0.0105, 0.028),
    thumbDist: capsuleZ(0.0095, 0.02),
    strap: new THREE.TorusGeometry(0.037, 0.008, 12, 36),
    watchCase: new THREE.CylinderGeometry(0.028, 0.028, 0.011, 32),
    watchBezel: new THREE.TorusGeometry(0.029, 0.0042, 10, 36),
    watchFace: new THREE.CylinderGeometry(0.0235, 0.0235, 0.002, 32),
    // legs & shoes
    pelvis: new THREE.SphereGeometry(1, 32, 24),
    thighs,
    calves,
    joint: new THREE.SphereGeometry(1, 24, 20),
    shoeUpper: new THREE.SphereGeometry(1, 32, 24),
    sole: capsuleZ(0.062, 0.12),
    // face
    eyeWhite: new THREE.SphereGeometry(0.0215, 24, 20),
    iris: new THREE.SphereGeometry(0.0125, 20, 16),
    pupil: new THREE.SphereGeometry(0.0064, 16, 12),
    glint: new THREE.SphereGeometry(0.0026, 10, 8),
    brows: [brow(-1), brow(1)],
    lids: [lid(-1), lid(1)],
    mustache: [mustache(-1), mustache(1)],
    upperLip: new THREE.TubeGeometry(lipPts(-0.066, 0.0035, 0.03), 20, 0.0052, 8, false),
    lowerLip: new THREE.TubeGeometry(lipPts(-0.077, 0.0045, 0.022), 20, 0.0058, 8, false),
    noseBridge: new THREE.CapsuleGeometry(0.011, 0.034, 6, 12),
    noseTip: new THREE.SphereGeometry(0.0175, 20, 16),
    nostril: new THREE.SphereGeometry(0.0095, 14, 12),
    // hair & beard
    hairCapTop: new THREE.SphereGeometry(HEAD_R * 1.045, 56, 36, 0, TAU, 0, 1.05),
    hairCapBack: new THREE.SphereGeometry(HEAD_R * 1.055, 56, 36, Math.PI - 0.45, Math.PI + 0.9, 0, 2.35),
    beardJaw: new THREE.SphereGeometry(HEAD_R * 1.014, 56, 24, 0, Math.PI, 2.08, 0.5),
    stubble: new THREE.SphereGeometry(HEAD_R * 1.008, 56, 24, 0.15, Math.PI - 0.3, 1.5, 0.6),
    locks: LOCKS.map(buildLock),
    // glasses
    frameLoop: new THREE.TubeGeometry(frameCurve, 140, 0.0052, 10, true),
    lens: new THREE.ShapeGeometry(lensShape, 24),
    bridge: new THREE.TubeGeometry(bridge, 20, 0.0048, 8, false),
    temples: [temple(-1), temple(1)].map((c) => new THREE.TubeGeometry(c, 32, 0.0042, 8, false)),
    // furniture
    deskTop: slab(1.9, 1.0, 0.03, 0.05),
    deskLeg: new THREE.CapsuleGeometry(0.022, 0.52, 6, 12),
    deskBar: new THREE.CapsuleGeometry(0.014, 1.64, 6, 10),
    kbBase: slab(0.45, 0.15, 0.014, 0.016),
    key: slab(0.026, 0.024, 0.008, 0.005),
    space: slab(0.17, 0.024, 0.008, 0.006),
    mouse: new THREE.SphereGeometry(1, 28, 20),
    monitor: panel(0.78, 0.46, 0.03, 0.022),
    monitorSmall: panel(0.58, 0.42, 0.03, 0.022),
    screen: new THREE.PlaneGeometry(0.73, 0.41),
    screenSmall: new THREE.PlaneGeometry(0.53, 0.37),
    standNeck: new THREE.CapsuleGeometry(0.018, 0.16, 6, 12),
    standFoot: new THREE.SphereGeometry(1, 28, 16),
    mug: new THREE.LatheGeometry(mugProfile, 32),
    mugHandle: new THREE.TorusGeometry(0.02, 0.0065, 10, 24, Math.PI),
    seat: new THREE.LatheGeometry(seatProfile, 48),
    backrest: new THREE.CapsuleGeometry(0.12, 0.2, 10, 24),
    pole: new THREE.CylinderGeometry(0.024, 0.03, 0.34, 20),
    chairArm: capsuleZ(0.02, 0.26),
    caster: new THREE.SphereGeometry(0.028, 16, 12),
  };
}

type Geo = ReturnType<typeof buildGeometries>;

/* -------------------------------------------------------------------------- */
/*  Materials (built once)                                                    */
/* -------------------------------------------------------------------------- */

function buildMaterials() {
  const std = (color: string, roughness: number, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  return {
    skin: std('#c68b66', 0.55, 0.02),
    skinDeep: std('#a86f4f', 0.6, 0.02),
    lip: std('#a45f4b', 0.5, 0.0),
    eyeWhite: std('#f1ece6', 0.35),
    iris: std('#2a1810', 0.3),
    pupil: new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.2 }),
    glint: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    brow: std('#1a1412', 0.8),
    lid: std('#2a1b14', 0.7),
    hair: std('#181210', 0.75),
    mustache: std('#2b1e17', 0.8),
    beard: std('#241a16', 0.85, 0, { transparent: true, opacity: 0.88, side: THREE.DoubleSide }),
    stubble: std('#241a16', 0.9, 0, { transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }),
    hoodie: std('#4a3022', 0.88, 0, { side: THREE.DoubleSide }),
    hoodieDark: std('#3b2519', 0.9),
    string: std('#d9d2c5', 0.8),
    inner: std('#241710', 0.95),
    jeans: std('#1e293b', 0.82),
    shoeDark: std('#1b1f2a', 0.55),
    shoeWhite: std('#ececec', 0.5),
    frame: std('#181b22', 0.35, 0.25),
    lens: new THREE.MeshStandardMaterial({
      color: '#bfefff',
      emissive: '#22d3ee',
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.22,
      roughness: 0.1,
      metalness: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    strap: std('#111318', 0.6),
    watchMetal: std('#7d848f', 0.25, 0.9),
    watchFace: std('#06090f', 0.15, 0.4, { emissive: '#0e7490', emissiveIntensity: 0.35 }),
    desk: std('#2b2f3a', 0.45, 0.05),
    deskMetal: std('#8b93a1', 0.35, 0.8),
    chair: std('#161922', 0.6),
    chairMetal: std('#aab1bd', 0.3, 0.85),
    kbBase: std('#20242d', 0.5, 0.2),
    key: std('#3a404d', 0.45, 0.05),
    keyAccent: std('#4a5262', 0.45, 0.05),
    mouse: std('#2d323d', 0.4, 0.1),
    monitorBody: std('#12151c', 0.4, 0.3),
    mug: std('#e8e2d6', 0.4),
  };
}

type Mats = ReturnType<typeof buildMaterials>;

/* -------------------------------------------------------------------------- */
/*  Animated screen textures                                                  */
/* -------------------------------------------------------------------------- */

type Seg = [string, string];
const CODE: Seg[][] = [
  [['from ', '#c792ea'], ['langgraph.graph ', '#82aaff'], ['import ', '#c792ea'], ['StateGraph, END', '#ffcb6b']],
  [['from ', '#c792ea'], ['agents ', '#82aaff'], ['import ', '#c792ea'], ['planner, verifier', '#ffcb6b']],
  [['', '#fff']],
  [['class ', '#c792ea'], ['AgentState', '#ffcb6b'], ['(TypedDict):', '#89ddff']],
  [['    messages', '#eeffff'], [': list', '#89ddff'], ['  # memory', '#546e7a']],
  [['    tenant_id', '#eeffff'], [': str', '#89ddff']],
  [['', '#fff']],
  [['graph ', '#eeffff'], ['= ', '#89ddff'], ['StateGraph', '#ffcb6b'], ['(AgentState)', '#89ddff']],
  [['graph.add_node', '#82aaff'], ['("plan", planner)', '#c3e88d']],
  [['graph.add_node', '#82aaff'], ['("verify", verifier)', '#c3e88d']],
  [['graph.add_edge', '#82aaff'], ['("plan", "verify")', '#c3e88d']],
  [['app ', '#eeffff'], ['= ', '#89ddff'], ['graph.compile', '#82aaff'], ['(checkpointer=pg)', '#c3e88d']],
  [['async def ', '#c792ea'], ['run', '#82aaff'], ['(q):', '#89ddff']],
  [['    return await ', '#c792ea'], ['app.ainvoke', '#82aaff'], ['({"messages": [q]})', '#c3e88d']],
];
const CODE_TOTAL = CODE.reduce((n, l) => n + l.reduce((m, s) => m + s[0].length, 0), 0);

function drawCode(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#111b2e';
  ctx.fillRect(0, 0, w, 48);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(28 + i * 26, 24, 8, 0, TAU);
    ctx.fill();
  });
  ctx.font = '600 20px ui-monospace, Menlo, monospace';
  ctx.fillStyle = '#7dd3fc';
  ctx.fillText('agent_graph.py', 132, 31);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 48, 64, h - 48);

  ctx.font = '22px ui-monospace, Menlo, monospace';
  const reveal = Math.floor(t * 16) % (CODE_TOTAL + 50);
  let used = 0;
  let cx = 0;
  let cy = 0;
  for (let li = 0; li < CODE.length; li++) {
    const y = 88 + li * 34;
    ctx.fillStyle = '#334155';
    ctx.fillText(String(li + 1).padStart(2, ' '), 18, y);
    let x = 82;
    cx = x;
    cy = y;
    for (const [text, color] of CODE[li]) {
      const left = reveal - used;
      if (left <= 0) break;
      const part = text.slice(0, Math.min(text.length, left));
      ctx.fillStyle = color;
      ctx.fillText(part, x, y);
      x += ctx.measureText(part).width;
      used += text.length;
      cx = x;
    }
    if (reveal - used <= 0 && used >= reveal) break;
  }
  if (Math.floor(t * 2) % 2 === 0) {
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(cx + 2, cy - 20, 11, 26);
  }
}

const NODES = [
  { x: 0.5, y: 0.14, l: 'Planner' },
  { x: 0.2, y: 0.42, l: 'Router' },
  { x: 0.8, y: 0.42, l: 'Memory' },
  { x: 0.12, y: 0.78, l: 'SQL Agent' },
  { x: 0.42, y: 0.78, l: 'Retriever' },
  { x: 0.72, y: 0.78, l: 'Verifier' },
  { x: 0.92, y: 0.2, l: 'Tenant' },
];
const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [4, 5],
  [2, 6],
];

function drawGraph(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = '#0a1018';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#122033';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  const px = (n: { x: number; y: number }) => [n.x * (w - 160) + 80, n.y * (h - 120) + 60] as const;
  ctx.lineWidth = 3;
  EDGES.forEach(([a, b], i) => {
    const [ax, ay] = px(NODES[a]);
    const [bx, by] = px(NODES[b]);
    ctx.strokeStyle = '#1e4a6b';
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    const k = (t * 0.45 + i * 0.21) % 1;
    ctx.fillStyle = '#22d3ee';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(ax + (bx - ax) * k, ay + (by - ay) * k, 6, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
  ctx.font = '600 20px ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  NODES.forEach((n, i) => {
    const [x, y] = px(n);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i);
    ctx.fillStyle = '#0f2236';
    ctx.strokeStyle = `rgba(34,211,238,${0.45 + 0.4 * pulse})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x - 68, y - 24, 136, 48, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText(n.l, x, y + 7);
  });
  ctx.textAlign = 'start';
}

function makeScreen(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { canvas, ctx, tex, w, h };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

const FINGER_X = [-0.027, -0.009, 0.009, 0.027]; // index -> pinky (mirrored per hand)
const FINGER_LEN = [1.0, 1.1, 1.0, 0.8];
const KEY_ROWS = 4;
const KEY_COLS = 14;

export function DeveloperAvatar({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  standalone = false,
}: DeveloperAvatarProps) {
  const geo = useMemo<Geo>(buildGeometries, []);
  const mats = useMemo<Mats>(buildMaterials, []);
  const screens = useMemo(() => ({ code: makeScreen(1024, 640), graph: makeScreen(768, 560) }), []);
  const screenMats = useMemo(
    () => ({
      code: new THREE.MeshBasicMaterial({ map: screens.code.tex, toneMapped: false }),
      graph: new THREE.MeshBasicMaterial({ map: screens.graph.tex, toneMapped: false }),
    }),
    [screens],
  );

  // Dispose GPU resources on unmount.
  useEffect(
    () => () => {
      const disposeDeep = (o: unknown) => {
        if (Array.isArray(o)) o.forEach(disposeDeep);
        else if (o && typeof (o as { dispose?: () => void }).dispose === 'function') (o as { dispose: () => void }).dispose();
      };
      Object.values(geo).forEach(disposeDeep);
      Object.values(mats).forEach(disposeDeep);
    },
    [geo, mats],
  );
  useEffect(
    () => () => {
      screens.code.tex.dispose();
      screens.graph.tex.dispose();
      screenMats.code.dispose();
      screenMats.graph.dispose();
    },
    [screens, screenMats],
  );

  /* ---- refs ---- */
  const upperRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const eyeRefs = useRef<(THREE.Group | null)[]>([null, null]);
  const handRefs = useRef<(THREE.Group | null)[]>([null, null]);
  const proxRefs = useRef<(THREE.Group | null)[][]>([[], []]);
  const distRefs = useRef<(THREE.Group | null)[][]>([[], []]);
  const thumbRefs = useRef<(THREE.Group | null)[]>([null, null]);
  const keysRef = useRef<THREE.InstancedMesh>(null);
  const gaze = useRef({ yaw: 0, pitch: 0.14, eye: 0 });
  const screenClock = useRef(0);

  /* ---- key layout ---- */
  useLayoutEffect(() => {
    const mesh = keysRef.current;
    if (!mesh) return;
    const d = new THREE.Object3D();
    let i = 0;
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let c = 0; c < KEY_COLS; c++) {
        d.position.set((c - (KEY_COLS - 1) / 2) * 0.0305 + (r % 2) * 0.004, 0.011, -0.055 + r * 0.029);
        d.updateMatrix();
        mesh.setMatrixAt(i++, d.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  /* ---- animation ---- */
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    // Breathing
    const breath = Math.sin(t * 2.1);
    if (upperRef.current) {
      upperRef.current.scale.set(1 + 0.004 * breath, 1 + 0.008 * breath, 1 + 0.004 * breath);
      upperRef.current.position.y = 0.002 * breath;
    }
    if (chestRef.current) {
      chestRef.current.scale.set(1 + 0.012 * breath, 1 + 0.006 * breath, 1 + 0.018 * breath);
    }

    // Gaze: main code monitor <-> secondary node-graph monitor <-> keyboard glance
    const c = t % 11;
    let yaw = 0.05 * Math.sin(t * 0.7);
    let pitch = 0.14 + 0.025 * Math.sin(t * 1.3);
    let eye = 0;
    if (c >= 5 && c < 7.2) {
      yaw = 0.38;
      pitch = 0.1;
      eye = 0.2;
    } else if (c >= 10) {
      yaw = 0;
      pitch = 0.3;
    } else if (c >= 7.2) {
      yaw = -0.04;
      pitch = 0.16;
    }
    const g = gaze.current;
    g.yaw = THREE.MathUtils.damp(g.yaw, yaw, 3.5, dt);
    g.pitch = THREE.MathUtils.damp(g.pitch, pitch, 4, dt);
    g.eye = THREE.MathUtils.damp(g.eye, eye, 8, dt);
    if (headRef.current) headRef.current.rotation.set(g.pitch, g.yaw, 0.02 * Math.sin(t * 0.5));

    // Blink
    const bl = (t + 0.7) % 4.3;
    const lid = bl < 0.13 ? 1 - 0.92 * Math.sin((bl / 0.13) * Math.PI) : 1;
    eyeRefs.current.forEach((e) => {
      if (!e) return;
      e.scale.y = lid;
      e.rotation.y = g.eye;
    });

    // Typing: alternating bursts, per-finger strokes, wrist micro-bounces
    const active = 0.7 + 0.3 * Math.sin(t * 0.9);
    for (let h = 0; h < 2; h++) {
      const hand = handRefs.current[h];
      if (hand) {
        const k = Math.max(0, Math.sin(t * 6.3 + h * Math.PI));
        hand.position.y = 0.15 + 0.0035 * k * active;
        hand.rotation.z = 0.035 * Math.sin(t * 4.7 + h * 2) * active;
        hand.rotation.x = -0.02 * k * active;
      }
      for (let f = 0; f < 4; f++) {
        const stroke = Math.max(0, Math.sin(t * (8.5 + f * 0.7 + h * 0.4) + (h * 1.7 + f * 0.9) * 2.1));
        const prox = proxRefs.current[h][f];
        const dist = distRefs.current[h][f];
        if (prox) prox.rotation.x = 0.22 + 0.3 * stroke * stroke * active;
        if (dist) dist.rotation.x = 0.5 + 0.35 * stroke * active;
      }
      const th = thumbRefs.current[h];
      if (th) th.rotation.x = 0.25 + 0.1 * Math.max(0, Math.sin(t * 2.3 + h * 3)) * active;
    }

    // Screens (throttled)
    screenClock.current += dt;
    if (screenClock.current > 0.12) {
      screenClock.current = 0;
      drawCode(screens.code.ctx, screens.code.w, screens.code.h, t);
      drawGraph(screens.graph.ctx, screens.graph.w, screens.graph.h, t);
      screens.code.tex.needsUpdate = true;
      screens.graph.tex.needsUpdate = true;
    }
  });

  /* ---- hand builder ---- */
  const hand = (idx: 0 | 1) => {
    const s = idx === 0 ? -1 : 1; // -X = right hand, +X = left hand
    const tan = geo.wristTangents[idx];
    const yaw = Math.atan2(tan.x, tan.z);
    return (
      <group
        key={`hand-${idx}`}
        ref={(el) => {
          handRefs.current[idx] = el;
        }}
        position={[s * 0.115, 0.15, 0.36]}
        rotation={[0, yaw, 0]}
      >
        <mesh geometry={geo.wrist} material={mats.skin} position={[0, 0, 0.02]} {...SHADOWS} />
        <mesh geometry={geo.palm} material={mats.skin} position={[0, -0.002, 0.055]} scale={[1.25, 0.55, 1]} {...SHADOWS} />
        {FINGER_X.map((fx, f) => (
          <group key={f} position={[-s * fx, -0.006, 0.095]} scale={[1, 1, FINGER_LEN[f]]}>
            <group
              ref={(el) => {
                proxRefs.current[idx][f] = el;
              }}
              rotation={[0.22, 0, 0]}
            >
              <mesh geometry={geo.finProx} material={mats.skin} position={[0, 0, 0.0235]} {...SHADOWS} />
              <group
                ref={(el) => {
                  distRefs.current[idx][f] = el;
                }}
                position={[0, 0, 0.044]}
                rotation={[0.5, 0, 0]}
              >
                <mesh geometry={geo.finDist} material={mats.skin} position={[0, 0, 0.0178]} {...SHADOWS} />
              </group>
            </group>
          </group>
        ))}
        {/* thumb */}
        <group position={[-s * 0.034, -0.008, 0.035]} rotation={[0, -s * 0.55, 0]}>
          <group
            ref={(el) => {
              thumbRefs.current[idx] = el;
            }}
            rotation={[0.25, 0, 0]}
          >
            <mesh geometry={geo.thumbProx} material={mats.skin} position={[0, 0, 0.022]} {...SHADOWS} />
            <group position={[0, 0, 0.04]} rotation={[0.25, 0, 0]}>
              <mesh geometry={geo.thumbDist} material={mats.skin} position={[0, 0, 0.014]} {...SHADOWS} />
            </group>
          </group>
        </group>
        {/* black strap watch on the left wrist */}
        {idx === 1 && (
          <group position={[0, 0, 0.016]}>
            <mesh geometry={geo.strap} material={mats.strap} scale={[1, 1, 1.5]} {...SHADOWS} />
            <mesh geometry={geo.watchCase} material={mats.watchMetal} position={[0, 0.038, 0]} {...SHADOWS} />
            <mesh geometry={geo.watchBezel} material={mats.watchMetal} position={[0, 0.0445, 0]} rotation={[Math.PI / 2, 0, 0]} {...SHADOWS} />
            <mesh geometry={geo.watchFace} material={mats.watchFace} position={[0, 0.0455, 0]} {...SHADOWS} />
          </group>
        )}
      </group>
    );
  };

  /* ---- arm builder ---- */
  const arm = (idx: 0 | 1) => {
    const s = idx === 0 ? -1 : 1;
    const tan = geo.wristTangents[idx];
    const q = new THREE.Quaternion().setFromUnitVectors(V3(0, 0, 1), tan);
    const wrist = V3(s * 0.115, 0.15, 0.36);
    const ribs = [0.004, -0.014, -0.032].map((o) => wrist.clone().addScaledVector(tan, o));
    return (
      <group key={`arm-${idx}`}>
        <mesh geometry={geo.sleeves[idx]} material={mats.hoodie} {...SHADOWS} />
        <mesh geometry={geo.shoulder} material={mats.hoodie} position={[s * 0.285, 0.5, 0]} {...SHADOWS} />
        {ribs.map((p, i) => (
          <mesh
            key={i}
            geometry={geo.cuffTorus}
            material={mats.hoodieDark}
            position={p}
            quaternion={q}
            scale={i === 1 ? [1.04, 1.04, 1.2] : 1}
            {...SHADOWS}
          />
        ))}
      </group>
    );
  };

  /* ---- sneaker builder ---- */
  const shoe = (s: -1 | 1) => (
    <group key={`shoe-${s}`} position={[s * 0.115, 0, 0]} rotation={[0, s * 0.1, 0]}>
      <mesh geometry={geo.shoeUpper} material={mats.shoeDark} position={[0, -0.445, 0.555]} scale={[0.068, 0.045, 0.125]} {...SHADOWS} />
      <mesh geometry={geo.sole} material={mats.shoeWhite} position={[0, -0.474, 0.55]} scale={[1.1, 0.42, 1]} {...SHADOWS} />
      <mesh geometry={geo.shoeUpper} material={mats.shoeWhite} position={[0, -0.462, 0.635]} scale={[0.052, 0.034, 0.052]} {...SHADOWS} />
      <mesh geometry={geo.shoeUpper} material={mats.shoeWhite} position={[0, -0.4, 0.5]} scale={[0.05, 0.016, 0.03]} {...SHADOWS} />
    </group>
  );

  /* ---- render ---- */
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Lighting & Shadows (Standalone mode only) */}
      {standalone && (
        <>
          <hemisphereLight args={['#c7d2fe', '#0b1020', 0.55]} />
          <directionalLight
            position={[2.5, 3.5, 2.5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-2}
            shadow-camera-right={2}
            shadow-camera-top={2}
            shadow-camera-bottom={-2}
            shadow-bias={-0.0004}
          />
          <pointLight position={[0, 0.58, 0.82]} color="#22d3ee" intensity={1.8} distance={3.5} decay={2} />
        </>
      )}
      <ContactShadows position={[0, -0.499, 0.4]} opacity={0.55} scale={5} blur={2.4} far={1.4} resolution={512} />

      {/* ======================= CHAIR ======================= */}
      <mesh geometry={geo.seat} material={mats.chair} {...SHADOWS} />
      <mesh geometry={geo.backrest} material={mats.chair} position={[0, 0.3, -0.3]} rotation={[-0.08, 0, 0]} scale={[1.7, 1, 0.34]} {...SHADOWS} />
      <mesh geometry={geo.pole} material={mats.chairMetal} position={[0, -0.32, 0]} {...SHADOWS} />
      <group position={[0, -0.475, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <group key={i} rotation={[0, (i / 5) * TAU + 0.3, 0]}>
            <mesh geometry={geo.chairArm} material={mats.chairMetal} position={[0, 0, 0.14]} {...SHADOWS} />
            <mesh geometry={geo.caster} material={mats.chair} position={[0, -0.0, 0.28]} {...SHADOWS} />
          </group>
        ))}
      </group>

      {/* ======================= DESK ======================= */}
      <mesh geometry={geo.deskTop} material={mats.desk} position={[0, 0.088, 0.8]} {...SHADOWS} />
      {([-1, 1] as const).flatMap((sx) =>
        [0.36, 1.24].map((z) => (
          <mesh key={`${sx}-${z}`} geometry={geo.deskLeg} material={mats.deskMetal} position={[sx * 0.88, -0.2, z]} {...SHADOWS} />
        )),
      )}
      <mesh geometry={geo.deskBar} material={mats.deskMetal} position={[0, -0.12, 1.24]} rotation={[0, 0, Math.PI / 2]} {...SHADOWS} />

      {/* Keyboard */}
      <group position={[0, 0.103, 0.52]}>
        <mesh geometry={geo.kbBase} material={mats.kbBase} position={[0, 0.007, 0]} {...SHADOWS} />
        <group position={[0, 0.014, 0]}>
          <instancedMesh ref={keysRef} args={[geo.key, mats.key, KEY_ROWS * KEY_COLS]} castShadow receiveShadow />
          <mesh geometry={geo.space} material={mats.keyAccent} position={[0.01, 0.011, 0.058]} {...SHADOWS} />
        </group>
      </group>
      {/* Mouse + mug */}
      <mesh geometry={geo.mouse} material={mats.mouse} position={[-0.3, 0.12, 0.52]} scale={[0.032, 0.017, 0.052]} {...SHADOWS} />
      <group position={[-0.55, 0.103, 0.68]}>
        <mesh geometry={geo.mug} material={mats.mug} {...SHADOWS} />
        <mesh geometry={geo.mugHandle} material={mats.mug} position={[0.04, 0.042, 0]} rotation={[0, 0, -Math.PI / 2]} {...SHADOWS} />
      </group>

      {/* Main code monitor */}
      <group position={[0, 0.103, 1.05]}>
        <mesh geometry={geo.standFoot} material={mats.monitorBody} position={[0, 0.006, 0.03]} scale={[0.14, 0.012, 0.09]} {...SHADOWS} />
        <mesh geometry={geo.standNeck} material={mats.monitorBody} position={[0, 0.17, 0.045]} {...SHADOWS} />
        <group position={[0, 0.42, 0]}>
          <mesh geometry={geo.monitor} material={mats.monitorBody} {...SHADOWS} />
          <mesh geometry={geo.screen} material={screenMats.code} position={[0, 0, -0.0165]} rotation={[0, Math.PI, 0]} />
        </group>
      </group>
      {/* Secondary node-graph monitor (turned toward the developer) */}
      <group position={[0.7, 0.103, 0.96]} rotation={[0, 0.62, 0]}>
        <mesh geometry={geo.standFoot} material={mats.monitorBody} position={[0, 0.006, 0.03]} scale={[0.12, 0.012, 0.08]} {...SHADOWS} />
        <mesh geometry={geo.standNeck} material={mats.monitorBody} position={[0, 0.16, 0.045]} {...SHADOWS} />
        <group position={[0, 0.4, 0]}>
          <mesh geometry={geo.monitorSmall} material={mats.monitorBody} {...SHADOWS} />
          <mesh geometry={geo.screenSmall} material={screenMats.graph} position={[0, 0, -0.0165]} rotation={[0, Math.PI, 0]} />
        </group>
      </group>

      {/* ======================= CHARACTER: lower body ======================= */}
      <mesh geometry={geo.pelvis} material={mats.jeans} position={[0, -0.01, -0.005]} scale={[0.205, 0.105, 0.17]} {...SHADOWS} />
      {([0, 1] as const).map((i) => {
        const s = i === 0 ? -1 : 1;
        return (
          <group key={`leg-${i}`}>
            <mesh geometry={geo.joint} material={mats.jeans} position={[s * 0.1, -0.01, 0.0]} scale={0.085} {...SHADOWS} />
            <mesh geometry={geo.thighs[i]} material={mats.jeans} {...SHADOWS} />
            <mesh geometry={geo.joint} material={mats.jeans} position={[s * 0.115, 0, 0.46]} scale={0.066} {...SHADOWS} />
            <mesh geometry={geo.calves[i]} material={mats.jeans} {...SHADOWS} />
          </group>
        );
      })}
      {shoe(-1)}
      {shoe(1)}

      {/* ======================= CHARACTER: upper body ======================= */}
      <group ref={upperRef}>
        {/* Torso (hoodie) */}
        <group ref={chestRef}>
          <mesh geometry={geo.torso} material={mats.hoodie} scale={TORSO_SCALE} {...SHADOWS} />
        </group>
        <mesh geometry={geo.hem} material={mats.hoodieDark} position={[0, -0.025, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.22, 0.86, 1]} {...SHADOWS} />
        {/* Kangaroo pocket */}
        <mesh geometry={geo.pocket} material={mats.hoodie} position={[0, 0.095, 0.176]} rotation={[0.06, 0, Math.PI / 2]} scale={[1, 1, 0.34]} {...SHADOWS} />
        {geo.pocketSeam.map((g, i) => (
          <mesh key={i} geometry={g} material={mats.hoodieDark} {...SHADOWS} />
        ))}
        {/* Hood: folded collar, pouch behind the shoulders, drawstrings */}
        <mesh geometry={geo.collar} material={mats.hoodie} position={[0, 0.625, 0.005]} rotation={[Math.PI / 2 + 0.25, 0, 0]} scale={[1.12, 1, 1]} {...SHADOWS} />
        <mesh geometry={geo.hoodPouch} material={mats.hoodie} position={[0, 0.575, -0.13]} scale={[1.5, 1, 0.75]} {...SHADOWS} />
        {geo.stringTube.map((g, i) => (
          <group key={i}>
            <mesh geometry={g} material={mats.string} {...SHADOWS} />
            <mesh
              geometry={geo.aglet}
              material={mats.string}
              position={[(i === 0 ? -1 : 1) * 0.06, 0.35, torsoFrontZ(0.06, 0.36) + 0.014]}
              {...SHADOWS}
            />
          </group>
        ))}

        {/* Arms + hands */}
        {arm(0)}
        {arm(1)}
        {hand(0)}
        {hand(1)}

        {/* Neck + head */}
        <mesh geometry={geo.neck} material={mats.skin} position={[0, 0.64, 0.012]} {...SHADOWS} />
        <group ref={headRef} position={[0, 0.69, 0.015]}>
          <group position={[0, 0.12, 0]}>
            {/* Skull */}
            <mesh geometry={geo.head} material={mats.skin} scale={HEAD_SCALE} {...SHADOWS} />
            {/* Ears */}
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.136, -0.006, -0.012]}>
                <mesh geometry={geo.ear} material={mats.skin} scale={[0.38, 1.0, 0.7]} {...SHADOWS} />
                <mesh geometry={geo.ear} material={mats.skinDeep} position={[s * 0.003, 0, 0.002]} scale={[0.22, 0.62, 0.42]} {...SHADOWS} />
              </group>
            ))}
            {/* Nose */}
            <mesh geometry={geo.noseBridge} material={mats.skin} position={onFace(0, -0.012, 0.004)} rotation={[-0.4, 0, 0]} {...SHADOWS} />
            <mesh geometry={geo.noseTip} material={mats.skin} position={[0, -0.046, faceZ(0, -0.046) + 0.018]} scale={[1, 0.9, 1]} {...SHADOWS} />
            {[-1, 1].map((s) => (
              <group key={s}>
                <mesh geometry={geo.nostril} material={mats.skin} position={[s * 0.016, -0.05, faceZ(0, -0.05) + 0.007]} {...SHADOWS} />
                <mesh geometry={geo.nostril} material={mats.inner} position={[s * 0.008, -0.058, faceZ(0, -0.058) + 0.012]} scale={0.5} {...SHADOWS} />
              </group>
            ))}
            {/* Eyes, lids, brows */}
            {([0, 1] as const).map((i) => {
              const s = i === 0 ? -1 : 1;
              const ex = s * 0.056;
              return (
                <group key={i}>
                  <group
                    ref={(el) => {
                      eyeRefs.current[i] = el;
                    }}
                    position={[ex, 0.012, faceZ(ex, 0.012) - 0.004]}
                  >
                    <mesh geometry={geo.eyeWhite} material={mats.eyeWhite} scale={[1.15, 0.8, 0.6]} {...SHADOWS} />
                    <mesh geometry={geo.iris} material={mats.iris} position={[0, 0, 0.009]} scale={[1, 1, 0.5]} {...SHADOWS} />
                    <mesh geometry={geo.pupil} material={mats.pupil} position={[0, 0, 0.0135]} scale={[1, 1, 0.5]} />
                    <mesh geometry={geo.glint} material={mats.glint} position={[0.0045, 0.005, 0.0158]} />
                  </group>
                  <mesh geometry={geo.lids[i]} material={mats.lid} {...SHADOWS} />
                  <mesh geometry={geo.brows[i]} material={mats.brow} {...SHADOWS} />
                </group>
              );
            })}
            {/* Mouth, mustache, beard */}
            <mesh geometry={geo.upperLip} material={mats.lip} {...SHADOWS} />
            <mesh geometry={geo.lowerLip} material={mats.lip} {...SHADOWS} />
            {geo.mustache.map((g, i) => (
              <mesh key={i} geometry={g} material={mats.mustache} {...SHADOWS} />
            ))}
            <mesh geometry={geo.beardJaw} material={mats.beard} scale={HEAD_SCALE} {...SHADOWS} />
            <mesh geometry={geo.stubble} material={mats.stubble} scale={HEAD_SCALE} />

            {/* Hair: cap + 20 wavy locks */}
            <mesh geometry={geo.hairCapTop} material={mats.hair} scale={HEAD_SCALE} {...SHADOWS} />
            <mesh geometry={geo.hairCapBack} material={mats.hair} scale={HEAD_SCALE} {...SHADOWS} />
            {geo.locks.map((g, i) => (
              <mesh key={i} geometry={g} material={mats.hair} {...SHADOWS} />
            ))}

            {/* Glasses */}
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.062, 0.004, 0.14]} rotation={[0, s * 0.45, 0]}>
                <mesh geometry={geo.frameLoop} material={mats.frame} {...SHADOWS} />
                <mesh geometry={geo.lens} material={mats.lens} />
              </group>
            ))}
            <mesh geometry={geo.bridge} material={mats.frame} {...SHADOWS} />
            {geo.temples.map((g, i) => (
              <mesh key={i} geometry={g} material={mats.frame} {...SHADOWS} />
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

export default DeveloperAvatar;
