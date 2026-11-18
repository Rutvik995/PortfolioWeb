import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { Suspense } from 'react'
import { Lighting } from './Lighting'
import { Room } from './Room'
import { DeveloperAvatar } from './DeveloperAvatar'

// Room group is offset to the right side of screen
// Camera looks at the room center at [2.4, 0.6, 0]
const ROOM_OFFSET: [number, number, number] = [2.4, 0, 0]
const ORBIT_TARGET: [number, number, number] = [2.4, 0.9, 0]

export function SceneCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows="soft"
      camera={{ position: [7.5, 3.8, 7.5], fov: 42 }}
      style={{ background: '#060918', width: '100%', height: '100%' }}
      gl={{ antialias: true, toneMapping: 2 /* ACESFilmic */, toneMappingExposure: 1.1 }}
    >
      {/* Orbit locked to room center, constrained so floor never clips */}
      <OrbitControls
        target={ORBIT_TARGET}
        enableDamping
        dampingFactor={0.05}
        minPolarAngle={Math.PI / 10}
        maxPolarAngle={Math.PI / 2.15}
        minAzimuthAngle={-Math.PI / 2.5}
        maxAzimuthAngle={Math.PI / 2.5}
        minDistance={4.5}
        maxDistance={14}
      />

      {/* Deep starfield behind everything */}
      <Stars radius={120} depth={60} count={4000} factor={4} fade speed={0.6} />

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      <Suspense fallback={null}>
        {/* Global lighting */}
        <Lighting />

        {/* Everything in the room is offset to the right */}
        <group position={ROOM_OFFSET}>
          <Room />
          <DeveloperAvatar />
        </group>
      </Suspense>
    </Canvas>
  )
}
