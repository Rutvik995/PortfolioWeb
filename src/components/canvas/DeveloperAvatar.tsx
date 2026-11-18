'use client';

/**
 * DeveloperAvatar — Rutvik 3D Isometric Developer
 * ---------------------------------------------------------------------------
 * Fully procedural stylized 3D character and workstation matching reference:
 *  - Thick, luscious, layered wavy swept-back dark brown/black mane
 *    (voluminous quiff, deep side wave ridges, cascading nape waves onto collar)
 *  - Clean sculpted South Asian face: defined nose bridge, almond eyes,
 *    modern black rectangular glasses with horizontal temple arms
 *  - Crisp sculpted chinstrap beard along the exact jawline rim, trimmed mustache,
 *    and soul patch — clean smooth cheeks!
 *  - Chocolate brown oversized hoodie matching reference photo
 *  - Executive walnut desk with 3-drawer stack, dual glowing screens,
 *    Herman Miller style ergonomic mesh chair, keyboard with live typing keys
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface DeveloperAvatarProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  standalone?: boolean;
}

const TAU = Math.PI * 2;
const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const SHADOWS = { castShadow: true, receiveShadow: true } as const;

/** Head ellipsoid radii */
const HEAD_R = 0.15;
const HEAD_SCALE: [number, number, number] = [0.92, 1.08, 0.98];
const HR = { x: HEAD_R * 0.92, y: HEAD_R * 1.08, z: HEAD_R * 0.98 };

/** Z of the front of the face at (x, y), head-local */
function faceZ(x: number, y: number): number {
  const k = 1 - (x / HR.x) ** 2 - (y / HR.y) ** 2;
  return HR.z * Math.sqrt(Math.max(0, k));
}

const onFace = (x: number, y: number, off: number) => V3(x, y, faceZ(x, y) + off);

/** Custom tube with radius profile */
function taperedTube(
  curve: THREE.Curve<THREE.Vector3>,
  tubularSegments: number,
  radialSegments: number,
  radius: (u: number) => number,
): THREE.TubeGeometry {
  const geom = new THREE.TubeGeometry(curve, tubularSegments, 0.01, radialSegments, false);
  const pos = geom.attributes.position as THREE.BufferAttribute;
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const p = new THREE.Vector3();

  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments;
    const r = radius(u);
    const origin = curve.getPointAt(u);
    const N = frames.normals[i];
    const B = frames.binormals[i];

    for (let j = 0; j <= radialSegments; j++) {
      const idx = i * (radialSegments + 1) + j;
      const v = (j / radialSegments) * TAU;
      const cx = -Math.cos(v);
      const cy = Math.sin(v);
      p.copy(origin)
        .addScaledVector(N, cx * r)
        .addScaledVector(B, cy * r);
      pos.setXYZ(idx, p.x, p.y, p.z);
    }
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

const roundEnds = (u: number, blend = 0.08) => {
  const a = Math.min(1, u / blend);
  const b = Math.min(1, (1 - u) / blend);
  return Math.sin(a * Math.PI * 0.5) * Math.sin(b * Math.PI * 0.5);
};

function capsuleZ(r: number, length: number): THREE.CylinderGeometry {
  const c = new THREE.CylinderGeometry(r, r, length, 16);
  c.rotateX(Math.PI / 2);
  return c;
}

function slab(w: number, d: number, h: number, r: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const hw = w / 2 - r;
  const hd = d / 2 - r;
  shape.moveTo(-hw, -hd - r);
  shape.lineTo(hw, -hd - r);
  shape.absarc(hw, -hd, r, -Math.PI / 2, 0, false);
  shape.lineTo(hw + r, hd);
  shape.absarc(hw, hd, r, 0, Math.PI / 2, false);
  shape.lineTo(-hw, hd + r);
  shape.absarc(-hw, hd, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hw - r, -hd);
  shape.absarc(-hw, -hd, r, Math.PI, (Math.PI * 3) / 2, false);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: r * 0.4,
    bevelThickness: r * 0.4,
  });
  geom.rotateX(Math.PI / 2);
  geom.center();
  return geom;
}

function panel(w: number, h: number, d: number, r: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const hw = w / 2 - r;
  const hh = h / 2 - r;
  shape.moveTo(-hw, -hh - r);
  shape.lineTo(hw, -hh - r);
  shape.absarc(hw, -hh, r, -Math.PI / 2, 0, false);
  shape.lineTo(hw + r, hh);
  shape.absarc(hw, hh, r, 0, Math.PI / 2, false);
  shape.lineTo(-hw, hh + r);
  shape.absarc(-hw, hh, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hw - r, -hh);
  shape.absarc(-hw, -hh, r, Math.PI, (Math.PI * 3) / 2, false);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.004,
    bevelThickness: 0.004,
  });
  geom.center();
  return geom;
}

function superellipse(a: number, b: number, n: number, steps = 64): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * TAU;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const x = a * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / n);
    const y = b * Math.sign(st) * Math.pow(Math.abs(st), 2 / n);
    pts.push(V3(x, y, 0));
  }
  return pts;
}

/* -------------------------------------------------------------------------- */
/*  Torso Profile (Oversized Hoodie)                                          */
/* -------------------------------------------------------------------------- */

const TORSO_PROFILE: THREE.Vector2[] = [
  [0, -0.05],
  [0.185, -0.05],
  [0.21, 0.06],
  [0.235, 0.22],
  [0.245, 0.38],
  [0.23, 0.52],
  [0.17, 0.62],
  [0.11, 0.64],
  [0, 0.64],
].map(([r, y]) => new THREE.Vector2(r, y));

const TORSO_SCALE: [number, number, number] = [1.08, 1.0, 0.88];

