import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// NightWindow — Exact match to Image 5 Reference:
// - 4-pane recessed window with clean white/light mullions
// - Metallic curtain rod with finials & softly pleated beige-grey curtains (#b8b5c0)
// - Strictly contained exterior chamber: night gradient sky, round full moon
//   in the upper-right pane, twinkling stars, and layered dark-blue skyscrapers
//   with warm yellow and cool white lit windows (NO floating buildings).
// ─────────────────────────────────────────────────────────────────────────────

const MULLION_COLOR = '#e2e8f0' // Clean white/light mullions from Image 5
const FRAME_COLOR   = '#1e293b' // Deep slate casing
const SILL_COLOR    = '#334155'
const CURTAIN_COLOR = '#b8b5c0' // Soft beige-grey curtains from Image 5

function DrapedCurtain({ side, height }: { side: 'left' | 'right'; height: number }) {
  const isLeft = side === 'left'
  const sign = isLeft ? -1 : 1

  // Generate realistic pleated wave folds using vertical capsule columns
  const folds = useMemo(() => [
    { dx: -0.12, r: 0.038, z: 0.05 },
    { dx: -0.06, r: 0.042, z: 0.07 },
    { dx:  0.00, r: 0.045, z: 0.05 },
    { dx:  0.06, r: 0.042, z: 0.07 },
    { dx:  0.12, r: 0.038, z: 0.05 },
  ], [])

  return (
    <group position={[sign * 0.98, 0, 0.08]}>
      {/* Pleat wave cylinders */}
      {folds.map((f, i) => (
        <mesh key={i} position={[f.dx, 0, f.z]} castShadow receiveShadow>
          <capsuleGeometry args={[f.r, height - f.r * 2, 8, 16]} />
          <meshStandardMaterial
            color={CURTAIN_COLOR}
            roughness={0.94}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* Main curtain backing fabric */}
      <mesh position={[0, 0, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.34, height, 0.04]} />
        <meshStandardMaterial color={CURTAIN_COLOR} roughness={0.95} />
      </mesh>

      {/* Tie-back brass accent ring */}
      <mesh position={[-sign * 0.05, -height * 0.12, 0.06]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.04, 0.008, 8, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function ContainedNightCityscape() {
  const beaconRef = useRef<THREE.MeshStandardMaterial>(null!)

  useFrame(({ clock }) => {
    if (beaconRef.current) {
      beaconRef.current.emissiveIntensity = Math.sin(clock.getElapsedTime() * 4) > 0.3 ? 2.5 : 0.2
    }
  })

  // City skyscrapers strictly bounded inside the window's viewable cone
  const towers = useMemo(() => [
    // Background layer
    { x: -0.72, h: 2.8, w: 0.34, d: 0.35, z: -2.8, col: '#0a0f1d' },
    { x: -0.32, h: 3.4, w: 0.42, d: 0.4,  z: -3.0, col: '#080d1a', antenna: true },
    { x:  0.12, h: 2.6, w: 0.36, d: 0.35, z: -2.7, col: '#0c1222' },
    { x:  0.55, h: 3.8, w: 0.44, d: 0.42, z: -3.2, col: '#070b16', spire: true },
    { x:  0.88, h: 2.9, w: 0.38, d: 0.36, z: -2.9, col: '#0a0f1e' },

    // Midground layer
    { x: -0.55, h: 1.8, w: 0.32, d: 0.32, z: -2.0, col: '#111827' },
    { x: -0.12, h: 2.1, w: 0.36, d: 0.35, z: -2.1, col: '#141d30' },
    { x:  0.34, h: 1.9, w: 0.34, d: 0.32, z: -1.9, col: '#121a2c' },
    { x:  0.72, h: 2.2, w: 0.38, d: 0.34, z: -2.2, col: '#152036' },
  ], [])

  return (
    <group position={[0, 0, -0.4]}>
      {/* ── Deep Blue Night Sky Gradient ── */}
      <mesh position={[0, 0.4, -3.8]}>
        <planeGeometry args={[4.5, 4.0]} />
        <meshStandardMaterial color="#050c1e" roughness={1} />
      </mesh>

      {/* ── Glowing Full Moon in Upper-Right Pane (Exact to Image 5) ── */}
      <group position={[0.42, 0.52, -2.6]}>
        {/* Crisp luminous moon sphere */}
        <mesh>
          <sphereGeometry args={[0.22, 24, 20]} />
          <meshStandardMaterial
            color="#fffde7"
            emissive="#fef9c3"
            emissiveIntensity={1.6}
            roughness={0.8}
          />
        </mesh>
        {/* Soft atmospheric glow halo */}
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.38, 24]} />
          <meshStandardMaterial
            color="#93c5fd"
            transparent
            opacity={0.18}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
        {/* Cool moonlight cast */}
        <pointLight color="#93c5fd" intensity={1.5} distance={6} decay={2} />
      </group>

      {/* ── Twinkling Stars in Night Sky ── */}
      {useMemo(() => (
        Array.from({ length: 45 }).map((_, i) => {
          const sx = -1.3 + (i % 8) * 0.36 + Math.sin(i * 11) * 0.1
          const sy = 0.2 + Math.floor(i / 8) * 0.28 + Math.cos(i * 7) * 0.08
          const sz = -3.4 + Math.sin(i * 3) * 0.2
          const size = 0.01 + (i % 3) * 0.006
          return (
            <mesh key={i} position={[sx, sy, sz]}>
              <sphereGeometry args={[size, 4, 4]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.4} />
            </mesh>
          )
        })
      ), [])}

      {/* ── Layered Skyscrapers with Illuminated Windows ── */}
      {towers.map((b, i) => (
        <group key={i} position={[b.x, -1.0 + b.h / 2, b.z]}>
          <mesh>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={b.col} roughness={0.85} />
          </mesh>

          {/* Roof spire or antenna */}
          {b.spire && (
            <mesh position={[0, b.h / 2 + 0.3, 0]}>
              <coneGeometry args={[0.025, 0.6, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
          )}
          {b.antenna && (
            <group position={[0, b.h / 2 + 0.2, 0]}>
              <mesh>
                <cylinderGeometry args={[0.006, 0.006, 0.4, 6]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
              <mesh position={[0, 0.2, 0]}>
                <sphereGeometry args={[0.018, 8, 6]} />
                <meshStandardMaterial
                  ref={i === 1 ? beaconRef : undefined}
                  color="#ef4444"
                  emissive="#ef4444"
                  emissiveIntensity={2.5}
                />
              </mesh>
            </group>
          )}

          {/* Windows (warm yellow & cool white lit apartments) */}
          {Array.from({ length: Math.floor(b.h * 3.4) }).map((_, wi) => {
            const isWarm = (wi * 5 + i * 7) % 4 !== 0
            const wx = ((wi % 3) - 1) * (b.w * 0.28)
            const wy = -b.h / 2 + 0.16 + wi * 0.22
            if (wy > b.h / 2 - 0.16) return null
            return (
              <mesh key={wi} position={[wx, wy, b.d / 2 + 0.004]}>
                <boxGeometry args={[0.05, 0.075, 0.003]} />
                <meshStandardMaterial
                  color={isWarm ? '#f59e0b' : '#38bdf8'}
                  emissive={isWarm ? '#fbbf24' : '#e0f2fe'}
                  emissiveIntensity={1.8}
                />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* Recessed Exterior Chamber Enclosure (Blocks all leakage) */}
      {/* Top cap */}
      <mesh position={[0, 1.8, -1.8]}>
        <boxGeometry args={[2.5, 0.1, 3.8]} />
        <meshStandardMaterial color="#02040a" />
      </mesh>
      {/* Bottom cap */}
      <mesh position={[0, -1.3, -1.8]}>
        <boxGeometry args={[2.5, 0.1, 3.8]} />
        <meshStandardMaterial color="#02040a" />
      </mesh>
      {/* Left cheek */}
      <mesh position={[-1.25, 0.25, -1.8]}>
        <boxGeometry args={[0.1, 3.2, 3.8]} />
        <meshStandardMaterial color="#02040a" />
      </mesh>
      {/* Right cheek */}
      <mesh position={[1.25, 0.25, -1.8]}>
        <boxGeometry args={[0.1, 3.2, 3.8]} />
        <meshStandardMaterial color="#02040a" />
      </mesh>
    </group>
  )
}

export function NightWindow() {
  const WW = 1.95  // Window width
  const WH = 2.1   // Window height
  const MT = 0.045 // Mullion thickness

  return (
    // Mounted on Back-Right Wall (centered at x = 0.45, z = -2.18)
    <group position={[0.45, 1.85, -2.18]}>
      {/* ── Metallic Curtain Rod with Spherical Finials ── */}
      <mesh position={[0, WH / 2 + 0.14, 0.12]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.016, 0.016, WW + 0.7, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Spherical finials */}
      {[-WW / 2 - 0.32, WW / 2 + 0.32].map((fx, i) => (
        <mesh key={i} position={[fx, WH / 2 + 0.14, 0.12]}>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* ── Softly Pleated Beige-Grey Curtains Pulled Open (#b8b5c0) ── */}
      <DrapedCurtain side="left" height={WH + 0.1} />
      <DrapedCurtain side="right" height={WH + 0.1} />

      {/* ── Clean White 4-Pane Window Frame & Mullions (Image 5) ── */}
      {/* Outer casing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[WW + 0.08, WH + 0.08, 0.08]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.4} />
      </mesh>

      {/* White vertical center mullion */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[MT, WH, 0.06]} />
        <meshStandardMaterial color={MULLION_COLOR} roughness={0.3} />
      </mesh>
      {/* White horizontal transom divider */}
      <mesh position={[0, 0.12, 0.02]}>
        <boxGeometry args={[WW, MT, 0.06]} />
        <meshStandardMaterial color={MULLION_COLOR} roughness={0.3} />
      </mesh>

      {/* ── Transparent Window Glass Panes ── */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[WW - 0.04, WH - 0.04]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.06}
          roughness={0.02}
          metalness={0.1}
          transmission={0.96}
          reflectivity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Window Sill ── */}
      <mesh position={[0, -WH / 2 - 0.028, 0.08]} receiveShadow>
        <boxGeometry args={[WW + 0.22, 0.045, 0.2]} />
        <meshStandardMaterial color={SILL_COLOR} roughness={0.6} />
      </mesh>

      {/* ── Strictly Contained 3D Night Skyline Chamber (No Floating Buildings) ── */}
      <ContainedNightCityscape />
    </group>
  )
}
