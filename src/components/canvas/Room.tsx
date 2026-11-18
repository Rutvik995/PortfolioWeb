import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NightWindow } from './NightWindow'
import { DeskSetup } from './DeskSetup'

// ─────────────────────────────────────────────────────────────────────────────
// Room — open-top 2-wall corner diorama cutaway
// No ceiling — camera sees full interior from above
// ─────────────────────────────────────────────────────────────────────────────

const WALL_COLOR   = '#16122a'
const FLOOR_COLOR  = '#1a1206'
const BASEBOARD    = '#120e1e'

function WoodFloor() {
  // Plank strips
  const planks = useMemo(() =>
    Array.from({ length: 9 }).map((_, i) => ({
      z: -2.5 + i * 0.65,
      color: i % 2 === 0 ? '#1f1509' : '#231a0c',
    }))
  , [])

  return (
    <group>
      {/* Base floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[7.5, 6.5]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.92} />
      </mesh>
      {/* Plank seams */}
      {planks.map((p, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, p.z]} receiveShadow>
          <planeGeometry args={[7.5, 0.56]} />
          <meshStandardMaterial color={p.color} roughness={0.95} />
        </mesh>
      ))}
      {/* Woven rug under desk area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0.4]} receiveShadow>
        <planeGeometry args={[2.6, 2.0]} />
        <meshStandardMaterial color="#1a0d2e" roughness={0.98} />
      </mesh>
      {/* Rug border stripe */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.4]}>
        <planeGeometry args={[2.46, 1.86]} />
        <meshStandardMaterial color="#201040" roughness={0.98} />
      </mesh>
    </group>
  )
}

function BackWall() {
  return (
    <group>
      {/* Main wall slab */}
      <mesh position={[0, 2.1, -3.0]} receiveShadow>
        <boxGeometry args={[7.5, 4.2, 0.1]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      {/* Baseboard trim */}
      <mesh position={[0, 0.045, -2.96]}>
        <boxGeometry args={[7.5, 0.09, 0.08]} />
        <meshStandardMaterial color={BASEBOARD} roughness={0.6} />
      </mesh>
    </group>
  )
}

function LeftWall() {
  return (
    <group>
      {/* Main wall slab */}
      <mesh position={[-3.3, 2.1, 0]} receiveShadow>
        <boxGeometry args={[0.1, 4.2, 6.5]} />
        <meshStandardMaterial color={new THREE.Color(WALL_COLOR).multiplyScalar(0.92)} roughness={0.95} />
      </mesh>
      {/* Baseboard trim */}
      <mesh position={[-3.26, 0.045, 0]}>
        <boxGeometry args={[0.08, 0.09, 6.5]} />
        <meshStandardMaterial color={BASEBOARD} roughness={0.6} />
      </mesh>
    </group>
  )
}

function ServerBox() {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.28, 0.1, 0.18]} />
        <meshStandardMaterial color="#0d1117" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Front panel */}
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[0.26, 0.09, 0.005]} />
        <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Vent grille strips */}
      {[-0.06, -0.01, 0.04].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.096]}>
          <boxGeometry args={[0.012, 0.055, 0.001]} />
          <meshStandardMaterial color="#1a2035" />
        </mesh>
      ))}
      {/* LEDs */}
      <BlinkLED position={[0.1, 0.012, 0.096]} color="#34d399" speed={2.8} />
      <BlinkLED position={[0.07, 0.012, 0.096]} color="#fb923c" speed={1.9} phase={1.2} />
    </group>
  )
}

function BlinkLED({ position, color, speed, phase = 0 }: {
  position: [number, number, number]
  color: string
  speed: number
  phase?: number
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!)
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = Math.sin(clock.getElapsedTime() * speed + phase) > 0.2 ? 1.8 : 0.05
    }
  })
  return (
    <mesh position={position}>
      <boxGeometry args={[0.016, 0.016, 0.001]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={1.5}
      />
    </mesh>
  )
}

