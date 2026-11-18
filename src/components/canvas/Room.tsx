import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NightWindow } from './NightWindow'
import { DeskSetup } from './DeskSetup'
import { DeveloperAvatar } from './DeveloperAvatar'

// ─────────────────────────────────────────────────────────────────────────────
// Room — Exact match to Image 5 Reference:
// - Crisp, open-top 2-wall isometric corner room cutaway (NO roof/ceiling)
// - Thick beveled dark-slate exterior base slab (#1e293b)
// - Warm oak wood plank floor (#6b442a) + navy-purple woven rug (#251e3e)
// - Thick matte slate-blue interior walls (#2c3553) with wooden baseboards
// - Back-Left Wall: 2 tiers of floating shelves with upright colorful books,
//   miniature potted green succulents, small dark router, & realistic hanging
//   dark cables (TubeGeometry catenary curves) draped beneath lower shelf.
// - Back-Right Wall: Large 4-pane recessed window with white mullions, softly
//   pleated beige-grey curtains (#b8b5c0), and strictly contained night skyline.
// ─────────────────────────────────────────────────────────────────────────────

const SLATE_BASE     = '#1e293b' // Thick beveled exterior base slab
const OAK_FLOOR      = '#6b442a' // Warm oak wood plank floor
const OAK_PLANK_ALT  = '#5e3a22'
const RUG_COLOR      = '#251e3e' // Dark navy-purple woven rug
const RUG_BORDER     = '#312752'
const SLATE_BLUE_WALL= '#2c3553' // Matte slate-blue interior walls
const WOOD_BASEBOARD = '#452b1a'

function BaseSlabAndFloor() {
  const planks = useMemo(() =>
    Array.from({ length: 11 }).map((_, i) => ({
      z: -2.0 + i * 0.42,
      color: i % 2 === 0 ? OAK_FLOOR : OAK_PLANK_ALT,
    }))
  , [])

  return (
    <group>
      {/* ── Thick Beveled Dark-Slate Exterior Base Slab (#1e293b) ── */}
      <mesh position={[0, -0.09, 0]} receiveShadow>
        <boxGeometry args={[4.8, 0.18, 4.8]} />
        <meshStandardMaterial color={SLATE_BASE} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Slab beveled lower edge */}
      <mesh position={[0, -0.19, 0]}>
        <boxGeometry args={[4.96, 0.04, 4.96]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* ── Warm Oak Wood Plank Floor (#6b442a) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[4.68, 4.68]} />
        <meshStandardMaterial color={OAK_FLOOR} roughness={0.75} />
      </mesh>
      {/* Oak Plank Seams */}
      {planks.map((p, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, p.z]} receiveShadow>
          <planeGeometry args={[4.65, 0.38]} />
          <meshStandardMaterial color={p.color} roughness={0.78} />
        </mesh>
      ))}

      {/* ── Dark Navy-Purple Woven Rug (#251e3e) Under Desk & Chair ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.7, 0.006, 0.12]} receiveShadow>
        <planeGeometry args={[2.5, 2.1]} />
        <meshStandardMaterial color={RUG_COLOR} roughness={0.96} />
      </mesh>
      {/* Rug woven border trim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.7, 0.007, 0.12]}>
        <planeGeometry args={[2.36, 1.96]} />
        <meshStandardMaterial color={RUG_BORDER} roughness={0.96} />
      </mesh>
    </group>
  )
}

function ArchitecturalWalls() {
  // Back-Left Wall: at x = -2.28 (runs along Z from -2.34 to +2.34)
  // Back-Right Wall: at z = -2.28 (runs along X from -2.34 to +2.34)
  // Corner meets seamlessly at [-2.34, Y, -2.34]
  return (
    <group>
      {/* ── Back-Left Interior Wall (#2c3553) ── */}
      <mesh position={[-2.34, 1.75, 0]} receiveShadow>
        <boxGeometry args={[0.14, 3.5, 4.68]} />
        <meshStandardMaterial color={SLATE_BLUE_WALL} roughness={0.92} />
      </mesh>
      {/* Baseboard trim */}
      <mesh position={[-2.25, 0.05, 0]}>
        <boxGeometry args={[0.04, 0.1, 4.68]} />
        <meshStandardMaterial color={WOOD_BASEBOARD} roughness={0.65} />
      </mesh>

      {/* ── Back-Right Interior Wall (#2c3553 with window cutout) ── */}
      <mesh position={[0, 1.75, -2.34]} receiveShadow>
        <boxGeometry args={[4.68, 3.5, 0.14]} />
        <meshStandardMaterial color={new THREE.Color(SLATE_BLUE_WALL).multiplyScalar(0.96)} roughness={0.92} />
      </mesh>
      {/* Baseboard trim */}
      <mesh position={[0, 0.05, -2.25]}>
        <boxGeometry args={[4.68, 0.1, 0.04]} />
        <meshStandardMaterial color={WOOD_BASEBOARD} roughness={0.65} />
      </mesh>
    </group>
  )
}

