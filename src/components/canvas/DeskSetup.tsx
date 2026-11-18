import * as THREE from 'three'
import { useLampStore } from './lampStore'

// ─────────────────────────────────────────────────────────────────────────────
// DeskSetup — Articulated Brass Desk Lamp (Clickable Hero Key Light)
// Mounts on the workstation desk beside DeveloperAvatar to cast a warm golden
// pool of light across the desk, keyboard, and Rutvik's hoodie (Image 5).
// All other furniture (desk, chair, monitors, keyboard) is procedural in
// DeveloperAvatar.tsx to ensure 100% perfect zero-clipping alignment!
// ─────────────────────────────────────────────────────────────────────────────

const BRASS_METAL = '#c59b27'

export function ArticulatedDeskLamp({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const lampOn = useLampStore((s) => s.lampOn)
  const toggleLamp = useLampStore((s) => s.toggleLamp)

  return (
    <group
      position={position}
      onClick={toggleLamp}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      {/* Weighted Circular Brass Base */}
      <mesh position={[0, 0.012, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.082, 0.024, 20]} />
        <meshStandardMaterial color={BRASS_METAL} metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Lower Arm Segment */}
      <mesh position={[0.08, 0.16, 0.04]} rotation={[-0.2, 0, -0.45]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.34, 10]} />
        <meshStandardMaterial color={BRASS_METAL} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Articulated Joint 1 */}
      <mesh position={[0.15, 0.30, 0.08]}>
        <sphereGeometry args={[0.018, 12, 10]} />
        <meshStandardMaterial color={BRASS_METAL} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Upper Arm Segment */}
      <mesh position={[0.22, 0.40, 0.12]} rotation={[0.25, 0, 0.65]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.28, 10]} />
        <meshStandardMaterial color={BRASS_METAL} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Articulated Joint 2 */}
      <mesh position={[0.28, 0.48, 0.16]}>
        <sphereGeometry args={[0.018, 12, 10]} />
        <meshStandardMaterial color={BRASS_METAL} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Flared Cone Lampshade Directed Downward at Desk & Keyboard */}
      <group position={[0.32, 0.44, 0.20]} rotation={[0.8, -0.4, 0.8]}>
        <mesh castShadow>
          <coneGeometry args={[0.082, 0.12, 18, 1, true]} />
          <meshStandardMaterial
            color={BRASS_METAL}
            metalness={0.75}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Glowing Emissive Bulb Inside */}
        <mesh position={[0, -0.02, 0]}>
          <sphereGeometry args={[0.032, 14, 12]} />
          <meshStandardMaterial
            color="#fffbeb"
            emissive="#ffb74d"
            emissiveIntensity={lampOn ? 3.8 : 0.2}
          />
        </mesh>
      </group>
    </group>
  )
}

export function DeskSetup() {
  return null
}
