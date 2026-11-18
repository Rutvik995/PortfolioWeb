import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NightWindow } from './NightWindow'
import { DeskSetup } from './DeskSetup'
import { DeveloperAvatar } from './DeveloperAvatar'

// ─────────────────────────────────────────────────────────────────────────────
// Room — Clean Architectural Corner Diorama (2-Wall Cutaway)
// Flawlessly aligned walls with zero roof, open interior, and rich warm lighting.
// ─────────────────────────────────────────────────────────────────────────────

const WALL_COLOR   = '#151326' // Rich dark midnight room wall
const FLOOR_COLOR  = '#20160d' // Warm rich hardwood
const BASEBOARD    = '#100e1c'

function WoodFloor() {
  const planks = useMemo(() =>
    Array.from({ length: 10 }).map((_, i) => ({
      z: -2.3 + i * 0.52,
      color: i % 2 === 0 ? '#261b10' : '#1d140b',
    }))
  , [])

  return (
    <group>
      {/* Floor Slab Foundation */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[5.6, 0.12, 5.6]} />
        <meshStandardMaterial color="#0c0907" roughness={0.9} />
      </mesh>
      {/* Top Wood Finish */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[5.5, 5.5]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.88} />
      </mesh>
      {/* Hardwood Plank Seams */}
      {planks.map((p, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, p.z]} receiveShadow>
          <planeGeometry args={[5.45, 0.46]} />
          <meshStandardMaterial color={p.color} roughness={0.9} />
        </mesh>
      ))}

      {/* Modern Woven Area Rug Under Workstation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.4, 0.005, 0.1]} receiveShadow>
        <planeGeometry args={[2.8, 2.2]} />
        <meshStandardMaterial color="#1a122e" roughness={0.98} />
      </mesh>
      {/* Rug Inner Accent Border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.4, 0.006, 0.1]}>
        <planeGeometry args={[2.64, 2.04]} />
        <meshStandardMaterial color="#231742" roughness={0.98} />
      </mesh>
    </group>
  )
}

function PerfectlyAlignedWalls() {
  // Back wall: centered at [0, 1.9, -2.675], width 5.5, height 3.8, depth 0.15
  // Extends X from -2.75 to +2.75, flush with Left Wall
  // Left wall: centered at [-2.675, 1.9, 0.075], width 0.15, height 3.8, depth 5.35
  // Meets Back Wall at corner [-2.75, Y, -2.75] with zero gap or overhang!
  return (
    <group>
      {/* ── BACK WALL ── */}
      <mesh position={[0, 1.9, -2.675]} receiveShadow>
        <boxGeometry args={[5.5, 3.8, 0.15]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.92} />
      </mesh>
      {/* Back Wall Baseboard */}
      <mesh position={[0, 0.05, -2.59]}>
        <boxGeometry args={[5.5, 0.1, 0.04]} />
        <meshStandardMaterial color={BASEBOARD} roughness={0.6} />
      </mesh>

      {/* ── LEFT WALL ── */}
      <mesh position={[-2.675, 1.9, 0.075]} receiveShadow>
        <boxGeometry args={[0.15, 3.8, 5.35]} />
        <meshStandardMaterial color={new THREE.Color(WALL_COLOR).multiplyScalar(0.9)} roughness={0.92} />
      </mesh>
      {/* Left Wall Baseboard */}
      <mesh position={[-2.59, 0.05, 0.075]}>
        <boxGeometry args={[0.04, 0.1, 5.35]} />
        <meshStandardMaterial color={BASEBOARD} roughness={0.6} />
      </mesh>
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
      matRef.current.emissiveIntensity = Math.sin(clock.getElapsedTime() * speed + phase) > 0.2 ? 2.0 : 0.08
    }
  })
  return (
    <mesh position={position}>
      <boxGeometry args={[0.016, 0.016, 0.002]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={1.8}
      />
    </mesh>
  )
}

function ServerBox() {
  return (
    <group>
      {/* Server Chassis Body */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.11, 0.2]} />
        <meshStandardMaterial color="#0b0e17" roughness={0.35} metalness={0.6} />
      </mesh>
      {/* Front Faceplate */}
      <mesh position={[0, 0, 0.102]}>
        <boxGeometry args={[0.28, 0.09, 0.004]} />
        <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Vent Grille Slots */}
      {[-0.07, -0.02, 0.03].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.106]}>
          <boxGeometry args={[0.012, 0.06, 0.001]} />
          <meshStandardMaterial color="#1f293d" />
        </mesh>
      ))}
      {/* Status LEDs */}
      <BlinkLED position={[0.1, 0.015, 0.106]} color="#10b981" speed={2.8} />
      <BlinkLED position={[0.07, 0.015, 0.106]} color="#f59e0b" speed={1.8} phase={1.4} />
      <BlinkLED position={[0.04, 0.015, 0.106]} color="#00f2fe" speed={3.4} phase={0.6} />
    </group>
  )
}

