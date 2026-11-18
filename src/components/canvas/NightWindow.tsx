import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// NightWindow — Large Loft Window with Clear Glass, Open Curtains,
// and a Vibrant 3D Night Skyline with Lit Windows, Moon & Stars Outside.
// ─────────────────────────────────────────────────────────────────────────────

const FRAME_COLOR = '#1f222e'
const SILL_COLOR  = '#181a24'
const CURTAIN_COL = '#3b2245' // Deep elegant plum velvet

function WindowGlass({ w, h }: { w: number; h: number }) {
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[w - 0.06, h - 0.06]} />
      {/* Crystal-clear transparent architectural glass */}
      <meshPhysicalMaterial
        color="#ffffff"
        transparent
        opacity={0.05}
        roughness={0.02}
        metalness={0.1}
        transmission={0.96}
        reflectivity={0.25}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function DrapedCurtain({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left'
  const sign = isLeft ? -1 : 1
  return (
    <group position={[sign * 1.18, 0, 0.08]}>
      {/* Main curtain body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.38, 2.5, 0.08]} />
        <meshStandardMaterial color={CURTAIN_COL} roughness={0.96} />
      </mesh>
      {/* 3 Pleat ridges for authentic draped fabric look */}
      {[-0.1, 0, 0.1].map((dx, i) => (
        <mesh key={i} position={[dx, 0, 0.045]} castShadow>
          <cylinderGeometry args={[0.022, 0.024, 2.48, 8]} />
          <meshStandardMaterial color={new THREE.Color(CURTAIN_COL).multiplyScalar(0.85)} roughness={0.98} />
        </mesh>
      ))}
      {/* Gathered tie-back waist */}
      <mesh position={[-sign * 0.04, -0.15, 0.04]}>
        <boxGeometry args={[0.035, 0.06, 0.11]} />
        <meshStandardMaterial color="#c59f27" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function CitySkylineView() {
  const blinkRef = useRef<THREE.MeshStandardMaterial>(null!)

  useFrame(({ clock }) => {
    if (blinkRef.current) {
      // Aircraft warning light on skyscraper antenna
      blinkRef.current.emissiveIntensity = Math.sin(clock.getElapsedTime() * 4.0) > 0.4 ? 2.5 : 0.1
    }
  })

  // Procedural skyscraper data with lit windows
  const buildings = useMemo(() => [
    // Background layer
    { x: -1.8, y: -0.2, z: -3.8, w: 0.55, h: 3.2, d: 0.55, col: '#0d1322' },
    { x: -1.1, y: -0.1, z: -4.2, w: 0.65, h: 4.1, d: 0.65, col: '#090e1a', antenna: true },
    { x: -0.3, y: -0.4, z: -3.6, w: 0.52, h: 2.8, d: 0.52, col: '#111827' },
    { x:  0.4, y:  0.1, z: -4.0, w: 0.72, h: 4.4, d: 0.7,  col: '#0a101d', spire: true },
    { x:  1.2, y: -0.3, z: -3.5, w: 0.58, h: 3.0, d: 0.58, col: '#0e1526' },
    { x:  1.9, y: -0.1, z: -3.9, w: 0.62, h: 3.8, d: 0.62, col: '#0c1220', antenna: true },

    // Midground layer
    { x: -1.5, y: -0.8, z: -2.8, w: 0.48, h: 2.2, d: 0.48, col: '#131c31' },
    { x: -0.7, y: -0.7, z: -2.6, w: 0.54, h: 2.4, d: 0.54, col: '#151e33' },
    { x:  0.1, y: -0.9, z: -2.7, w: 0.46, h: 2.0, d: 0.46, col: '#131b2e' },
    { x:  0.8, y: -0.6, z: -2.5, w: 0.52, h: 2.6, d: 0.52, col: '#17223b' },
    { x:  1.6, y: -0.8, z: -2.9, w: 0.5,  h: 2.3, d: 0.5,  col: '#141d32' },
  ], [])

  return (
    <group position={[0, 0, -0.6]}>
      {/* ── Deep Midnight Sky ── */}
      <mesh position={[0, 1.2, -5.5]}>
        <planeGeometry args={[8.5, 6.5]} />
        <meshStandardMaterial color="#040612" roughness={1} />
      </mesh>

      {/* ── Luminous Glowing Moon ── */}
      <mesh position={[0.7, 2.5, -4.8]}>
        <sphereGeometry args={[0.32, 24, 20]} />
        <meshStandardMaterial
          color="#fffde7"
          emissive="#fef08a"
          emissiveIntensity={1.4}
          roughness={0.9}
        />
      </mesh>
      {/* Soft Moon Halo */}
      <mesh position={[0.7, 2.5, -4.75]}>
        <sphereGeometry args={[0.48, 16, 12]} />
        <meshStandardMaterial color="#93c5fd" transparent opacity={0.12} roughness={1} />
      </mesh>
      <pointLight color="#7dd3fc" intensity={1.8} position={[0.7, 2.5, -4.6]} distance={10} decay={2} />

      {/* ── Twinkling Stars Framed in Window Sky ── */}
      {useMemo(() => (
        Array.from({ length: 70 }).map((_, i) => {
          const sx = -2.2 + (i % 10) * 0.45 + (Math.sin(i * 13) * 0.15)
          const sy = 0.8 + Math.floor(i / 10) * 0.32 + (Math.cos(i * 7) * 0.1)
          const sz = -5.0 + Math.sin(i * 5) * 0.3
          const size = 0.012 + (i % 3) * 0.007
          return (
            <mesh key={i} position={[sx, sy, sz]}>
              <sphereGeometry args={[size, 4, 4]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.2} />
            </mesh>
          )
        })
      ), [])}

      {/* ── 3D Skyscrapers with Lit Windows ── */}
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, b.y, b.z]}>
          {/* Main Tower Box */}
          <mesh castShadow={false}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={b.col} roughness={0.85} />
          </mesh>

          {/* Roof Spire / Antenna if present */}
          {b.spire && (
            <mesh position={[0, b.h / 2 + 0.45, 0]}>
              <coneGeometry args={[0.04, 0.9, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
            </mesh>
          )}
          {b.antenna && (
            <group position={[0, b.h / 2 + 0.3, 0]}>
              <mesh>
                <cylinderGeometry args={[0.008, 0.008, 0.6, 6]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
              {/* Blinking Red Aviation Beacon */}
              <mesh position={[0, 0.3, 0]}>
                <sphereGeometry args={[0.02, 8, 6]} />
                <meshStandardMaterial
                  ref={i === 1 ? blinkRef : undefined}
                  color="#ef4444"
                  emissive="#ef4444"
                  emissiveIntensity={2.5}
                />
              </mesh>
            </group>
          )}

          {/* Lit Window Grids on Front Facade */}
          {Array.from({ length: Math.floor(b.h * 3.8) }).map((_, wi) => {
            const isWarm = (wi * 7 + i * 3) % 5 !== 0
            const wx = ((wi % 3) - 1) * (b.w * 0.28)
            const wy = -b.h / 2 + 0.2 + wi * 0.24
            if (wy > b.h / 2 - 0.2) return null
            return (
              <mesh key={wi} position={[wx, wy, b.d / 2 + 0.006]}>
                <boxGeometry args={[0.065, 0.09, 0.004]} />
                <meshStandardMaterial
                  color={isWarm ? '#ffc107' : '#38bdf8'}
                  emissive={isWarm ? '#f59e0b' : '#0284c7'}
                  emissiveIntensity={1.8}
                />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

export function NightWindow() {
  // Wide modern architectural loft window on the back wall
  const WW = 2.4   // Wide window
  const WH = 2.4   // Tall window
  const FT = 0.065 // Frame thickness

  return (
    <group position={[-0.4, 2.0, -2.54]}>
      {/* ── Metallic Curtain Rod ── */}
      <mesh position={[0, WH / 2 + 0.16, 0.14]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.018, 0.018, WW + 0.9, 12]} />
        <meshStandardMaterial color="#c59f27" metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Rod finials */}
      {[-WW / 2 - 0.42, WW / 2 + 0.42].map((fx, i) => (
        <mesh key={i} position={[fx, WH / 2 + 0.16, 0.14]}>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* ── Draped Velvet Curtains (Pulled Open) ── */}
      <DrapedCurtain side="left" />
      <DrapedCurtain side="right" />

      {/* ── Outer Window Frame Border ── */}
      {/* Top frame */}
      <mesh position={[0, WH / 2, 0]}>
        <boxGeometry args={[WW + FT * 2, FT, FT * 1.5]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Bottom frame */}
      <mesh position={[0, -WH / 2, 0]}>
        <boxGeometry args={[WW + FT * 2, FT, FT * 1.5]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Left post */}
      <mesh position={[-WW / 2 - FT / 2, 0, 0]}>
        <boxGeometry args={[FT, WH + FT, FT * 1.5]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Right post */}
      <mesh position={[WW / 2 + FT / 2, 0, 0]}>
        <boxGeometry args={[FT, WH + FT, FT * 1.5]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ── Thin Modern Mullions (4-Pane Grid) ── */}
      {/* Center vertical mullion */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[FT * 0.55, WH, FT * 0.7]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Center horizontal transom */}
      <mesh position={[0, WH * 0.12, 0]}>
        <boxGeometry args={[WW, FT * 0.55, FT * 0.7]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ── Crystal Clear Window Glass Panes ── */}
      <WindowGlass w={WW} h={WH} />

      {/* ── Window Sill ── */}
      <mesh position={[0, -WH / 2 - 0.035, 0.1]} receiveShadow>
        <boxGeometry args={[WW + 0.28, 0.05, 0.26]} />
        <meshStandardMaterial color={SILL_COLOR} roughness={0.6} />
      </mesh>

      {/* ── Vibrant 3D Night City Skyline Outside the Glass ── */}
      <CitySkylineView />
    </group>
  )
}
