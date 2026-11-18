import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useLampStore } from './lampStore'

// ─────────────────────────────────────────────────────────────────────────────
// Lighting — Balanced Atmospheric Lighting Setup:
// - ONLY ONE dynamic shadow-casting light (the articulated warm yellow desk lamp)
//   for silky 60 FPS performance.
// - Soft moonlight directional light streaming through the window, providing a
//   crisp cool-blue rim highlight on Rutvik's hair, glasses, and brown hoodie.
// - Soft cyan monitor glow illuminating the keyboard and front of the hoodie.
// - Balanced ambient and hemisphere lights ensuring no dark crushed blacks.
// ─────────────────────────────────────────────────────────────────────────────

export function Lighting() {
  const lampPtRef = useRef<THREE.PointLight>(null!)
  const lampOn = useLampStore((s) => s.lampOn)

  useEffect(() => {
    if (lampPtRef.current) {
      lampPtRef.current.intensity = lampOn ? 5.8 : 0.4
    }
  }, [lampOn])

  // Exact world coordinates of the articulated desk lamp bulb:
  // Room offset: [2.1, -0.6, 0]
  // Workstation group: [-0.40, 0.50, -0.10], rotation: [0, -Math.PI / 2 + 0.12, 0]
  // Bulb position in world space: [0.74, 0.42, -0.35]
  const lampBulbPos: [number, number, number] = [0.74, 0.42, -0.35]

  // Monitor glow in front of the screens:
  const monitorGlowPos: [number, number, number] = [0.65, 0.45, -0.05]

  return (
    <>
      {/* ── Balanced Ambient & Hemisphere Lighting ── */}
      <ambientLight intensity={0.65} color="#cbd5e1" />
      <hemisphereLight args={['#93c5fd', '#452c1e', 1.05]} />

      {/* ── Hero Warm Yellow Desk Lamp Key Light (ONLY shadow-casting light) ── */}
      <pointLight
        ref={lampPtRef}
        position={lampBulbPos}
        color="#ffaa3b"
        intensity={5.8}
        distance={8.5}
        decay={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* ── Window Moonlight Directional Light (Crisp rim light on hair & shoulders) ── */}
      <directionalLight
        position={[4.8, 4.2, -4.5]}
        color="#818cf8"
        intensity={1.8}
        castShadow={false}
      />

      {/* ── Monitor Displays Screen Glow ── */}
      <pointLight
        position={monitorGlowPos}
        color="#22d3ee"
        intensity={1.6}
        distance={4.0}
        decay={2}
        castShadow={false}
      />

      {/* ── Soft Fill Light for Bookshelf / Left Wall ── */}
      <pointLight
        position={[0.5, 1.8, -0.5]}
        color="#93c5fd"
        intensity={0.65}
        distance={5}
        decay={2}
        castShadow={false}
      />
    </>
  )
}
