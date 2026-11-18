import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { create } from 'zustand'

// --- Zustand store for lamp on/off state ---
interface LampStore {
  lampOn: boolean
  toggleLamp: () => void
}

export const useLampStore = create<LampStore>((set) => ({
  lampOn: true,
  toggleLamp: () => set((s) => ({ lampOn: !s.lampOn })),
}))

export function Lighting() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null!)
  const lampOn = useLampStore((s) => s.lampOn)

  useEffect(() => {
    if (dirLightRef.current) {
      dirLightRef.current.visible = lampOn
    }
  }, [lampOn])

  return (
    <>
      {/* Cool night ambient */}
      <ambientLight color="#0a0a1a" intensity={0.1} />

      {/* Desk-lamp directional light — warm, shadow-casting */}
      <directionalLight
        ref={dirLightRef}
        color="#ffb74d"
        intensity={1.5}
        position={[1.5, 3, 1]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      {/* Mac / monitor screen glow — cool blue */}
      <pointLight
        color="#4fc3f7"
        intensity={0.8}
        position={[0.3, 1.6, -0.5]}
        distance={4}
        decay={2}
        castShadow={false}
      />

      {/* Moonlight through window */}
      <pointLight
        color="#6ea8fe"
        intensity={0.4}
        position={[-3.5, 2, -1]}
        distance={6}
        decay={2}
        castShadow={false}
      />
    </>
  )
}