function torsoFrontZ(x: number, y: number): number {
  const r = 0.21 + 0.035 * Math.sin((y / 0.64) * Math.PI);
  const k = 1 - (x / (r * TORSO_SCALE[0])) ** 2;
  return r * TORSO_SCALE[2] * Math.sqrt(Math.max(0, k));
}

/* -------------------------------------------------------------------------- */
/*  Hair Wave & Beard Spline Builders                                         */
/* -------------------------------------------------------------------------- */

function createHairWave(
  points: [number, number, number][],
  baseRadius: number,
  endTaper = 0.45,
  tubularSegments = 32,
): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => V3(x, y, z)), false, 'centripetal');
  return taperedTube(curve, tubularSegments, 10, (u) => baseRadius * (1 - endTaper * u) * roundEnds(u, 0.06));
}

function createBeardCurve(
  points: [number, number, number][],
  radius = 0.0075,
): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => V3(x, y, z)), false, 'centripetal');
  return taperedTube(curve, 24, 8, (u) => radius * (1 - 0.3 * u) * roundEnds(u, 0.08));
}

/* -------------------------------------------------------------------------- */
/*  Geometries Factory                                                        */
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
        [0.026, 0.044, 0.062, 0.078, 0.092].map((ax, i) => {
          const x = s * ax;
          const y = 0.048 + 0.011 * Math.sin((i / 4) * Math.PI * 0.9) - 0.003 * (i / 4);
          return onFace(x, y, 0.007);
        }),
      ),
      20,
      8,
      (u) => 0.0078 * (1 - 0.45 * u) * roundEnds(u, 0.12),
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

  const lipPts = (yBase: number, curl: number, half: number) =>
    new THREE.CatmullRomCurve3(
      [-1, -0.5, 0, 0.5, 1].map((k) => {
        const x = k * half;
        return onFace(x, yBase + curl * k * k, 0.0065);
      }),
    );

  /* ---- glasses ---- */
  const lensA = 0.046;
  const lensB = 0.035;
  const loop = superellipse(lensA, lensB, 4, 56);
  const frameCurve = new THREE.CatmullRomCurve3(loop, true, 'centripetal');
  const lensShape = new THREE.Shape(loop.map((p) => new THREE.Vector2(p.x, p.y)));

  const bridge = new THREE.CatmullRomCurve3([V3(-0.021, 0.014, 0.16), V3(0, 0.022, 0.167), V3(0.021, 0.014, 0.16)]);
  const temple = (s: number) =>
    new THREE.CatmullRomCurve3([
      V3(s * 0.105, 0.012, 0.12),
      V3(s * 0.134, 0.012, 0.07),
      V3(s * 0.145, 0.012, 0.0),
      V3(s * 0.144, -0.006, -0.06),
      V3(s * 0.138, -0.03, -0.085),
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

  /* ---- coffee mug ---- */
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

  /* ---- chair seat profile ---- */
  const seatProfile = [
    [0, -0.155],
    [0.25, -0.155],
    [0.285, -0.14],
    [0.295, -0.12],
    [0.28, -0.098],
    [0.2, -0.094],
    [0, -0.094],
  ].map(([r, y]) => new THREE.Vector2(r, y));

  /* ═════════════════════════════════════════════════════════════════════════
     24 CURATED HAIR WAVE SPLINES — Exact Match to Reference Photo
     ═════════════════════════════════════════════════════════════════════════ */
  const hairWaves: THREE.TubeGeometry[] = [
    // ── 1. Front Quiff / Pompadour Waves (arch high from forehead, sweep back) ──
    createHairWave([[0.00, 0.09, 0.15], [0.00, 0.21, 0.14], [-0.01, 0.23, 0.07], [-0.02, 0.20, -0.03]], 0.036, 0.35),
    createHairWave([[-0.04, 0.08, 0.15], [-0.05, 0.20, 0.13], [-0.06, 0.22, 0.06], [-0.07, 0.18, -0.04]], 0.034, 0.35),
    createHairWave([[0.04, 0.08, 0.15], [0.05, 0.20, 0.13], [0.05, 0.22, 0.06], [0.06, 0.18, -0.04]], 0.034, 0.35),
    createHairWave([[-0.07, 0.07, 0.14], [-0.09, 0.18, 0.12], [-0.10, 0.20, 0.04], [-0.11, 0.16, -0.06]], 0.032, 0.38),
    createHairWave([[0.07, 0.07, 0.14], [0.08, 0.18, 0.12], [0.09, 0.20, 0.04], [0.10, 0.16, -0.06]], 0.032, 0.38),
    createHairWave([[-0.02, 0.10, 0.16], [-0.03, 0.22, 0.12], [-0.04, 0.23, 0.02], [-0.04, 0.19, -0.08]], 0.035, 0.35),

    // ── 2. Top & Crown Waves (volume across the skull) ──
    createHairWave([[-0.02, 0.22, 0.04], [-0.03, 0.21, -0.05], [-0.03, 0.16, -0.13]], 0.036, 0.38),
    createHairWave([[-0.07, 0.20, 0.03], [-0.08, 0.19, -0.06], [-0.08, 0.15, -0.13]], 0.034, 0.38),
    createHairWave([[0.04, 0.20, 0.03], [0.05, 0.19, -0.06], [0.05, 0.15, -0.13]], 0.034, 0.38),
    createHairWave([[0.00, 0.21, -0.02], [0.00, 0.19, -0.09], [0.00, 0.13, -0.15]], 0.036, 0.38),

    // ── 3. Right Side Waves (-X, Direct Isometric Camera View!) ──
    // Distinctive horizontal S-curve waves rolling back over the ear
    createHairWave([[-0.09, 0.11, 0.12], [-0.14, 0.09, 0.04], [-0.155, 0.06, -0.05], [-0.13, 0.01, -0.13]], 0.034, 0.40),
    createHairWave([[-0.11, 0.06, 0.10], [-0.155, 0.03, 0.02], [-0.16, -0.01, -0.06], [-0.135, -0.06, -0.13]], 0.034, 0.40),
    createHairWave([[-0.10, 0.02, 0.08], [-0.14, -0.02, 0.02], [-0.145, -0.07, -0.06], [-0.12, -0.12, -0.12]], 0.032, 0.42),
    createHairWave([[-0.08, 0.07, 0.14], [-0.12, 0.05, 0.09], [-0.135, 0.01, 0.04]], 0.028, 0.45),
    createHairWave([[-0.11, 0.15, 0.06], [-0.155, 0.12, -0.02], [-0.16, 0.06, -0.10]], 0.033, 0.40),

    // ── 4. Left Side Waves (+X) ──
    createHairWave([[0.09, 0.11, 0.12], [0.14, 0.09, 0.04], [0.155, 0.06, -0.05], [0.13, 0.01, -0.13]], 0.034, 0.40),
    createHairWave([[0.11, 0.06, 0.10], [0.155, 0.03, 0.02], [0.16, -0.01, -0.06], [0.135, -0.06, -0.13]], 0.034, 0.40),
    createHairWave([[0.10, 0.02, 0.08], [0.14, -0.02, 0.02], [0.145, -0.07, -0.06], [0.12, -0.12, -0.12]], 0.032, 0.42),

    // ── 5. Back & Nape Cascading Mane (Flows onto Hoodie with outward flip!) ──
    createHairWave([[-0.04, 0.12, -0.13], [-0.05, 0.00, -0.16], [-0.06, -0.10, -0.16], [-0.05, -0.17, -0.14]], 0.038, 0.35),
    createHairWave([[0.00, 0.12, -0.14], [0.00, 0.00, -0.17], [0.00, -0.11, -0.17], [0.00, -0.18, -0.15]], 0.040, 0.35),
    createHairWave([[0.04, 0.12, -0.13], [0.05, 0.00, -0.16], [0.06, -0.10, -0.16], [0.05, -0.17, -0.14]], 0.038, 0.35),
    createHairWave([[-0.09, 0.08, -0.12], [-0.10, -0.02, -0.15], [-0.11, -0.11, -0.15], [-0.09, -0.16, -0.13]], 0.035, 0.38),
    createHairWave([[0.09, 0.08, -0.12], [0.10, -0.02, -0.15], [0.11, -0.11, -0.15], [0.09, -0.16, -0.13]], 0.035, 0.38),
    createHairWave([[-0.02, -0.06, -0.165], [-0.02, -0.14, -0.165], [-0.01, -0.19, -0.14]], 0.036, 0.35),
  ];

  /* ═════════════════════════════════════════════════════════════════════════
     5 SCULPTED BEARD & MUSTACHE TUBES — Clean Cheeks, Mandibular Jawline Rim
     ═════════════════════════════════════════════════════════════════════════ */
  const beardCurves: THREE.TubeGeometry[] = [
    // 1. Right Mandibular Jawline Chinstrap (-X side, camera profile!)
    createBeardCurve([
      [-0.132, -0.055, -0.025],
      [-0.122, -0.088, 0.032],
      [-0.082, -0.112, 0.092],
      [-0.025, -0.124, 0.130],
      [0.000, -0.126, 0.134],
    ], 0.0085),

    // 2. Left Mandibular Jawline Chinstrap (+X side)
    createBeardCurve([
      [0.132, -0.055, -0.025],
      [0.122, -0.088, 0.032],
      [0.082, -0.112, 0.092],
      [0.025, -0.124, 0.130],
      [0.000, -0.126, 0.134],
    ], 0.0085),

    // 3. Chin Soul Patch (under lower lip)
    createBeardCurve([
      [0.000, -0.090, 0.138],
      [0.000, -0.105, 0.136],
      [0.000, -0.118, 0.133],
    ], 0.0070),

    // 4. Right Trimmed Pencil Mustache (directly above upper lip)
    createBeardCurve([
      [0.000, -0.058, 0.148],
      [-0.018, -0.061, 0.145],
      [-0.034, -0.066, 0.138],
    ], 0.0065),

    // 5. Left Trimmed Pencil Mustache (directly above upper lip)
    createBeardCurve([
      [0.000, -0.058, 0.148],
      [0.018, -0.061, 0.145],
      [0.034, -0.066, 0.138],
    ], 0.0065),
  ];

  return {
    // Body & Head
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

    // Hands & Watch
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

    // Legs & Shoes
    pelvis: new THREE.SphereGeometry(1, 32, 24),
    thighs,
    calves,
    joint: new THREE.SphereGeometry(1, 24, 20),
    shoeUpper: new THREE.SphereGeometry(1, 32, 24),
    sole: capsuleZ(0.062, 0.12),

    // Face details
    eyeWhite: new THREE.SphereGeometry(0.0215, 24, 20),
    iris: new THREE.SphereGeometry(0.0125, 20, 16),
    pupil: new THREE.SphereGeometry(0.0064, 16, 12),
    glint: new THREE.SphereGeometry(0.0026, 10, 8),
    brows: [brow(-1), brow(1)],
    lids: [lid(-1), lid(1)],
    upperLip: new THREE.TubeGeometry(lipPts(-0.066, 0.0035, 0.03), 20, 0.0052, 8, false),
    lowerLip: new THREE.TubeGeometry(lipPts(-0.077, 0.0045, 0.022), 20, 0.0058, 8, false),
    noseBridge: new THREE.CapsuleGeometry(0.011, 0.034, 6, 12),
    noseTip: new THREE.SphereGeometry(0.0175, 20, 16),
    nostril: new THREE.SphereGeometry(0.0095, 14, 12),

    // Hair: Underlay Cap + 24 Curated Wave Splines
    hairCapTop: new THREE.SphereGeometry(HEAD_R * 1.05, 48, 32, 0, TAU, 0, 1.25),
    hairCapBack: new THREE.SphereGeometry(HEAD_R * 1.06, 48, 32, Math.PI - 0.55, Math.PI + 1.1, 0, 2.65),
    hairWaves,
    beardCurves,

    // Glasses
    frameLoop: new THREE.TubeGeometry(frameCurve, 140, 0.0052, 10, true),
    lens: new THREE.ShapeGeometry(lensShape, 24),
    bridge: new THREE.TubeGeometry(bridge, 20, 0.0048, 8, false),
    temples: [temple(-1), temple(1)].map((c) => new THREE.TubeGeometry(c, 32, 0.0042, 8, false)),

    // Executive Walnut Desk
    deskTop: slab(1.9, 1.0, 0.035, 0.04),
    deskDrawerStack: new THREE.BoxGeometry(0.44, 0.52, 0.88),
    drawerFace: new THREE.BoxGeometry(0.42, 0.15, 0.02),
    drawerHandle: new THREE.BoxGeometry(0.12, 0.016, 0.02),
    deskSidePanelLeft: new THREE.BoxGeometry(0.04, 0.52, 0.88),
    deskModestyPanel: new THREE.BoxGeometry(1.36, 0.38, 0.02),

    // Typing Keyboard & Mouse
    kbBase: slab(0.45, 0.15, 0.014, 0.016),
    key: slab(0.026, 0.024, 0.008, 0.005),
    space: slab(0.17, 0.024, 0.008, 0.006),
    mouse: new THREE.SphereGeometry(1, 28, 20),

    // Monitors
    monitor: panel(0.78, 0.46, 0.024, 0.018),
    monitorSmall: panel(0.58, 0.42, 0.024, 0.018),
    screen: new THREE.PlaneGeometry(0.74, 0.42),
    screenSmall: new THREE.PlaneGeometry(0.54, 0.38),
    standNeck: new THREE.CapsuleGeometry(0.016, 0.16, 6, 12),
    standFoot: slab(0.22, 0.16, 0.01, 0.02),

    // Ceramic Mug
    mug: new THREE.LatheGeometry(mugProfile, 32),
    mugHandle: new THREE.TorusGeometry(0.02, 0.0065, 10, 24, Math.PI),

    // Ergonomic Chair
    seat: new THREE.LatheGeometry(seatProfile, 48),
    backrest: new THREE.CapsuleGeometry(0.12, 0.2, 10, 24),
    chairFrame: new THREE.TorusGeometry(0.16, 0.014, 12, 36),
    pole: new THREE.CylinderGeometry(0.024, 0.03, 0.34, 20),
    chairArm: capsuleZ(0.02, 0.26),
    caster: new THREE.SphereGeometry(0.028, 16, 12),
  };
}

type Geo = ReturnType<typeof buildGeometries>;

/* -------------------------------------------------------------------------- */
/*  Materials Factory                                                         */
/* -------------------------------------------------------------------------- */

function buildMaterials() {
  const std = (color: string, roughness: number, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });

  return {
    // South Asian tan skin tone
    skin: std('#ba7b56', 0.52, 0.02),
    skinDeep: std('#a06745', 0.58, 0.02),
    lip: std('#a25c48', 0.48, 0.0),
    eyeWhite: std('#f4efe9', 0.35),
    iris: std('#22140d', 0.3),
    pupil: new THREE.MeshBasicMaterial({ color: '#040404' }),
    glint: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    brow: std('#16110e', 0.85),

    // Hair & Sculpted Beard
    hair: std('#181210', 0.65, 0.06),
    beard: std('#16110e', 0.88),

    // Glasses
    frame: std('#151922', 0.35, 0.15),
    lens: new THREE.MeshPhysicalMaterial({
      color: '#e2e8f0',
      transparent: true,
      opacity: 0.18,
      roughness: 0.05,
      metalness: 0.1,
      reflectivity: 0.8,
    }),

    // Chocolate brown hoodie
    hoodie: std('#5e3422', 0.82),
    hoodieDark: std('#4a2818', 0.88),
    string: std('#3e2114', 0.7),

    // Clothing & Accessories
    jeans: std('#1e2538', 0.78),
    shoeDark: std('#1e293b', 0.6),
    shoeWhite: std('#f8fafc', 0.35),
    strap: std('#0f172a', 0.8),
    watchMetal: std('#e2e8f0', 0.25, 0.95),
    watchFace: std('#0284c7', 0.2, 0.1),
    inner: std('#451218', 0.7),

    // Furniture & Tech
    desk: std('#52331e', 0.62), // Warm walnut wood
    deskDrawer: std('#462a17', 0.65),
    deskBrass: std('#d4af37', 0.25, 0.9), // Drawer handles
    chair: std('#1e2330', 0.7),
    chairMetal: std('#cbd5e1', 0.3, 0.85),
    kbBase: std('#0f172a', 0.5, 0.4),
    key: std('#1e293b', 0.55),
    keyAccent: std('#0284c7', 0.4),
    mouse: std('#0f172a', 0.35, 0.2),
    monitorBody: std('#e2e8f0', 0.28, 0.85), // Apple aluminum
    mug: std('#f8fafc', 0.25),
  };
}

