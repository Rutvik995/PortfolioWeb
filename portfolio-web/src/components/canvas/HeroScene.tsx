'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Room } from './Room';
import { Lighting } from './Lighting';
import { PostProcessingEffects } from './PostProcessingEffects';

/**
 * LoadingFallback
 * Drei useProgress circular loader
 */
function LoadingFallback() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '20px 24px',
          borderRadius: '16px',
          backgroundColor: 'rgba(2, 5, 15, 0.90)',
          border: '1px solid #1e293b',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '9999px',
              border: '2px solid #1e293b',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '9999px',
              border: '2px solid #38bdf8',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 700,
              color: '#38bdf8',
            }}
          >
            {Math.round(progress)}%
          </div>
        </div>
        <div
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#94a3b8',
            fontFamily: 'monospace',
          }}
        >
          Loading 3D Models
        </div>
      </div>
    </Html>
  );
}

// Right-side framing coordinates:
// Room offset shifted to the right side of the screen
const RIGHT_SIDE_OFFSET: [number, number, number] = [1.85, -0.45, 0];
const ORBIT_TARGET: [number, number, number] = [1.85, 0.75, 0];

export interface HeroSceneProps {
  enableControls?: boolean;
}

export function HeroScene({
  enableControls = true,
}: HeroSceneProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <Canvas
        shadows="soft"
        dpr={[1, 1.75]}
        camera={{
          position: [6.4, 4.4, 6.6],
          fov: 34,
        }}
        gl={{
          antialias: true,
          stencil: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          backgroundColor: '#02050f',
        }}
      >
        {/* Synchronized OrbitControls locked to the right-side room center */}
        {enableControls && (
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            target={ORBIT_TARGET}
            minDistance={2.5}
            maxDistance={14.0}
            minPolarAngle={0.25}
            maxPolarAngle={Math.PI / 2.12}
            enablePan={true}
          />
        )}

        {/* Midnight Starry Sky Backdrop outside the room */}
        <Stars radius={110} depth={55} count={3500} factor={3.8} fade speed={0.4} />

        <Suspense fallback={<LoadingFallback />}>
          {/* Base Night Lighting */}
          <Lighting />

          {/* Full Room Diorama framed BIG in the right-center of the screen */}
          <group position={RIGHT_SIDE_OFFSET} scale={1.22}>
            <Room />
          </group>

          {/* Cinematic Post-Processing */}
          <PostProcessingEffects />
        </Suspense>
      </Canvas>
    </div>
  );
}
