import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// NightWindow — Exact match to Reference Image:
// - Clean white/slate 4-pane recessed window frame with thin mullions
// - Horizontal metallic curtain rod with spherical finials (properly rotated)
// - Softly pleated beige-grey curtains (#b8b5c0) pulled open to the sides
// - High-transparency clear window glass
// - Contained vibrant night cityscape behind the glass:
//     * Deep midnight blue sky
//     * Glowing luminous round full moon in the upper-right pane with soft halo
//     * Twinkling starry sky
//     * Layered skyscrapers with warm golden and cool cyan illuminated windows
//     * Blinking red aviation warning beacons & architectural roof spires
//     * Strictly contained so no buildings float into the void!
// ─────────────────────────────────────────────────────────────────────────────

const MULLION_COLOR = '#f1f5f9' // Crisp white/cream mullions
const FRAME_COLOR   = '#1e2638' // Architectural slate frame
const SILL_COLOR    = '#334155' // Window sill
const CURTAIN_COLOR = '#b8b5c0' // Soft beige-grey curtain cloth

function DrapedCurtain({ side, height }: { side: 'left' | 'right'; height: number }) {
  const isLeft = side === 'left'
  const sign = isLeft ? -1 : 1

  // Pleat folds along the window edge
  const folds = useMemo(() => [
    { dx: -0.14, r: 0.038, z: 0.05 },
    { dx: -0.07, r: 0.044, z: 0.08 },
    { dx:  0.00, r: 0.046, z: 0.05 },
    { dx:  0.07, r: 0.044, z: 0.08 },
    { dx:  0.14, r: 0.038, z: 0.05 },
  ], [])

  return (
    <group position={[sign * 1.05, 0, 0.08]}>
      {/* Pleated vertical fabric columns */}
      {folds.map((f, i) => (
        <mesh key={i} position={[f.dx, 0, f.z]} castShadow receiveShadow>
          <capsuleGeometry args={[f.r, height - f.r * 2, 8, 16]} />
          <meshStandardMaterial
            color={CURTAIN_COLOR}
            roughness={0.92}
            metalness={0.04}
          />
        </mesh>
      ))}

      {/* Main curtain backing drape */}
      <mesh position={[0, 0, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.38, height, 0.035]} />
        <meshStandardMaterial color={CURTAIN_COLOR} roughness={0.95} />
      </mesh>

      {/* Tie-back brass accent ring */}
      <mesh position={[-sign * 0.06, -height * 0.16, 0.07]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.042, 0.009, 8, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.75} roughness={0.25} />
      </mesh>
    </group>
  )
}