function FloatingShelvesWithCables() {
  const booksUpper = useMemo(() => [
    { w: 0.075, h: 0.22, col: '#ef4444' }, // Red
    { w: 0.065, h: 0.19, col: '#3b82f6' }, // Blue
    { w: 0.082, h: 0.24, col: '#10b981' }, // Green
    { w: 0.068, h: 0.20, col: '#f59e0b' }, // Amber
    { w: 0.078, h: 0.23, col: '#8b5cf6' }, // Purple
  ], [])

  const booksLower = useMemo(() => [
    { w: 0.072, h: 0.21, col: '#06b6d4' },
    { w: 0.084, h: 0.25, col: '#ec4899' },
    { w: 0.066, h: 0.19, col: '#6366f1' },
    { w: 0.076, h: 0.22, col: '#14b8a6' },
  ], [])

  // Realistic catenary hanging dark cables beneath lower shelf (Image 5)
  const cableGeometries = useMemo(() => {
    const cables: THREE.TubeGeometry[] = []
    const cableCurves = [
      // Cable 1: loose hanging loop
      [[-0.32, -0.02, 0.08], [-0.28, -0.22, 0.09], [-0.24, -0.34, 0.1], [-0.2, -0.18, 0.09], [-0.16, -0.02, 0.08]],
      // Cable 2: deeper hanging loop
      [[-0.18, -0.02, 0.07], [-0.14, -0.28, 0.09], [-0.08, -0.42, 0.1], [-0.02, -0.26, 0.09], [0.04, -0.02, 0.08]],
      // Cable 3: third draped loop
      [[0.02, -0.02, 0.08], [0.08, -0.24, 0.09], [0.14, -0.36, 0.1], [0.20, -0.20, 0.09], [0.24, -0.02, 0.08]],
      // Cable 4: hanging power cord running down toward floor
      [[0.22, -0.02, 0.07], [0.24, -0.32, 0.08], [0.26, -0.65, 0.07], [0.27, -0.98, 0.06]],
    ]

    cableCurves.forEach((pts) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)))
      cables.push(new THREE.TubeGeometry(curve, 20, 0.007, 8, false))
    })
    return cables
  }, [])

  return (
    // Mounted on Back-Left Wall (x = -2.24)
    <group position={[-2.24, 2.3, -0.75]} rotation={[0, Math.PI / 2, 0]}>

      {/* ── UPPER FLOATING SHELF ── */}
      <group position={[0, 0.52, 0]}>
        {/* Wood shelf board */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.032, 0.22]} />
          <meshStandardMaterial color="#6b442a" roughness={0.7} />
        </mesh>
        {/* Books on upper shelf */}
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
        {/* Miniature potted green succulent */}
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

      {/* ── LOWER FLOATING SHELF ── */}
      <group position={[0, 0, 0]}>
        {/* Wood shelf board */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.032, 0.22]} />
          <meshStandardMaterial color="#6b442a" roughness={0.7} />
        </mesh>
        {/* Books on lower shelf */}
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
        {/* Small dark router device on right */}
        <group position={[0.32, 0.05, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.065, 0.15]} />
            <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.6} />
          </mesh>
          {/* LED indicators */}
          <mesh position={[0.06, 0.012, 0.076]}>
            <boxGeometry args={[0.012, 0.012, 0.002]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.03, 0.012, 0.076]}>
            <boxGeometry args={[0.012, 0.012, 0.002]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
          </mesh>
        </group>

        {/* ── Realistic Hanging Dark Cables (TubeGeometry Catenary Curves) ── */}
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

      {/* ── TWO CRISP MATTE SLATE-BLUE WALLS ── */}
      <ArchitecturalWalls />

      {/* ── BACK-LEFT WALL DETAILS (Shelves, Books, Succulents, Router, Hanging Cables) ── */}
      <FloatingShelvesWithCables />

      {/* ── BACK-RIGHT WALL (4-Pane Window, Curtains, Contained Night Cityscape) ── */}
      <NightWindow />

      {/* ── WORKSTATION & DEVELOPER (Oriented Parallel to Back-Left Wall) ── */}
      <group>
        <DeskSetup />
        <DeveloperAvatar />
      </group>
    </group>
  )
}