function WallShelf({ position, books }: {
  position: [number, number, number]
  books: Array<{ w: number; h: number; color: string }>
}) {
  return (
    <group position={position}>
      {/* Shelf board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.03, 0.2]} />
        <meshStandardMaterial color="#2c1f14" roughness={0.75} />
      </mesh>
      {/* Shelf bracket L */}
      <mesh position={[-0.48, -0.06, 0]}>
        <boxGeometry args={[0.025, 0.1, 0.18]} />
        <meshStandardMaterial color="#231810" roughness={0.75} />
      </mesh>
      {/* Shelf bracket R */}
      <mesh position={[0.48, -0.06, 0]}>
        <boxGeometry args={[0.025, 0.1, 0.18]} />
        <meshStandardMaterial color="#231810" roughness={0.75} />
      </mesh>
      {/* Books */}
      {books.reduce((acc, b, i) => {
        const prev = acc[i - 1]
        const x = prev ? prev.x + prev.w / 2 + b.w / 2 + 0.012 : -0.42
        acc.push({ ...b, x })
        return acc
      }, [] as Array<{ x: number; w: number; h: number; color: string }>).map((b, i) => (
        <mesh key={i} position={[b.x, 0.03 + b.h / 2, 0]} castShadow>
          <boxGeometry args={[b.w, b.h, 0.17]} />
          <meshStandardMaterial color={b.color} roughness={0.82} />
        </mesh>
      ))}
    </group>
  )
}

function Succulent({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh castShadow>
        <cylinderGeometry args={[0.055, 0.044, 0.07, 14]} />
        <meshStandardMaterial color="#8b6350" roughness={0.75} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.037, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.01, 14]} />
        <meshStandardMaterial color="#2c1a0e" roughness={0.9} />
      </mesh>
      {/* Leaves */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.03, 0.065, Math.sin(angle) * 0.03]}
            rotation={[0.5, angle, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.012, 0.055, 4, 8]} />
            <meshStandardMaterial color="#2d6a4f" roughness={0.8} />
          </mesh>
        )
      })}
      {/* Centre */}
      <mesh position={[0, 0.09, 0]}>
        <sphereGeometry args={[0.022, 8, 6]} />
        <meshStandardMaterial color="#40916c" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function Room() {
  const books1 = useMemo(() => [
    { w: 0.085, h: 0.24, color: '#c0392b' },
    { w: 0.072, h: 0.21, color: '#2980b9' },
    { w: 0.095, h: 0.26, color: '#27ae60' },
    { w: 0.068, h: 0.19, color: '#8e44ad' },
    { w: 0.088, h: 0.23, color: '#e67e22' },
  ], [])

  const books2 = useMemo(() => [
    { w: 0.08,  h: 0.2,  color: '#1abc9c' },
    { w: 0.09,  h: 0.24, color: '#e74c3c' },
    { w: 0.075, h: 0.21, color: '#3498db' },
    { w: 0.085, h: 0.19, color: '#9b59b6' },
  ], [])

  return (
    <group>
      {/* ── STRUCTURE ── */}
      <WoodFloor />
      <BackWall />
      <LeftWall />

      {/* ── DESK + PROPS ── */}
      <DeskSetup />

      {/* ── WINDOW (recessed in back wall, left of center) ── */}
      <NightWindow />

      {/* ── WALL SHELVES (back wall, right of window) ── */}
      <WallShelf position={[1.6, 2.6, -2.92]} books={books1} />
      <WallShelf position={[1.6, 2.1, -2.92]} books={books2} />

      {/* Server/router box on lower shelf bracket */}
      <group position={[1.6, 1.68, -2.84]}>
        <ServerBox />
      </group>

      {/* ── SUCCULENT on upper shelf ── */}
      <Succulent position={[2.0, 2.65, -2.9]} />

      {/* ── DECORATIVE PRINT on back wall (right side) ── */}
      <mesh position={[2.5, 2.5, -2.93]}>
        <planeGeometry args={[0.65, 0.42]} />
        <meshStandardMaterial color="#0d1117" emissive="#1a2535" emissiveIntensity={0.4} roughness={0.9} />
      </mesh>
      {/* Frame */}
      <mesh position={[2.5, 2.5, -2.925]}>
        <boxGeometry args={[0.69, 0.46, 0.012]} />
        <meshStandardMaterial color="#2c1f14" roughness={0.7} />
      </mesh>

      {/* ── LEFT WALL DECOR — cable pinboard / notes ── */}
      <mesh position={[-3.24, 2.3, -0.6]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial color="#1a1206" roughness={0.98} />
      </mesh>

      {/* Floor edge bevel — slight raised platform feel */}
      <mesh position={[0, -0.015, 0]}>
        <boxGeometry args={[7.6, 0.03, 6.6]} />
        <meshStandardMaterial color="#0d0a08" roughness={0.9} />
      </mesh>
    </group>
  )
}
