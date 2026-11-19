'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WHITE_FRAME   = '#f8fafc';
const RED_CURTAIN   = '#7f1d1d'; // Deep red velvet
const RED_DARK      = '#58111a';
const BRASS_FINIAL  = '#d4af37';

/**
 * WindowCity
 * ─────────────────────────────────────────────────────────────────────────────
 * Left Wall features:
 *  - Large multi-pane window with white frame & reflective glass
 *  - Tied-back deep red pleated curtains with realistic folds
 *  - White radiator with heating fins below the window sill
 *  - Contained night city skyline outside the window with glowing windows
 *    and subtle random flicker, moon, and stars
 */
export function WindowCity() {
  const windowMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const cityRef = useRef<THREE.Group>(null);

  // Buildings data with random heights and positions
  const buildings = useMemo(() => {
    const list: Array<{
      x: number;
      z: number;
      w: number;
      h: number;
      d: number;
      color: string;
      litRatio: number;
    }> = [];

    // Layer 1: Foreground skyscrapers
    const layer1 = [
      { x: -5.2, z: -1.2, w: 0.9, h: 4.8, d: 1.1, color: '#09101d', litRatio: 0.8 },
      { x: -5.2, z: 0.2, w: 1.1, h: 5.6, d: 1.3, color: '#070d18', litRatio: 0.85 },
      { x: -5.2, z: 1.6, w: 0.8, h: 4.2, d: 0.9, color: '#0b1424', litRatio: 0.75 },
      { x: -5.2, z: -2.4, w: 0.9, h: 3.8, d: 1.0, color: '#0a1220', litRatio: 0.7 },
    ];

    // Layer 2: Mid-ground skyscrapers
    const layer2 = [
      { x: -7.0, z: -0.6, w: 1.4, h: 6.8, d: 1.4, color: '#050a14', litRatio: 0.65 },
      { x: -7.0, z: 1.0, w: 1.2, h: 7.4, d: 1.2, color: '#040810', litRatio: 0.7 },
      { x: -7.0, z: -2.0, w: 1.3, h: 5.8, d: 1.3, color: '#060b16', litRatio: 0.6 },
      { x: -7.0, z: 2.2, w: 1.1, h: 6.2, d: 1.1, color: '#050913', litRatio: 0.65 },
    ];

    // Layer 3: Distant skyline silhouette
    const layer3 = [
      { x: -9.5, z: 0.0, w: 2.0, h: 8.5, d: 2.0, color: '#02050c', litRatio: 0.5 },
      { x: -9.5, z: -1.8, w: 1.8, h: 9.2, d: 1.8, color: '#02040a', litRatio: 0.55 },
      { x: -9.5, z: 1.8, w: 1.9, h: 7.9, d: 1.9, color: '#020409', litRatio: 0.45 },
    ];

    return [...layer1, ...layer2, ...layer3];
  }, []);

  // Procedural Window Grid Texture
  const windowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#060b17';
      ctx.fillRect(0, 0, 512, 1024);

      const rows = 32;
      const cols = 16;
      const padX = 8;
      const padY = 12;
      const winW = (512 - (cols + 1) * padX) / cols;
      const winH = (1024 - (rows + 1) * padY) / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = padX + c * (winW + padX);
          const y = padY + r * (winH + padY);

          // 65% of windows lit with warm yellow/amber or cool white
          if (Math.random() > 0.35) {
            const isWarm = Math.random() > 0.4;
            const alpha = 0.5 + Math.random() * 0.5;
            ctx.fillStyle = isWarm
              ? `rgba(255, 214, 138, ${alpha})`
              : `rgba(219, 234, 254, ${alpha * 0.8})`;
            ctx.fillRect(x, y, winW, winH);
          }
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
    return tex;
  }, []);

  // Subtle flicker on random windows in useFrame
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (windowMaterialRef.current) {
      windowMaterialRef.current.emissiveIntensity =
        1.1 + 0.15 * Math.sin(t * 3.5) + 0.08 * Math.cos(t * 7.2);
    }
  });

  // Procedural Pleated Curtain Shape (Realistic vertical wave folds)
  const pleatedCurtainGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const waves = 7;
    const width = 0.42;
    const depth = 0.065;

    shape.moveTo(-width / 2, 0);
    for (let i = 0; i <= waves * 2; i++) {
      const u = i / (waves * 2);
      const x = -width / 2 + u * width;
      const z = (i % 2 === 0 ? 1 : -1) * depth;
      shape.lineTo(x, z);
    }
    shape.lineTo(width / 2, -0.04);
    shape.lineTo(-width / 2, -0.04);
    shape.closePath();

    const extrudeSettings = {
      depth: 2.15,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.008,
      bevelThickness: 0.008,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateX(Math.PI / 2);
    geom.center();
    return geom;
  }, []);

  return (
    <group>
      {/* ═════════════════════ WINDOW FRAME & GLASS ═════════════════════ */}
      {/* Mounted on the Left Wall (x = -2.08 facing +X into room) */}
      <group position={[-2.12, 1.82, 0.0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Outer White Window Casing */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.35, 2.05, 0.08]} />
          <meshStandardMaterial color={WHITE_FRAME} roughness={0.4} />
        </mesh>

        {/* Interior Opening Cutout Glass */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[2.15, 1.85]} />
          <meshPhysicalMaterial
            color="#93c5fd"
            transparent
            opacity={0.12}
            roughness={0.05}
            metalness={0.15}
            transmission={0.88}
            ior={1.52}
          />
        </mesh>

        {/* Window Sill Board */}
        <mesh position={[0, -1.04, 0.06]} castShadow receiveShadow>
          <boxGeometry args={[2.50, 0.05, 0.20]} />
          <meshStandardMaterial color={WHITE_FRAME} roughness={0.35} />
        </mesh>

        {/* White Mullions (Cross Grid) */}
        {/* Horizontal Center Bar */}
        <mesh position={[0, 0, 0.02]} castShadow>
          <boxGeometry args={[2.15, 0.045, 0.04]} />
          <meshStandardMaterial color={WHITE_FRAME} roughness={0.4} />
        </mesh>
        {/* Vertical Center Mullion */}
        <mesh position={[0, 0, 0.02]} castShadow>
          <boxGeometry args={[0.045, 1.85, 0.04]} />
          <meshStandardMaterial color={WHITE_FRAME} roughness={0.4} />
        </mesh>

        {/* ═════════════════════ TIED-BACK DEEP RED CURTAINS ═════════════════════ */}
        {/* Brass Curtain Rod & Finials */}
        <group position={[0, 1.12, 0.16]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 2.65, 16]} />
            <meshStandardMaterial color={BRASS_FINIAL} metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Left Finial */}
          <mesh position={[-1.34, 0, 0]}>
            <sphereGeometry args={[0.035, 16, 14]} />
            <meshStandardMaterial color={BRASS_FINIAL} metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Right Finial */}
          <mesh position={[1.34, 0, 0]}>
            <sphereGeometry args={[0.035, 16, 14]} />
            <meshStandardMaterial color={BRASS_FINIAL} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Left Tied-Back Curtain Panel */}
        <group position={[-0.95, -0.05, 0.14]} rotation={[0, 0.12, -0.04]}>
          <mesh geometry={pleatedCurtainGeometry} castShadow>
            <meshStandardMaterial
              color={RED_CURTAIN}
              roughness={0.88}
              metalness={0.05}
            />
          </mesh>
          {/* Brass Tie-back Sash */}
          <mesh position={[0, -0.12, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.18, 0.014, 10, 24]} />
            <meshStandardMaterial color={BRASS_FINIAL} metalness={0.88} roughness={0.25} />
          </mesh>
        </group>

        {/* Right Tied-Back Curtain Panel */}
        <group position={[0.95, -0.05, 0.14]} rotation={[0, -0.12, 0.04]}>
          <mesh geometry={pleatedCurtainGeometry} castShadow>
            <meshStandardMaterial
              color={RED_CURTAIN}
              roughness={0.88}
              metalness={0.05}
            />
          </mesh>
          {/* Brass Tie-back Sash */}
          <mesh position={[0, -0.12, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.18, 0.014, 10, 24]} />
            <meshStandardMaterial color={BRASS_FINIAL} metalness={0.88} roughness={0.25} />
          </mesh>
        </group>
      </group>

      {/* ═════════════════════ WHITE RADIATOR BELOW WINDOW ═════════════════════ */}
      <group position={[-2.05, 0.38, 0.0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Radiator Main Backplate */}
        <mesh position={[0, 0, 0.02]} castShadow receiveShadow>
          <boxGeometry args={[1.55, 0.54, 0.04]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>

        {/* Radiator Vertical Slats / Heating Fins (18 fins) */}
        {Array.from({ length: 18 }).map((_, i) => {
          const x = -0.70 + (i / 17) * 1.40;
          return (
            <mesh key={i} position={[x, 0, 0.055]} castShadow>
              <boxGeometry args={[0.038, 0.50, 0.03]} />
              <meshStandardMaterial color="#ffffff" roughness={0.35} />
            </mesh>
          );
        })}

        {/* Top Grille Bar */}
        <mesh position={[0, 0.27, 0.04]} castShadow>
          <boxGeometry args={[1.58, 0.025, 0.08]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.35} />
        </mesh>

        {/* Chrome Thermostatic Valve on Side */}
        <group position={[0.82, 0.22, 0.04]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, 0.05, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.028, 0.028, 0.025, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* ═════════════════════ NIGHT CITY SKYLINE OUTSIDE ═════════════════════ */}
      <group ref={cityRef}>
        {/* Deep Midnight Backdrop Sky outside window */}
        <mesh position={[-11.0, 3.5, 0.0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[16, 12]} />
          <meshBasicMaterial color="#030816" />
        </mesh>

        {/* Glowing Full Moon */}
        <mesh position={[-9.8, 5.2, -1.8]}>
          <circleGeometry args={[0.55, 32]} />
          <meshBasicMaterial color="#fffef0" />
        </mesh>
        {/* Soft Moon Halo */}
        <mesh position={[-9.8, 5.2, -1.8]}>
          <circleGeometry args={[1.2, 32]} />
          <meshBasicMaterial
            color="#7ea6ff"
            transparent
            opacity={0.18}
            depthWrite={false}
          />
        </mesh>

        {/* 3D Skyscrapers with Lit Emissive Windows */}
        {buildings.map((b, idx) => (
          <group key={idx} position={[b.x, b.h / 2 - 1.2, b.z]}>
            {/* Building Shell */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshStandardMaterial
                color={b.color}
                roughness={0.8}
                metalness={0.2}
              />
            </mesh>

            {/* Lit Windows Layer facing towards the room window (+X) */}
            <mesh position={[b.w / 2 + 0.005, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[b.d * 0.9, b.h * 0.9]} />
              <meshStandardMaterial
                ref={idx === 1 ? windowMaterialRef : undefined}
                color="#000000"
                emissive="#ffda91"
                emissiveMap={windowTexture}
                emissiveIntensity={1.2}
                roughness={0.5}
              />
            </mesh>

            {/* Rooftop Antenna / Beacon */}
            {idx % 2 === 0 && (
              <group position={[0, b.h / 2, 0]}>
                <mesh position={[0, 0.35, 0]}>
                  <cylinderGeometry args={[0.008, 0.016, 0.70, 8]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.9} />
                </mesh>
                <mesh position={[0, 0.72, 0]}>
                  <sphereGeometry args={[0.024, 8, 8]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
              </group>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}
