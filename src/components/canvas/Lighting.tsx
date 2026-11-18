import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { create } from 'zustand'

// ── Lamp Store (toggled by clicking the lamp) ─────────────────────────────
interface LampStore { lampOn: boolean; toggleLamp: () => void }
export const useLampStore = create<LampStore>((set) => ({
  lampOn: true,
  toggleLamp: () => set((s) => ({ lampOn: !s.lampOn })),
}))

export function Lighting() {
  const dirLampRef  = useRef<THREE.DirectionalLight>(null!)
  const lampPtRef   = useRef<THREE.PointLight>(null!)
  const rimRef      = useRef<THREE.PointLight>(null!)
  const lampOn = useLampStore((s) => s.lampOn)

  useEffect(() => {
    if (dirLampRef.current)  dirLampRef.current.visible  = lampOn
    if (lampPtRef.current)   lampPtRef.current.intensity = lampOn ? 4.5 : 0.6
  }, [lampOn])

  return (
    <>
      {/* Sky/ground hemisphere — fills everything so nothing is crushed black */}
      <hemisphereLight args={['#8ab4f8', '#3d2c24', 1.1]} />

      {/* Cool ambient fill — evenly visible across all surfaces */}
      <ambientLight intensity={0.65} color="#dbeafe" />

      {/* ── Warm desk lamp — SHADOW CASTER (only one) ─────────────── */}
      {/* Directional component for sharp desk surface shadows */}
      <directionalLight
        ref={dirLampRef}
        color="#ffb74d"
        intensity={1.8}
        position={[2.4 + 1.0, 4.2, 0.4]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={22}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0005}
      />
      {/* Point component for the golden pool of light on desk */}
      <pointLight
        ref={lampPtRef}
        color="#ffae42"
        intensity={4.5}
        position={[2.4 + 0.8, 2.6, -0.1]}
        distance={9}
        decay={1.6}
        castShadow={false}
      />

      {/* ── Mac screen glow — cool blue ───────────────────────────── */}
      <pointLight
        color="#4fc3f7"
        intensity={1.2}
        position={[2.4 + 0.1, 2.3, -0.6]}
        distance={3.8}
        decay={2}
        castShadow={false}
      />

      {/* ── Window/Moon rim light — cool blue back-light on avatar ── */}
      <pointLight
        ref={rimRef}
        color="#7dd3fc"
        intensity={1.4}
        position={[2.4 - 2.8, 2.8, -0.8]}
        distance={7}
        decay={1.8}
        castShadow={false}
      />

      {/* ── Moonlight through window ──────────────────────────────── */}
      <pointLight
        color="#6ea8fe"
        intensity={0.8}
        position={[2.4 - 2.5, 2.4, -1.2]}
        distance={8}
        decay={2}
        castShadow={false}
      />
    </>
  )
}
