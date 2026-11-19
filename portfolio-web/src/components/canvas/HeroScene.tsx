'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';
import { portfolioConfig } from '@/config/portfolio.config';
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
      <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-2xl">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
          <div
            className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"
            style={{ animationDuration: '0.8s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-cyan-300">
            {Math.round(progress)}%
          </div>
        </div>
        <div className="text-xs uppercase tracking-widest text-slate-400 font-mono">
          Compiling 3D Workstation
        </div>
      </div>
    </Html>
  );
}

/**
 * CameraRig
 * Smooth mouse parallax + scroll-driven zoom toward monitor
 */
function CameraRig({
  scrollProgress = 0,
}: {
  scrollProgress: number;
}) {
  const initialPos = useRef(new THREE.Vector3(...portfolioConfig.camera.initialPosition));
  const targetPos = useRef(new THREE.Vector3(...portfolioConfig.camera.zoomInTarget));
  const lookAtTarget = useRef(new THREE.Vector3(...portfolioConfig.camera.initialTarget));

  useFrame((state) => {
    const { pointer, camera } = state;

    // 1. Mouse parallax offset (subtle, clamped)
    const parallaxX = pointer.x * 0.45;
    const parallaxY = pointer.y * 0.30;

    // 2. Interpolate camera position based on scrollProgress
    const currentBaseX = THREE.MathUtils.lerp(initialPos.current.x, targetPos.current.x + 0.6, scrollProgress);
    const currentBaseY = THREE.MathUtils.lerp(initialPos.current.y, targetPos.current.y + 0.35, scrollProgress);
    const currentBaseZ = THREE.MathUtils.lerp(initialPos.current.z, targetPos.current.z + 1.25, scrollProgress);

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, currentBaseX + parallaxX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, currentBaseY + parallaxY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, currentBaseZ, 0.05);

    // 3. Interpolate look-at target
    const currentLookX = THREE.MathUtils.lerp(lookAtTarget.current.x, targetPos.current.x, scrollProgress);
    const currentLookY = THREE.MathUtils.lerp(lookAtTarget.current.y, targetPos.current.y, scrollProgress);
    const currentLookZ = THREE.MathUtils.lerp(lookAtTarget.current.z, targetPos.current.z, scrollProgress);

    camera.lookAt(currentLookX, currentLookY, currentLookZ);
  });

  return null;
}

export interface HeroSceneProps {
  scrollProgress?: number;
  onObjectClick?: (objectName: string) => void;
  enableControls?: boolean;
}

export function HeroScene({
  scrollProgress = 0,
  onObjectClick,
  enableControls = true,
}: HeroSceneProps) {
  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        shadows="soft"
        dpr={[1, 1.75]}
        camera={{
          position: portfolioConfig.camera.initialPosition,
          fov: portfolioConfig.camera.fov,
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
        {/* Parallax & Scroll camera rig */}
        <CameraRig scrollProgress={scrollProgress} />

        {/* Optional manual orbit controls when not scrolling */}
        {enableControls && scrollProgress < 0.1 && (
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            target={portfolioConfig.camera.initialTarget}
            minDistance={4.2}
            maxDistance={12.0}
            minPolarAngle={0.4}
            maxPolarAngle={Math.PI / 2.15}
            enablePan={false}
          />
        )}

        {/* Midnight Starry Sky Backdrop outside the room */}
        <Stars radius={110} depth={55} count={3500} factor={3.8} fade speed={0.4} />

        <Suspense fallback={<LoadingFallback />}>
          {/* Base Night Lighting */}
          <Lighting />

          {/* Full Room Diorama */}
          <Room onObjectClick={onObjectClick} />

          {/* Cinematic Post-Processing */}
          <PostProcessingEffects />
        </Suspense>
      </Canvas>
    </div>
  );
}
