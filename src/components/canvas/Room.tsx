import { useMemo } from 'react'
import * as THREE from 'three'
import { NightWindow } from './NightWindow'
import { DeveloperAvatar } from './DeveloperAvatar'
import { ArticulatedDeskLamp } from './DeskSetup'

// ─────────────────────────────────────────────────────────────────────────────
// Room — Exact match to Image 5 Reference:
// - Crisp, open-top 2-wall isometric corner room cutaway (NO roof/ceiling)
// - Thick beveled dark-slate exterior base slab (#182030)
// - Warm oak wood plank floor (#683e22) + navy-purple woven rug (#241e3a)
// - Matte slate-navy interior walls (#262f44) with wooden baseboards (#4a2c1a)
// - Back-Right Wall has an architectural cutout for the 4-pane window showing
//   the 3D night skyline and full moon with zero obstruction!
// - Back-Left Wall: Floating wooden shelves with books, succulents, router,
//   and hanging dark catenary cables (TubeGeometry curves).
// - Center: DeveloperAvatar (procedural Rutvik, desk, monitors, keyboard, chair)
//   plus the ArticulatedDeskLamp on the desk casting the warm golden light.
// ─────────────────────────────────────────────────────────────────────────────

const SLATE_BASE      = '#182030'
const OAK_FLOOR       = '#683e22'
const OAK_PLANK_ALT   = '#5c361e'
const RUG_COLOR       = '#241e3a'
const RUG_BORDER      = '#31284d'
const SLATE_NAVY_WALL = '#262f44'
const WOOD_BASEBOARD  = '#4a2c1a'