function ContainedNightCityscape() {
  const beaconRef = useRef<THREE.MeshStandardMaterial>(null!)

  useFrame(({ clock }) => {
    if (beaconRef.current) {
      beaconRef.current.emissiveIntensity = Math.sin(clock.getElapsedTime() * 4) > 0.2 ? 3.0 : 0.2
    }
  })

  // Multiple layers of city skyscrapers strictly behind the window glass
  const towers = useMemo(() => [
    // Far background skyline
    { x: -0.75, h: 2.8, w: 0.36, d: 0.35, z: -2.8, col: '#0d1527' },
    { x: -0.35, h: 3.5, w: 0.44, d: 0.40, z: -3.0, col: '#0a1020', antenna: true },
    { x:  0.10, h: 2.7, w: 0.38, d: 0.35, z: -2.7, col: '#0f172a' },
    { x:  0.58, h: 3.9, w: 0.46, d: 0.42, z: -3.2, col: '#080d1a', spire: true },
    { x:  0.92, h: 3.0, w: 0.40, d: 0.36, z: -2.9, col: '#0d1527' },

    // Midground skyscrapers
    { x: -0.60, h: 2.0, w: 0.34, d: 0.32, z: -2.1, col: '#131d33' },
    { x: -0.15, h: 2.3, w: 0.38, d: 0.35, z: -2.2, col: '#16223b' },
    { x:  0.32, h: 2.1, w: 0.35, d: 0.32, z: -2.0, col: '#141e35' },
    { x:  0.75, h: 2.4, w: 0.40, d: 0.34, z: -2.3, col: '#17243e' },

    // Foreground architectural blocks
    { x: -0.42, h: 1.4, w: 0.32, d: 0.30, z: -1.5, col: '#1e293b' },
    { x:  0.48, h: 1.5, w: 0.36, d: 0.30, z: -1.6, col: '#1e293b' },
  ], [])

  return (
    <group position={[0, 0, -0.2]}>
      {/* ── Deep Midnight Blue Sky Backdrop ── */}
      <mesh position={[0, 0.4, -3.8]}>
        <planeGeometry args={[5.2, 4.4]} />
        <meshBasicMaterial color="#030714" />
      </mesh>

      {/* ── Soft Gradient Sky Glow behind the Skyline ── */}
      <mesh position={[0, -0.2, -3.6]}>
        <planeGeometry args={[5.0, 2.5]} />
        <meshBasicMaterial color="#0c1a36" transparent opacity={0.65} />
      </mesh>

      {/* ── Glowing Luminous Full Moon in Upper-Right Pane (Exact Match) ── */}
      <group position={[0.46, 0.55, -2.5]}>
        {/* Crisp glowing moon disc */}
        <mesh>
          <sphereGeometry args={[0.20, 32, 24]} />
          <meshBasicMaterial color="#fef9c3" />
        </mesh>
        {/* Soft atmospheric lunar glow aura */}
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.42, 32]} />
          <meshBasicMaterial
            color="#93c5fd"
            transparent
            opacity={0.25}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <circleGeometry args={[0.70, 32]} />
          <meshBasicMaterial
            color="#60a5fa"
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ── Twinkling Stars in Night Sky ── */}
      {useMemo(() => (
        Array.from({ length: 60 }).map((_, i) => {
          const sx = -1.5 + (i % 10) * 0.32 + Math.sin(i * 13) * 0.08
          const sy = 0.15 + Math.floor(i / 10) * 0.26 + Math.cos(i * 7) * 0.07
          const sz = -3.4 + Math.sin(i * 5) * 0.15
          const size = 0.009 + (i % 3) * 0.005
          const bright = (i % 4 === 0) ? '#e0f2fe' : '#ffffff'
          return (
            <mesh key={i} position={[sx, sy, sz]}>
              <sphereGeometry args={[size, 6, 6]} />
              <meshBasicMaterial color={bright} />
            </mesh>
          )
        })
      ), [])}

      {/* ── Layered 3D Skyscrapers with Illuminated Windows ── */}
      {towers.map((b, i) => (
        <group key={i} position={[b.x, -1.0 + b.h / 2, b.z]}>
          {/* Main building block */}
          <mesh>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={b.col} roughness={0.85} metalness={0.2} />
          </mesh>

          {/* Roof spire */}
          {b.spire && (
            <mesh position={[0, b.h / 2 + 0.32, 0]}>
              <coneGeometry args={[0.028, 0.65, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
          )}

          {/* Roof antenna with blinking red beacon */}
          {b.antenna && (
            <group position={[0, b.h / 2 + 0.22, 0]}>
              <mesh>
                <cylinderGeometry args={[0.006, 0.006, 0.44, 6]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
              <mesh position={[0, 0.22, 0]}>
                <sphereGeometry args={[0.022, 10, 8]} />
                <meshStandardMaterial
                  ref={beaconRef}
                  color="#ef4444"
                  emissive="#ef4444"
                  emissiveIntensity={3.0}
                />
              </mesh>
            </group>
          )}

          {/* Glowing Windows (warm amber & cool cyan lit apartments) */}
          {Array.from({ length: Math.floor(b.h * 4) }).map((_, wi) => {
            const isWarm = (wi * 5 + i * 7) % 3 !== 0
            const wx = ((wi % 3) - 1) * (b.w * 0.28)
            const wy = -b.h / 2 + 0.18 + wi * 0.20
            if (wy > b.h / 2 - 0.16) return null
            return (
              <mesh key={wi} position={[wx, wy, b.d / 2 + 0.005]}>
                <boxGeometry args={[0.048, 0.072, 0.004]} />
                <meshBasicMaterial
                  color={isWarm ? '#fbbf24' : '#67e8f9'}
                />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* Recessed Exterior Light Enclosure (Prevents leakage into empty space) */}
      <mesh position={[0, 1.85, -1.8]}>
        <boxGeometry args={[2.8, 0.1, 4.0]} />
        <meshBasicMaterial color="#02040a" />
      </mesh>
      <mesh position={[0, -1.35, -1.8]}>
        <boxGeometry args={[2.8, 0.1, 4.0]} />
        <meshBasicMaterial color="#02040a" />
      </mesh>
      <mesh position={[-1.4, 0.25, -1.8]}>
        <boxGeometry args={[0.1, 3.4, 4.0]} />
        <meshBasicMaterial color="#02040a" />
      </mesh>
      <mesh position={[1.4, 0.25, -1.8]}>
        <boxGeometry args={[0.1, 3.4, 4.0]} />
        <meshBasicMaterial color="#02040a" />
      </mesh>
    </group>
  )
}

export function NightWindow() {
  const WW = 2.05  // Window width
  const WH = 2.15  // Window height
  const MT = 0.042 // Mullion thickness
  const FT = 0.065 // Frame thickness

  return (
    // Mounted on Back-Right Wall (centered at x = 0.425, z = -2.18)
    <group position={[0.425, 1.85, -2.18]}>
      {/* ── Horizontal Metallic Curtain Rod with Spherical Finials (FIXED ROTATION) ── */}
      <mesh position={[0, WH / 2 + 0.12, 0.13]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, WW + 0.8, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Spherical finials on rod ends */}
      {[-WW / 2 - 0.38, WW / 2 + 0.38].map((fx, i) => (
        <mesh key={i} position={[fx, WH / 2 + 0.12, 0.13]}>
          <sphereGeometry args={[0.032, 16, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.18} />
        </mesh>
      ))}

      {/* ── Softly Pleated Beige-Grey Curtains Pulled Open (#b8b5c0) ── */}
      <DrapedCurtain side="left" height={WH + 0.12} />
      <DrapedCurtain side="right" height={WH + 0.12} />

      {/* ── 4-Piece Window Frame Casing (Open Center, NO solid blocking box!) ── */}
      {/* Top frame */}
      <mesh position={[0, WH / 2 + FT / 2, 0.03]}>
        <boxGeometry args={[WW + FT * 2, FT, 0.10]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.5} />
      </mesh>
      {/* Bottom frame */}
      <mesh position={[0, -WH / 2 - FT / 2, 0.03]}>
        <boxGeometry args={[WW + FT * 2, FT, 0.10]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.5} />
      </mesh>
      {/* Left frame */}
      <mesh position={[-WW / 2 - FT / 2, 0, 0.03]}>
        <boxGeometry args={[FT, WH, 0.10]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.5} />
      </mesh>
      {/* Right frame */}
      <mesh position={[WW / 2 + FT / 2, 0, 0.03]}>
        <boxGeometry args={[FT, WH, 0.10]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.5} />
      </mesh>

      {/* ── Clean White 4-Pane Mullions (Cross Divider) ── */}
      {/* White vertical center mullion */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[MT, WH, 0.06]} />
        <meshStandardMaterial color={MULLION_COLOR} roughness={0.25} />
      </mesh>
      {/* White horizontal transom divider */}
      <mesh position={[0, 0.12, 0.04]}>
        <boxGeometry args={[WW, MT, 0.06]} />
        <meshStandardMaterial color={MULLION_COLOR} roughness={0.25} />
      </mesh>

      {/* ── Crystal Clear Window Glass ── */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[WW, WH]} />
        <meshStandardMaterial
          color="#dbeafe"
          transparent
          opacity={0.08}
          roughness={0.04}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Window Sill ── */}
      <mesh position={[0, -WH / 2 - FT - 0.02, 0.10]} receiveShadow>
        <boxGeometry args={[WW + FT * 2 + 0.18, 0.046, 0.22]} />
        <meshStandardMaterial color={SILL_COLOR} roughness={0.65} />
      </mesh>

      {/* ── 3D Night Skyline & Moon (Visible with 100% Clarity through Glass) ── */}
      <ContainedNightCityscape />
    </group>
  )
}
