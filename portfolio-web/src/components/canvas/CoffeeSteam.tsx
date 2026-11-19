'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STEAM_COUNT = 36;

/**
 * CoffeeSteam
 * ─────────────────────────────────────────────────────────────────────────────
 * Ceramic mug with dark hot coffee + realistic, semi-transparent,
 * wavy rising steam particles driven by procedural sinusoidal noise in useFrame.
 */
export function CoffeeSteam({
  position = [0, 0, 0],
}: {
  position?: [number, number, number];
}) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate initial particle coordinates and random seeds
  const [positions, seeds] = useMemo(() => {
    const pos = new Float32Array(STEAM_COUNT * 3);
    const s = new Float32Array(STEAM_COUNT * 3);

    for (let i = 0; i < STEAM_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.022;
      pos[i * 3 + 0] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = 0.08 + Math.random() * 0.28;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      s[i * 3 + 0] = Math.random() * 10; // phase X
      s[i * 3 + 1] = 0.04 + Math.random() * 0.06; // upward speed
      s[i * 3 + 2] = Math.random() * 10; // phase Z
    }
    return [pos, s];
  }, []);

  // Steam particle circular soft texture
  const steamTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      grad.addColorStop(0.35, 'rgba(230, 235, 245, 0.25)');
      grad.addColorStop(0.7, 'rgba(200, 210, 230, 0.08)');
      grad.addColorStop(1, 'rgba(200, 210, 230, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < STEAM_COUNT; i++) {
      const i3 = i * 3;
      const speed = seeds[i3 + 1];
      const phaseX = seeds[i3 + 0];
      const phaseZ = seeds[i3 + 2];

      // Rise continuously
      array[i3 + 1] += speed * 0.008;

      // Reset when particle reaches top
      if (array[i3 + 1] > 0.42) {
        array[i3 + 1] = 0.082;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.018;
        array[i3 + 0] = Math.cos(angle) * radius;
        array[i3 + 2] = Math.sin(angle) * radius;
      }

      // Wavy sinusoidal dispersion as steam curls and cools
      const heightFrac = (array[i3 + 1] - 0.08) / 0.34;
      const spread = 0.015 * heightFrac;
      array[i3 + 0] += Math.sin(t * 1.8 + phaseX) * spread * 0.12;
      array[i3 + 2] += Math.cos(t * 1.5 + phaseZ) * spread * 0.12;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <group position={position}>
      {/* ── Ceramic Coffee Mug ── */}
      {/* Mug Body */}
      <mesh position={[0, 0.042, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.042, 0.038, 0.084, 28]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.25} />
      </mesh>

      {/* Mug Hollow Interior */}
      <mesh position={[0, 0.046, 0]}>
        <cylinderGeometry args={[0.038, 0.035, 0.078, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>

      {/* Dark Hot Coffee Surface */}
      <mesh position={[0, 0.076, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.036, 24]} />
        <meshStandardMaterial color="#1a0f0a" roughness={0.15} metalness={0.1} />
      </mesh>

      {/* Mug Ceramic Handle */}
      <mesh position={[0.046, 0.042, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.024, 0.006, 12, 24, Math.PI * 1.1]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.25} />
      </mesh>

      {/* ── Wavy Rising Steam Particles ── */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          map={steamTexture}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