function BaseSlabAndFloor() {
  const planks = useMemo(() =>
    Array.from({ length: 11 }).map((_, i) => ({
      z: -1.85 + i * 0.37,
      color: i % 2 === 0 ? OAK_FLOOR : OAK_PLANK_ALT,
    }))
  , [])

  return (
    <group>
      {/* ── Thick Beveled Dark-Slate Exterior Base Slab ── */}
      <mesh position={[0, -0.10, 0]} receiveShadow>
        <boxGeometry args={[4.28, 0.20, 4.28]} />
        <meshStandardMaterial color={SLATE_BASE} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Lower beveled lip */}
      <mesh position={[0, -0.21, 0]}>
        <boxGeometry args={[4.44, 0.04, 4.44]} />
        <meshStandardMaterial color="#0c1017" roughness={0.8} />
      </mesh>

      {/* ── Warm Oak Wood Plank Floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[4.20, 4.20]} />
        <meshStandardMaterial color={OAK_FLOOR} roughness={0.72} />
      </mesh>
      {/* Oak Plank Seams */}
      {planks.map((p, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, p.z]} receiveShadow>
          <planeGeometry args={[4.16, 0.34]} />
          <meshStandardMaterial color={p.color} roughness={0.75} />
        </mesh>
      ))}

      {/* ── Deep Navy-Purple Woven Rug Under Desk & Chair (Image 5) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.75, 0.005, -0.10]} receiveShadow>
        <planeGeometry args={[2.1, 2.4]} />
        <meshStandardMaterial color={RUG_COLOR} roughness={0.96} />
      </mesh>
      {/* Rug border trim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.75, 0.006, -0.10]}>
        <planeGeometry args={[1.98, 2.28]} />
        <meshStandardMaterial color={RUG_BORDER} roughness={0.96} />
      </mesh>
    </group>
  )
}

function ArchitecturalWalls() {
  return (
    <group>
      {/* ── Back-Left Interior Wall (Solid Wall with Shelves) ── */}
      <mesh position={[-2.17, 1.70, 0]} receiveShadow>
        <boxGeometry args={[0.14, 3.40, 4.20]} />
        <meshStandardMaterial color={SLATE_NAVY_WALL} roughness={0.90} />
      </mesh>
      {/* Back-Left Wall Baseboard */}
      <mesh position={[-2.08, 0.05, 0]}>
        <boxGeometry args={[0.04, 0.10, 4.20]} />
        <meshStandardMaterial color={WOOD_BASEBOARD} roughness={0.65} />
      </mesh>

      {/* ── Back-Right Wall: Left of Window Section (from x = -2.10 to -0.70) ── */}
      <mesh position={[-1.40, 1.70, -2.17]} receiveShadow>
        <boxGeometry args={[1.40, 3.40, 0.14]} />
        <meshStandardMaterial color={SLATE_NAVY_WALL} roughness={0.90} />
      </mesh>
      <mesh position={[-1.40, 0.05, -2.08]}>
        <boxGeometry args={[1.40, 0.10, 0.04]} />
        <meshStandardMaterial color={WOOD_BASEBOARD} roughness={0.65} />
      </mesh>

      {/* ── Back-Right Wall: Right of Window Section (from x = +1.55 to +2.10) ── */}
      <mesh position={[1.825, 1.70, -2.17]} receiveShadow>
        <boxGeometry args={[0.55, 3.40, 0.14]} />
        <meshStandardMaterial color={SLATE_NAVY_WALL} roughness={0.90} />
      </mesh>
      <mesh position={[1.825, 0.05, -2.08]}>
        <boxGeometry args={[0.55, 0.10, 0.04]} />
        <meshStandardMaterial color={WOOD_BASEBOARD} roughness={0.65} />
      </mesh>

      {/* ── Back-Right Wall: Bottom Apron Under Window Sill (y = 0 to 0.78) ── */}
      <mesh position={[0.425, 0.39, -2.17]} receiveShadow>
        <boxGeometry args={[2.25, 0.78, 0.14]} />
        <meshStandardMaterial color={SLATE_NAVY_WALL} roughness={0.90} />
      </mesh>
      <mesh position={[0.425, 0.05, -2.08]}>
        <boxGeometry args={[2.25, 0.10, 0.04]} />
        <meshStandardMaterial color={WOOD_BASEBOARD} roughness={0.65} />
      </mesh>

      {/* ── Back-Right Wall: Top Header Above Window (y = 3.13 to 3.40) ── */}
      <mesh position={[0.425, 3.265, -2.17]} receiveShadow>
        <boxGeometry args={[2.25, 0.27, 0.14]} />
        <meshStandardMaterial color={SLATE_NAVY_WALL} roughness={0.90} />
      </mesh>
    </group>
  )
}