type Mats = ReturnType<typeof buildMaterials>;

/* -------------------------------------------------------------------------- */
/*  Live Typing Code & Graph Monitor Displays                                 */
/* -------------------------------------------------------------------------- */

const CODE = [
  [['import ', '#c792ea'], ['{ agent, task } ', '#ffcb6b'], ['from ', '#c792ea'], ['"@google/gemini"', '#c3e88d']],
  [['import ', '#c792ea'], ['* as three ', '#ffcb6b'], ['from ', '#c792ea'], ['"three"', '#c3e88d']],
  [['', '#fff']],
  [['export class ', '#c792ea'], ['RutvikPortfolio ', '#82aaff'], ['implements ', '#c792ea'], ['AIDeveloper ', '#ffcb6b'], ['{', '#89ddff']],
  [['  name: string = ', '#89ddff'], ['"Rutvik"', '#c3e88d'], [';', '#89ddff']],
  [['  role: string = ', '#89ddff'], ['"Full Stack & AI Engineer"', '#c3e88d'], [';', '#89ddff']],
  [['  skills: string[] = [', '#89ddff'], ['"React", "Three.js", "Python", "LLMs"', '#c3e88d'], ['];', '#89ddff']],
  [['', '#fff']],
  [['  async ', '#c792ea'], ['buildExperience', '#82aaff'], ['(): ', '#89ddff'], ['Promise<Scene> ', '#ffcb6b'], ['{', '#89ddff']],
  [['    const ', '#c792ea'], ['scene ', '#eeffff'], ['= ', '#89ddff'], ['new Scene3D()', '#ffcb6b'], [';', '#89ddff']],
  [['    await ', '#c792ea'], ['scene.render60FPS()', '#82aaff'], [';', '#89ddff']],
  [['    return ', '#c792ea'], ['scene.launch()', '#82aaff'], [';', '#89ddff']],
  [['  }', '#89ddff']],
  [['}', '#89ddff']],
];

