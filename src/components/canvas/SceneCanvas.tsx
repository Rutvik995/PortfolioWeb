import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { Suspense } from 'react'
import { Lighting } from './Lighting'
import { Room } from './Room'

// Exactly matched to Section 2 specification:
// Room diorama positioned on the right half of the screen
const ROOM_OFFSET: [number, number, number] = [2.1, -0.6, 0]
const ORBIT_TARGET: [number, number, number] = [2.1, 0.7, 0]

export function SceneCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows="soft"
      camera={{ position: [6.8, 5.2, 7.2], fov: 36 }}
      style={{ background: '#040711', width: '100%', height: '100%' }}
      gl={{
        antialias: true,
        stencil: true,
        toneMapping: 2 /* ACESFilmic */,
        toneMappingExposure: 1.12,
      }}
    >
      {/* Synchronized OrbitControls locked to [2.1, 0.7, 0] */}
      <OrbitControls
        target={ORBIT_TARGET}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={14}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.15}
      />

      {/* Deep midnight starry backdrop (#040711) */}
      <Stars radius={120} depth={60} count={3500} factor={3.5} fade speed={0.4} />

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      <Suspense fallback={null}>
        {/* Balanced Lighting Setup */}
        <Lighting />

        {/* Full 3D Room Diorama on the right half */}
        <group position={ROOM_OFFSET}>
          <Room />
        </group>
      </Suspense>
    </Canvas>
  )
}