function FloatingShelvesWithCables() {
  const booksUpper = useMemo(() => [
    { w: 0.075, h: 0.22, col: '#ef4444' },
    { w: 0.065, h: 0.19, col: '#3b82f6' },
    { w: 0.082, h: 0.24, col: '#10b981' },
    { w: 0.068, h: 0.20, col: '#f59e0b' },
    { w: 0.078, h: 0.23, col: '#8b5cf6' },
  ], [])

  const booksLower = useMemo(() => [
    { w: 0.072, h: 0.21, col: '#06b6d4' },
    { w: 0.084, h: 0.25, col: '#ec4899' },
    { w: 0.066, h: 0.19, col: '#6366f1' },
    { w: 0.076, h: 0.22, col: '#14b8a6' },
  ], [])

  const cableGeometries = useMemo(() => {
    const cables: THREE.TubeGeometry[] = []
    const cableCurves = [
      [[-0.32, -0.02, 0.08], [-0.28, -0.22, 0.09], [-0.24, -0.34, 0.1], [-0.2, -0.18, 0.09], [-0.16, -0.02, 0.08]],
      [[-0.18, -0.02, 0.07], [-0.14, -0.28, 0.09], [-0.08, -0.42, 0.1], [-0.02, -0.26, 0.09], [0.04, -0.02, 0.08]],
      [[0.02, -0.02, 0.08], [0.08, -0.24, 0.09], [0.14, -0.36, 0.1], [0.20, -0.20, 0.09], [0.24, -0.02, 0.08]],
      [[0.22, -0.02, 0.07], [0.24, -0.32, 0.08], [0.26, -0.65, 0.07], [0.27, -0.98, 0.06]],
    ]

    cableCurves.forEach((pts) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)))
      cables.push(new THREE.TubeGeometry(curve, 20, 0.007, 8, false))
    })
    return cables
  }, [])

  return (
    <group position={[-2.06, 2.25, -0.75]} rotation={[0, Math.PI / 2, 0]}>
      {/* Upper Floating Shelf */}
      <group position={[0, 0.52, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.032, 0.22]} />
          <meshStandardMaterial color="#683e22" roughness={0.7} />
        </mesh>
        {booksUpper.reduce((acc, b, i) => {
          const prev = acc[i - 1]
          const x = prev ? prev.x + prev.w / 2 + b.w / 2 + 0.012 : -0.38
          acc.push({ ...b, x })
          return acc
        }, [] as Array<{ x: number; w: number; h: number; col: string }>).map((b, i) => (
          <mesh key={i} position={[b.x, 0.032 + b.h / 2, 0]} castShadow>
            <boxGeometry args={[b.w, b.h, 0.18]} />
            <meshStandardMaterial color={b.col} roughness={0.8} />
          </mesh>
        ))}
        <group position={[0.34, 0.032, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.035, 0.065, 14]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.038, 10, 8]} />
            <meshStandardMaterial color="#16a34a" roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* Lower Floating Shelf */}
      <group position={[0, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.032, 0.22]} />
          <meshStandardMaterial color="#683e22" roughness={0.7} />
        </mesh>
        {booksLower.reduce((acc, b, i) => {
          const prev = acc[i - 1]
          const x = prev ? prev.x + prev.w / 2 + b.w / 2 + 0.012 : -0.38
          acc.push({ ...b, x })
          return acc
        }, [] as Array<{ x: number; w: number; h: number; col: string }>).map((b, i) => (
          <mesh key={i} position={[b.x, 0.032 + b.h / 2, 0]} castShadow>
            <boxGeometry args={[b.w, b.h, 0.18]} />
            <meshStandardMaterial color={b.col} roughness={0.8} />
          </mesh>
        ))}
        <group position={[0.32, 0.05, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.065, 0.15]} />
            <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.6} />
          </mesh>
          <mesh position={[0.06, 0.012, 0.076]}>
            <boxGeometry args={[0.012, 0.012, 0.002]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.03, 0.012, 0.076]}>
            <boxGeometry args={[0.012, 0.012, 0.002]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
          </mesh>
        </group>

        {cableGeometries.map((geo, i) => (
          <mesh key={i} geometry={geo} castShadow>
            <meshStandardMaterial color="#0a0e17" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function Room() {
  return (
    <group>
      {/* ── BASE SLAB & FLOOR ── */}
      <BaseSlabAndFloor />

      {/* ── MATTE SLATE-NAVY WALLS (With Architectural Window Opening) ── */}
      <ArchitecturalWalls />

      {/* ── BACK-LEFT WALL DETAILS (Shelves, Books, Succulents, Router, Hanging Cables) ── */}
      <FloatingShelvesWithCables />

      {/* ── BACK-RIGHT WALL (4-Pane Window, Curtains, Contained Night Metropolis) ── */}
      <NightWindow />

      {/* ── WORKSTATION & DEVELOPER (Seamlessly Integrated Procedural Setup) ── */}
      <group position={[-0.40, 0.50, -0.10]} rotation={[0, -Math.PI / 2 + 0.12, 0]}>
        <DeveloperAvatar standalone={false} />
        {/* Articulated Brass Desk Lamp placed on the desk beside DeveloperAvatar */}
        <ArticulatedDeskLamp position={[-0.65, 0.105, 0.82]} rotation={[0, Math.PI * 0.95, 0]} />
      </group>
    </group>
  )
}