const CODE_TOTAL = CODE.reduce((n, l) => n + l.reduce((m, s) => m + s[0].length, 0), 0);

function drawCode(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = '#0a101d';
  ctx.fillRect(0, 0, w, h);

  // Window title bar
  ctx.fillStyle = '#111b2e';
  ctx.fillRect(0, 0, w, 44);
  ['#ef4444', '#f59e0b', '#10b981'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(24 + i * 22, 22, 6, 0, TAU);
    ctx.fill();
  });
  ctx.font = '600 18px ui-monospace, Menlo, monospace';
  ctx.fillStyle = '#93c5fd';
  ctx.fillText('RutvikDeveloper.ts', 105, 28);

  // Line numbers column
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 44, 58, h - 44);

  ctx.font = '20px ui-monospace, Menlo, monospace';
  const reveal = Math.floor(t * 18) % (CODE_TOTAL + 60);
  let used = 0;
  let cx = 0;
  let cy = 0;

  for (let li = 0; li < CODE.length; li++) {
    const y = 80 + li * 32;
    ctx.fillStyle = '#334155';
    ctx.fillText(String(li + 1).padStart(2, ' '), 16, y);
    let x = 74;
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

  // Blinking typing cursor
  if (Math.floor(t * 2.5) % 2 === 0) {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx + 2, cy - 18, 9, 23);
  }
}