function WallShelf({ position, books }: {
  position: [number, number, number]
  books: Array<{ w: number; h: number; color: string }>
}) {
  return (
    <group position={position}>
      {/* Solid Wood Shelf Board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.035, 0.22]} />
        <meshStandardMaterial color="#2d1c10" roughness={0.7} />
      </mesh>
      {/* Steel Brackets */}
      {[-0.52, 0.52].map((bx, i) => (
        <mesh key={i} position={[bx, -0.06, 0]}>
          <boxGeometry args={[0.024, 0.11, 0.2]} />
          <meshStandardMaterial color="#1f1a14" roughness={0.7} metalness={0.4} />
        </mesh>
      ))}
      {/* Books on Shelf */}
      {books.reduce((acc, b, i) => {
        const prev = acc[i - 1]
        const x = prev ? prev.x + prev.w / 2 + b.w / 2 + 0.015 : -0.46
        acc.push({ ...b, x })
        return acc
      }, [] as Array<{ x: number; w: number; h: number; color: string }>).map((b, i) => (
        <mesh key={i} position={[b.x, 0.035 + b.h / 2, 0]} castShadow>
          <boxGeometry args={[b.w, b.h, 0.18]} />
          <meshStandardMaterial color={b.color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function SucculentPlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Ceramic Pot */}
      <mesh castShadow>
        <cylinderGeometry args={[0.055, 0.042, 0.08, 16]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.041, 0]}>
        <cylinderGeometry args={[0.051, 0.051, 0.008, 16]} />
        <meshStandardMaterial color="#22140a" roughness={0.9} />
      </mesh>
      {/* Succulent Leaves */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const angle = (i / 7) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.03, 0.07, Math.sin(angle) * 0.03]}
            rotation={[0.45, angle, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.012, 0.05, 4, 8]} />
            <meshStandardMaterial color="#15803d" roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

export function Room() {
  const booksUpper = useMemo(() => [
    { w: 0.085, h: 0.24, color: '#dc2626' },
    { w: 0.075, h: 0.21, color: '#2563eb' },
    { w: 0.095, h: 0.26, color: '#16a34a' },
    { w: 0.07,  h: 0.19, color: '#9333ea' },
    { w: 0.088, h: 0.23, color: '#ea580c' },
  ], [])

  const booksLower = useMemo(() => [
    { w: 0.08,  h: 0.20, color: '#0d9488' },
    { w: 0.092, h: 0.25, color: '#e11d48' },
    { w: 0.074, h: 0.22, color: '#0284c7' },
    { w: 0.084, h: 0.19, color: '#7c3aed' },
  ], [])

  return (
    <group>
      {/* ── ARCHITECTURAL PODIUM FLOOR ── */}
      <WoodFloor />

      {/* ── FLUSH ALIGNED ROOM WALLS (NO OVERHANGS) ── */}
      <PerfectlyAlignedWalls />

      {/* ── LARGE LOFT WINDOW ON BACK WALL WITH 3D NIGHT SKYLINE ── */}
      <NightWindow />

      {/* ── FLOATING WALL SHELVES (Back Wall, Right of Window) ── */}
      <WallShelf position={[1.7, 2.7, -2.58]} books={booksUpper} />
      <WallShelf position={[1.7, 2.15, -2.58]} books={booksLower} />

      {/* Server / Router Box with Blinking LEDs */}
      <group position={[1.7, 1.68, -2.5]}>
        <ServerBox />
      </group>

      {/* Potted Succulent Plant on Upper Shelf */}
      <SucculentPlant position={[2.15, 2.75, -2.56]} />

      {/* Framed Wall Art on Back Wall */}
      <group position={[2.1, 1.4, -2.59]}>
        <mesh>
          <planeGeometry args={[0.7, 0.46]} />
          <meshStandardMaterial color="#0b0f19" emissive="#1e293b" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <boxGeometry args={[0.74, 0.5, 0.012]} />
          <meshStandardMaterial color="#1f1610" roughness={0.7} />
        </mesh>
      </group>

      {/* ── WORKSTATION (DESK + MONITOR + RUTVIK AVATAR) ──
          Pivoted at 3/4 isometric angle so the user clearly sees:
          1. Rutvik's face, hair, glasses, and brown hoodie
          2. Active typing hands over keyboard
          3. Bright glowing monitor screen with code
          4. Window skyline directly in the background!
      */}
      <group position={[-0.3, 0, 0.1]} rotation={[0, Math.PI * 0.28, 0]}>
        <DeskSetup />
        <DeveloperAvatar />
      </group>
    </group>
  )
}
