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
      <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-slate-950/85 border border-slate-800 backdrop-blur-md shadow-2xl">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
          <div
            className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"
            style={{ animationDuration: '0.8s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-cyan-300">
            {Math.round(progress)}%
          </div>
        </div>
        <div className="text-[11px] uppercase tracking-widest text-slate-400 font-mono">
          Loading 3D Models
        </div>
      </div>
    </Html>
  );
}

export interface HeroSceneProps {
  enableControls?: boolean;
}

export function HeroScene({
  enableControls = true,
}: HeroSceneProps) {
  return (
    <div className="w-full h-full select-none">
      <Canvas
        shadows="soft"
        dpr={[1, 1.75]}
        camera={{
          position: [4.6, 3.4, 5.2],
          fov: 36,
        }}
        gl={{
          antialias: true,
          stencil: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        style={{ width: '100%', height: '100%', background: '#02050f' }}
      >
        {/* Full Freedom OrbitControls with Smooth Damping */}
        {enableControls && (
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            target={[0.0, 1.0, 0.35]}
            minDistance={2.2}
            maxDistance={14.0}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2.05}
            enablePan={true}
          />
        )}

        {/* Midnight Starry Sky Backdrop outside the room */}
        <Stars radius={110} depth={55} count={3500} factor={3.8} fade speed={0.4} />

        <Suspense fallback={<LoadingFallback />}>
          {/* Base Night Lighting */}
          <Lighting />

          {/* Full Room Diorama (Walls, Window, Skyline, Clock, Poster, Desk, Lamp, Steam, Character) */}
          <Room />

          {/* Cinematic Post-Processing */}
          <PostProcessingEffects />
        </Suspense>
      </Canvas>
    </div>
  );
}