const NODES = [
  { x: 0.5, y: 0.16, l: 'Agent Core' },
  { x: 0.22, y: 0.44, l: 'Planning' },
  { x: 0.78, y: 0.44, l: 'Memory' },
  { x: 0.15, y: 0.80, l: 'Code Gen' },
  { x: 0.50, y: 0.80, l: '3D Engine' },
  { x: 0.85, y: 0.80, l: 'Deploy' },
];

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 4],
  [2, 5],
  [4, 5],
];

function drawGraph(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = '#080d1a';
  ctx.fillRect(0, 0, w, h);

  // Background grid
  ctx.strokeStyle = '#101c30';
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

  const px = (n: { x: number; y: number }) => [n.x * (w - 140) + 70, n.y * (h - 100) + 50] as const;

  // Edges & data pulses
  ctx.lineWidth = 2.5;
  EDGES.forEach(([a, b], i) => {
    const [ax, ay] = px(NODES[a]);
    const [bx, by] = px(NODES[b]);
    ctx.strokeStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    const k = (t * 0.5 + i * 0.25) % 1;
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(ax + (bx - ax) * k, ay + (by - ay) * k, 5, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Nodes
  ctx.font = '600 18px ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  NODES.forEach((n, i) => {
    const [x, y] = px(n);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.5 + i);
    ctx.fillStyle = '#0d1f36';
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + 0.45 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - 56, y - 20, 112, 40, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f0f9ff';
    ctx.fillText(n.l, x, y + 6);
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

const FINGER_X = [-0.027, -0.009, 0.009, 0.027];
const KEY_ROWS = 4;
const KEY_COLS = 14;

export function DeveloperAvatar({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  standalone: _standalone = false,
}: DeveloperAvatarProps) {
  const geo = useMemo<Geo>(() => buildGeometries(), []);
  const mats = useMemo<Mats>(() => buildMaterials(), []);
  const [screens] = useState(() => ({ code: makeScreen(1024, 640), graph: makeScreen(768, 560) }));
  const screenMats = useMemo(
    () => ({
      code: new THREE.MeshBasicMaterial({ map: screens.code.tex }),
      graph: new THREE.MeshBasicMaterial({ map: screens.graph.tex }),
    }),
    [screens],
  );

  // Clean up GPU resources on unmount
  useEffect(
    () => () => {
      const disposeDeep = (o: unknown) => {
        if (Array.isArray(o)) o.forEach(disposeDeep);
        else if (o && typeof (o as { dispose?: () => void }).dispose === 'function') (o as { dispose: () => void }).dispose();
      };
      Object.values(geo).forEach(disposeDeep);
      Object.values(mats).forEach(disposeDeep);
      screens.code.tex.dispose();
      screens.graph.tex.dispose();
      screenMats.code.dispose();
      screenMats.graph.dispose();
    },
    [geo, mats, screens, screenMats],
  );

  /* ---- refs ---- */
  const upperRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const handRefs = useRef<(THREE.Group | null)[]>([null, null]);
  const proxRefs = useRef<(THREE.Group | null)[][]>([[], []]);
  const keysRef = useRef<THREE.InstancedMesh>(null);

  // Initialize keyboard keys matrix
  useEffect(() => {
    const mesh = keysRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    let idx = 0;
    const kw = 0.03;
    const kd = 0.028;
    const x0 = -((KEY_COLS - 1) * kw) / 2;
    const z0 = -((KEY_ROWS - 1) * kd) / 2;

    for (let r = 0; r < KEY_ROWS; r++) {
      for (let c = 0; c < KEY_COLS; c++) {
        p.set(x0 + c * kw, 0, z0 + r * kd);
        m.compose(p, q, s);
        mesh.setMatrixAt(idx++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  // Frame animations (typing, breathing, live screens)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Subtle natural breathing
    if (upperRef.current) {
      upperRef.current.position.y = 0.003 * Math.sin(t * 1.8);
      upperRef.current.rotation.x = -0.05 + 0.012 * Math.sin(t * 1.8);
    }
    if (headRef.current) {
      headRef.current.rotation.x = 0.04 + 0.008 * Math.cos(t * 1.4);
      headRef.current.rotation.y = 0.03 * Math.sin(t * 0.9);
    }

    // Typing fingers animation
    handRefs.current.forEach((hand, hi) => {
      if (!hand) return;
      const s = hi === 0 ? -1 : 1;
      hand.position.y = 0.002 * Math.sin(t * 14 + hi * 2);
      proxRefs.current[hi]?.forEach((f, fi) => {
        if (!f) return;
        const tap = Math.sin(t * 18 + hi * 3 + fi * 1.6);
        f.rotation.x = -0.25 - 0.22 * Math.max(0, tap);
        f.rotation.z = s * 0.04 * tap;
      });
    });

    // Update canvas screen textures
    drawCode(screens.code.ctx, screens.code.w, screens.code.h, t);
    drawGraph(screens.graph.ctx, screens.graph.w, screens.graph.h, t);
    screens.code.tex.needsUpdate = true;
    screens.graph.tex.needsUpdate = true;
  });

  /* ---- hand builder ---- */
  const hand = (idx: 0 | 1) => {
    const s = idx === 0 ? -1 : 1;
    const hx = s * 0.115;
    const hy = 0.15;
    const hz = 0.36;

    return (
      <group
        key={`hand-${idx}`}
        ref={(el) => {
          handRefs.current[idx] = el;
        }}
        position={[hx, hy, hz]}
        rotation={[0.3, s * 0.15, -s * 0.1]}
      >
        <mesh geometry={geo.wrist} material={mats.skin} position={[0, 0, 0.02]} {...SHADOWS} />
        <mesh geometry={geo.palm} material={mats.skin} position={[0, 0, 0.05]} scale={[1, 0.8, 1]} {...SHADOWS} />

        {/* Fingers */}
        {FINGER_X.map((fx, fi) => (
          <group
            key={fi}
            ref={(el) => {
              if (!proxRefs.current[idx]) proxRefs.current[idx] = [];
              proxRefs.current[idx][fi] = el;
            }}
            position={[s * fx, 0, 0.075]}
          >
            <mesh geometry={geo.finProx} material={mats.skin} position={[0, 0, 0.015]} {...SHADOWS} />
            <mesh geometry={geo.finDist} material={mats.skin} position={[0, -0.008, 0.035]} rotation={[-0.4, 0, 0]} {...SHADOWS} />
          </group>
        ))}

        {/* Thumb */}
        <group position={[-s * 0.028, -0.008, 0.045]} rotation={[0.4, -s * 0.5, s * 0.3]}>
          <mesh geometry={geo.thumbProx} material={mats.skin} position={[0, 0, 0.014]} {...SHADOWS} />
          <mesh geometry={geo.thumbDist} material={mats.skin} position={[0, 0, 0.034]} rotation={[-0.3, 0, 0]} {...SHADOWS} />
        </group>

        {/* Left wrist watch */}
        {idx === 1 && (
          <group position={[0, 0, 0.016]}>
            <mesh geometry={geo.strap} material={mats.strap} scale={[1, 1, 1.5]} {...SHADOWS} />
            <mesh geometry={geo.watchCase} material={mats.watchMetal} position={[0, 0.038, 0]} {...SHADOWS} />
            <mesh geometry={geo.watchBezel} material={mats.watchMetal} position={[0, 0.044, 0]} rotation={[Math.PI / 2, 0, 0]} {...SHADOWS} />
            <mesh geometry={geo.watchFace} material={mats.watchFace} position={[0, 0.045, 0]} {...SHADOWS} />
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

  /* ---- shoe builder ---- */
  const shoe = (s: -1 | 1) => (
    <group key={`shoe-${s}`} position={[s * 0.115, 0, 0]} rotation={[0, s * 0.1, 0]}>
      <mesh geometry={geo.shoeUpper} material={mats.shoeDark} position={[0, -0.445, 0.555]} scale={[0.068, 0.045, 0.125]} {...SHADOWS} />
      <mesh geometry={geo.sole} material={mats.shoeWhite} position={[0, -0.474, 0.55]} scale={[1.1, 0.42, 1]} {...SHADOWS} />
      <mesh geometry={geo.shoeUpper} material={mats.shoeWhite} position={[0, -0.462, 0.635]} scale={[0.052, 0.034, 0.052]} {...SHADOWS} />
    </group>
  );

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* =====================================================================
          1. ERGONOMIC MESH CHAIR (Herman Miller Aeron Style)
          ===================================================================== */}
      <mesh geometry={geo.seat} material={mats.chair} {...SHADOWS} />
      {/* Contoured mesh backrest */}
      <group position={[0, 0.28, -0.28]} rotation={[-0.06, 0, 0]}>
        <mesh geometry={geo.backrest} material={mats.chair} scale={[1.65, 1, 0.32]} {...SHADOWS} />
        <mesh geometry={geo.chairFrame} material={mats.chairMetal} position={[0, 0, -0.02]} scale={[1.1, 1.35, 1]} {...SHADOWS} />
      </group>
      {/* Hydraulic center column */}
      <mesh geometry={geo.pole} material={mats.chairMetal} position={[0, -0.32, 0]} {...SHADOWS} />
      {/* 5-star caster base on floor */}
      <group position={[0, -0.475, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <group key={i} rotation={[0, (i / 5) * TAU + 0.3, 0]}>
            <mesh geometry={geo.chairArm} material={mats.chairMetal} position={[0, 0, 0.14]} {...SHADOWS} />
            <mesh geometry={geo.caster} material={mats.chair} position={[0, 0, 0.28]} {...SHADOWS} />
          </group>
        ))}
      </group>

      {/* =====================================================================
          2. EXECUTIVE WALNUT DESK & WORKSPACE (Exact Match to Image 5)
          ===================================================================== */}
      {/* Solid walnut desk top slab */}
      <mesh geometry={geo.deskTop} material={mats.desk} position={[0, 0.088, 0.8]} {...SHADOWS} />

      {/* Right-hand side 3-drawer cabinet stack (solid pedestal) */}
      <group position={[0.66, -0.17, 0.8]}>
        <mesh geometry={geo.deskDrawerStack} material={mats.deskDrawer} {...SHADOWS} />
        {/* 3 Drawer front faces with brushed brass horizontal pull handles */}
        {[-0.16, 0.00, 0.16].map((dy, idx) => (
          <group key={idx} position={[0, dy, -0.44]}>
            <mesh geometry={geo.drawerFace} material={mats.desk} {...SHADOWS} />
            <mesh geometry={geo.drawerHandle} material={mats.deskBrass} position={[0, 0, -0.018]} {...SHADOWS} />
          </group>
        ))}
      </group>

      {/* Left-hand side solid wood panel leg */}
      <mesh geometry={geo.deskSidePanelLeft} material={mats.desk} position={[-0.88, -0.17, 0.8]} {...SHADOWS} />
      {/* Back modesty structural panel */}
      <mesh geometry={geo.deskModestyPanel} material={mats.deskDrawer} position={[-0.04, -0.10, 1.22]} {...SHADOWS} />

      {/* Mechanical Backlit Keyboard */}
      <group position={[0, 0.103, 0.52]}>
        <mesh geometry={geo.kbBase} material={mats.kbBase} position={[0, 0.007, 0]} {...SHADOWS} />
        <group position={[0, 0.014, 0]}>
          <instancedMesh ref={keysRef} args={[geo.key, mats.key, KEY_ROWS * KEY_COLS]} castShadow receiveShadow />
          <mesh geometry={geo.space} material={mats.keyAccent} position={[0.01, 0.011, 0.058]} {...SHADOWS} />
        </group>
      </group>

      {/* Modern Mouse */}
      <mesh geometry={geo.mouse} material={mats.mouse} position={[-0.30, 0.12, 0.52]} scale={[0.032, 0.017, 0.052]} {...SHADOWS} />

      {/* Ceramic Coffee Mug */}
      <group position={[-0.55, 0.103, 0.68]}>
        <mesh geometry={geo.mug} material={mats.mug} {...SHADOWS} />
        <mesh geometry={geo.mugHandle} material={mats.mug} position={[0.04, 0.042, 0]} rotation={[0, 0, -Math.PI / 2]} {...SHADOWS} />
      </group>

      {/* =====================================================================
          3. DUAL-SCREEN WORKSTATION (iMac Main Screen + Laptop / Graph Screen)
          ===================================================================== */}
      {/* Main Studio Display Code Monitor (Angled for clear visibility from camera) */}
      <group position={[0.05, 0.103, 1.05]} rotation={[0, 0.12, 0]}>
        {/* Apple aluminum L-stand foot & neck */}
        <mesh geometry={geo.standFoot} material={mats.monitorBody} position={[0, 0.006, 0.02]} {...SHADOWS} />
        <mesh geometry={geo.standNeck} material={mats.monitorBody} position={[0, 0.17, 0.04]} {...SHADOWS} />
        {/* Monitor casing & screen */}
        <group position={[0, 0.42, 0]}>
          <mesh geometry={geo.monitor} material={mats.monitorBody} {...SHADOWS} />
          {/* Code screen facing the developer & visible to camera */}
          <mesh geometry={geo.screen} material={screenMats.code} position={[0, 0, -0.014]} rotation={[0, Math.PI, 0]} />
        </group>
      </group>

      {/* Secondary Node-Graph Monitor / Laptop Display (Angled toward developer) */}
      <group position={[0.68, 0.103, 0.94]} rotation={[0, 0.55, 0]}>
        <mesh geometry={geo.standFoot} material={mats.monitorBody} position={[0, 0.006, 0.02]} scale={[0.85, 1, 0.85]} {...SHADOWS} />
        <mesh geometry={geo.standNeck} material={mats.monitorBody} position={[0, 0.15, 0.04]} {...SHADOWS} />
        <group position={[0, 0.38, 0]}>
          <mesh geometry={geo.monitorSmall} material={mats.monitorBody} {...SHADOWS} />
          <mesh geometry={geo.screenSmall} material={screenMats.graph} position={[0, 0, -0.014]} rotation={[0, Math.PI, 0]} />
        </group>
      </group>

      {/* =====================================================================
          4. DEVELOPER: LOWER BODY & SNEAKERS
          ===================================================================== */}
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

      {/* =====================================================================
          5. DEVELOPER: UPPER BODY & CHOCOLATE BROWN HOODIE
          ===================================================================== */}
      <group ref={upperRef}>
        {/* Torso & Ribbed Hem */}
        <mesh geometry={geo.torso} material={mats.hoodie} scale={TORSO_SCALE} {...SHADOWS} />
        <mesh geometry={geo.hem} material={mats.hoodieDark} position={[0, -0.025, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.22, 0.86, 1]} {...SHADOWS} />

        {/* Kangaroo Pouch Pocket */}
        <mesh geometry={geo.pocket} material={mats.hoodie} position={[0, 0.095, 0.176]} rotation={[0.06, 0, Math.PI / 2]} scale={[1, 1, 0.34]} {...SHADOWS} />
        {geo.pocketSeam.map((g, i) => (
          <mesh key={i} geometry={g} material={mats.hoodieDark} {...SHADOWS} />
        ))}

        {/* Draped Cowl / Hood Pouch Resting on Shoulders */}
        <mesh geometry={geo.collar} material={mats.hoodie} position={[0, 0.625, 0.005]} rotation={[Math.PI / 2 + 0.25, 0, 0]} scale={[1.12, 1, 1]} {...SHADOWS} />
        <mesh geometry={geo.hoodPouch} material={mats.hoodie} position={[0, 0.575, -0.13]} scale={[1.5, 1, 0.75]} {...SHADOWS} />

        {/* Hood Drawstrings with Aglets */}
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

        {/* Arms & Typing Hands */}
        {arm(0)}
        {arm(1)}
        {hand(0)}
        {hand(1)}

        {/* =================================================================
            6. HEAD, EXACT HAIR MANE, DEFINED FACE & JAWLINE BEARD
            ================================================================= */}
        <mesh geometry={geo.neck} material={mats.skin} position={[0, 0.64, 0.012]} {...SHADOWS} />
        <group ref={headRef} position={[0, 0.69, 0.015]}>
          <group position={[0, 0.12, 0]}>
            {/* Skull Ellipsoid */}
            <mesh geometry={geo.head} material={mats.skin} scale={HEAD_SCALE} {...SHADOWS} />

            {/* Anatomical Ears Peeking Through Wavy Hair */}
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.136, -0.006, -0.012]}>
                <mesh geometry={geo.ear} material={mats.skin} scale={[0.38, 1.0, 0.7]} {...SHADOWS} />
                <mesh geometry={geo.ear} material={mats.skinDeep} position={[s * 0.003, 0, 0.002]} scale={[0.22, 0.62, 0.42]} {...SHADOWS} />
              </group>
            ))}

            {/* Defined Straight Nose Bridge & Sculpted Tip */}
            <mesh geometry={geo.noseBridge} material={mats.skin} position={onFace(0, -0.012, 0.004)} rotation={[-0.4, 0, 0]} {...SHADOWS} />
            <mesh geometry={geo.noseTip} material={mats.skin} position={[0, -0.044, faceZ(0, -0.044) + 0.018]} scale={[1, 0.9, 1]} {...SHADOWS} />
            {[-1, 1].map((s) => (
              <group key={s}>
                <mesh geometry={geo.nostril} material={mats.skin} position={[s * 0.016, -0.05, faceZ(0, -0.05) + 0.007]} {...SHADOWS} />
                <mesh geometry={geo.nostril} material={mats.inner} position={[s * 0.008, -0.058, faceZ(0, -0.058) + 0.012]} scale={0.5} {...SHADOWS} />
              </group>
            ))}

            {/* Almond Eyes, Eyelids, Glossy Iris & Glint */}
            {([0, 1] as const).map((i) => {
              const s = i === 0 ? -1 : 1;
              const ex = s * 0.056;
              return (
                <group key={i}>
                  <group position={[ex, 0.012, faceZ(ex, 0.012) - 0.004]}>
                    <mesh geometry={geo.eyeWhite} material={mats.eyeWhite} scale={[1.15, 0.8, 0.6]} {...SHADOWS} />
                    <mesh geometry={geo.iris} material={mats.iris} position={[0, 0, 0.009]} scale={[1, 1, 0.5]} {...SHADOWS} />
                    <mesh geometry={geo.pupil} material={mats.pupil} position={[0, 0, 0.0135]} scale={[1, 1, 0.5]} />
                    <mesh geometry={geo.glint} material={mats.glint} position={[0.0045, 0.005, 0.0158]} />
                  </group>
                  <mesh geometry={geo.lids[i]} material={mats.skin} {...SHADOWS} />
                  <mesh geometry={geo.brows[i]} material={mats.brow} {...SHADOWS} />
                </group>
              );
            })}

            {/* Natural Lips */}
            <mesh geometry={geo.upperLip} material={mats.lip} {...SHADOWS} />
            <mesh geometry={geo.lowerLip} material={mats.lip} {...SHADOWS} />

            {/* ── 24 Curated Hair Wave Splines + Solid Underlay Caps ── */}
            <mesh geometry={geo.hairCapTop} material={mats.hair} scale={HEAD_SCALE} {...SHADOWS} />
            <mesh geometry={geo.hairCapBack} material={mats.hair} scale={HEAD_SCALE} {...SHADOWS} />
            {geo.hairWaves.map((g, i) => (
              <mesh key={`hair-${i}`} geometry={g} material={mats.hair} {...SHADOWS} />
            ))}

            {/* ── 5 Sculpted Jawline Beard & Mustache Tubes (Clean Cheeks!) ── */}
            {geo.beardCurves.map((g, i) => (
              <mesh key={`beard-${i}`} geometry={g} material={mats.beard} {...SHADOWS} />
            ))}

            {/* ── Modern Black Rectangular Glasses with Temple Arms ── */}
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.062, 0.004, 0.14]} rotation={[0, s * 0.45, 0]}>
                <mesh geometry={geo.frameLoop} material={mats.frame} {...SHADOWS} />
                <mesh geometry={geo.lens} material={mats.lens} />
              </group>
            ))}
            <mesh geometry={geo.bridge} material={mats.frame} {...SHADOWS} />
            {geo.temples.map((g, i) => (
              <mesh key={`temple-${i}`} geometry={g} material={mats.frame} {...SHADOWS} />
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

export default DeveloperAvatar;
