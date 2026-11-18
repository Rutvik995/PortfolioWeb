import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { create } from 'zustand'

// ── Lamp Store (toggleable by clicking the lamp) ───────────────────────────
interface LampStore {
  lampOn: boolean
  toggleLamp: () => void
}

export const useLampStore = create<LampStore>((set) => ({
  lampOn: true,
  toggleLamp: () => set((s) => ({ lampOn: !s.lampOn })),
}))

export function Lighting() {
  const lampPtRef = useRef<THREE.PointLight>(null!)
  const lampOn = useLampStore((s) => s.lampOn)

  useEffect(() => {
    if (lampPtRef.current) {
      lampPtRef.current.intensity = lampOn ? 5.5 : 0.4
    }
  }, [lampOn])

  // Coordinates relative to world (room is at [2.1, -0.6, 0])
  // Desk lamp bulb sits around x = 2.1 - 1.25, y = -0.6 + 1.45, z = 0.55
  const lampBulbPos: [number, number, number] = [2.1 - 1.25, -0.6 + 1.45, 0.55]

  return (
    <>
      {/* ── Balanced Ambient & Hemisphere Lighting (No dark crushed shadows) ── */}
      <ambientLight intensity={0.75} color="#cbd5e1" />
      <hemisphereLight args={['#93c5fd', '#452c1e', 1.15]} />

      {/* ── Desk Lamp Key Light (ONLY shadow-casting light) ── */}
      <pointLight
        ref={lampPtRef}
        position={lampBulbPos}
        color="#ffb347"
        intensity={5.5}
        distance={8}
        decay={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* ── Window Moonlight Rim Light (crisp edge on boy's hair, glasses & hoodie) ── */}
      <directionalLight
        position={[5, 4, -3]}
        color="#60a5fa"
        intensity={1.8}
        castShadow={false}
      />

      {/* ── Monitor Displays Screen Glow ── */}
      <pointLight
        position={[2.1 - 0.7, -0.6 + 1.4, -0.1]}
        color="#38bdf8"
        intensity={1.4}
        distance={4}
        decay={2}
        castShadow={false}
      />

      {/* ── Soft Fill Light for Bookshelf / Left Wall ── */}
      <pointLight
        position={[2.1 - 1.5, -0.6 + 2.5, -0.5]}
        color="#93c5fd"
        intensity={0.6}
        distance={5}
        decay={2}
        castShadow={false}
      />
    </>
  )
}
