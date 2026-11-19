'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { portfolioConfig } from '@/config/portfolio.config';

/**
 * Lighting
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic night lighting configuration:
 *  - Deep midnight blue ambient and hemisphere fill
 *  - Directional cool-blue moonlight through the window
 *  - Soft purple-blue window bounce
 *  - Dynamic key lighting is provided by the warm desk lamp and glowing monitors
 */
export function Lighting() {
  const moonLightRef = useRef<THREE.DirectionalLight>(null);

  const { ambientColor, ambientIntensity, moonlightColor, moonlightIntensity } =
    portfolioConfig.lighting;

  return (
    <>
      {/* ── Deep Night Ambient Fill ── */}
      <ambientLight color={ambientColor} intensity={ambientIntensity} />

      {/* ── Hemisphere Light (Sky: Dark Blue, Ground: Deep Slate) ── */}
      <hemisphereLight
        color="#1e2942"
        groundColor="#0b111e"
        intensity={0.65}
      />

      {/* ── Moonlight Coming Through The Left Window Wall ── */}
      <directionalLight
        ref={moonLightRef}
        position={[-6.5, 5.2, -4.5]}
        intensity={moonlightIntensity}
        color={moonlightColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={18}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0003}
      />

      {/* ── Soft Window Bounce / Horizon Rim ── */}
      <pointLight
        position={[-2.8, 2.2, -1.8]}
        intensity={1.2}
        color="#5d78ff"
        distance={6}
        decay={2}
      />
    </>
  );
}
