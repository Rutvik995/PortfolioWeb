import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { Suspense } from 'react'
import { Lighting } from './Lighting'
import { Room } from './Room'

// Room diorama group is positioned on the right side of the screen
const ROOM_OFFSET: [number, number, number] = [2.4, 0, 0]
const ORBIT_TARGET: [number, number, number] = [2.4, 0.95, 0]

export function SceneCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows="soft"
      camera={{ position: [6.8, 3.2, 6.8], fov: 40 }}
      style={{ background: '#060918', width: '100%', height: '100%' }}
      gl={{ antialias: true, toneMapping: 2 /* ACESFilmic */, toneMappingExposure: 1.15 }}
    >
      {/* Orbit locked to room center, constrained so floor never clips underneath */}
      <OrbitControls
        target={ORBIT_TARGET}
        enableDamping
        dampingFactor={0.05}
        minPolarAngle={Math.PI / 12}
        maxPolarAngle={Math.PI / 2.15}
        minAzimuthAngle={-Math.PI / 2.3}
        maxAzimuthAngle={Math.PI / 2.3}
        minDistance={4.2}
        maxDistance={13}
      />

      {/* Atmospheric Starfield in the Deep Background */}
      <Stars radius={120} depth={60} count={3500} factor={4} fade speed={0.5} />

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      <Suspense fallback={null}>
        {/* Global ambient, hemisphere & fill lights */}
        <Lighting />

        {/* 3D Room Diorama positioned on the right side of the screen */}
        <group position={ROOM_OFFSET}>
          <Room />
        </group>
      </Suspense>
    </Canvas>
  )
}
