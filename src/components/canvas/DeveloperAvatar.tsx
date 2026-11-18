import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// Procedural Developer Avatar resembling Rutvik:
// - Young Indian man, early 20s, lean build
// - Warm medium-tan skin (#c68642)
// - Medium-long dark brown-black wavy hair
// - Dark-framed rectangular glasses
// - Oversized dark brown hoodie (#4a3228)
// - Black wristwatch on left wrist
// - Seated at desk, typing animation
// ─────────────────────────────────────────────────────────────────────────────

const SKIN = '#c68642'
const SKIN_DARK = '#a06535'  // slightly darker for beard/shadow
const HAIR = '#12080a'
const HOODIE = '#4a3228'
const GLASS_FRAME = '#1a1a1a'
const GLASS_LENS = '#1e2a40'
const WATCH = '#111111'
const JEAN = '#1a2035'
const SHOE = '#1a1a1a'

export function DeveloperAvatar() {
  const torsoRef = useRef<THREE.Group>(null!)
  const headRef = useRef<THREE.Group>(null!)
  const lHandRef = useRef<THREE.Group>(null!)
  const rHandRef = useRef<THREE.Group>(null!)
  const lArmRef = useRef<THREE.Group>(null!)
  const rArmRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Breathing idle
    if (torsoRef.current) {
      torsoRef.current.scale.y = 1 + Math.sin(t * 0.9) * 0.006
    }

    // Head: subtle look between keyboard and monitor
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.25) * 0.08 - 0.05
      headRef.current.rotation.y = Math.sin(t * 0.3) * 0.12
    }

    // Typing arms/hands
    if (lHandRef.current) {
      lHandRef.current.position.y = Math.sin(t * 7.0) * 0.012
    }
    if (rHandRef.current) {
      rHandRef.current.position.y = Math.sin(t * 7.0 + Math.PI * 0.7) * 0.012
    }
    if (lArmRef.current) {
      lArmRef.current.rotation.x = -0.6 + Math.sin(t * 7.0) * 0.04
    }
    if (rArmRef.current) {
      rArmRef.current.rotation.x = -0.6 + Math.sin(t * 7.0 + Math.PI * 0.7) * 0.04
    }
  })

  return (
    // Seated position: origin near chair seat
    <group position={[0, 0.44, 0.5]}>

      {/* ── CHAIR ── */}
      {/* Seat */}
      <mesh position={[0, 0, 0.1]} receiveShadow>
        <boxGeometry args={[0.52, 0.055, 0.5]} />
        <meshStandardMaterial color="#111827" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Chair back */}
      <mesh position={[0, 0.38, 0.35]} receiveShadow>
        <boxGeometry args={[0.5, 0.75, 0.05]} />
        <meshStandardMaterial color="#111827" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Chair legs */}
      {([-0.22, 0.22] as number[]).map(x =>
        ([0.0, 0.2] as number[]).map(z => (
          <mesh key={`${x}-${z}`} position={[x, -0.22, z]}>
            <cylinderGeometry args={[0.015, 0.015, 0.44, 8]} />
            <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
          </mesh>
        ))
      )}

      {/* ── LOWER BODY ── */}
      {/* Hips/Thighs */}
      <mesh position={[0, 0.1, 0.0]} castShadow>
        <boxGeometry args={[0.38, 0.14, 0.44]} />
        <meshStandardMaterial color={JEAN} roughness={0.8} />
      </mesh>
      {/* Lower legs (going down from seat) */}
      <mesh position={[-0.1, -0.3, -0.12]} castShadow>
        <boxGeometry args={[0.11, 0.42, 0.13]} />
        <meshStandardMaterial color={JEAN} roughness={0.8} />
      </mesh>
      <mesh position={[0.1, -0.3, -0.12]} castShadow>
        <boxGeometry args={[0.11, 0.42, 0.13]} />
        <meshStandardMaterial color={JEAN} roughness={0.8} />
      </mesh>
      {/* Shoes */}
      <mesh position={[-0.1, -0.52, -0.22]}>
        <boxGeometry args={[0.11, 0.07, 0.2]} />
        <meshStandardMaterial color={SHOE} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.1, -0.52, -0.22]}>
        <boxGeometry args={[0.11, 0.07, 0.2]} />
        <meshStandardMaterial color={SHOE} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* ── TORSO ── */}
      <group ref={torsoRef} position={[0, 0.44, 0.04]}>
        {/* Main hoodie body */}
        <mesh castShadow>
          <boxGeometry args={[0.46, 0.52, 0.28]} />
          <meshStandardMaterial color={HOODIE} roughness={0.95} />
        </mesh>
        {/* Hood behind shoulders */}
        <mesh position={[0, 0.2, 0.1]}>
          <boxGeometry args={[0.38, 0.14, 0.12]} />
          <meshStandardMaterial color={new THREE.Color(HOODIE).multiplyScalar(0.85)} roughness={0.98} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 0.3, 0.0]} castShadow>
          <cylinderGeometry args={[0.055, 0.065, 0.14, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.7} />
        </mesh>

        {/* ── LEFT ARM ── */}
        <group ref={lArmRef} position={[-0.26, 0.05, 0.02]}>
          {/* Upper arm */}
          <mesh position={[0, -0.12, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.065, 0.28, 10]} />
            <meshStandardMaterial color={HOODIE} roughness={0.95} />
          </mesh>
          {/* Forearm (angled forward toward keyboard) */}
          <mesh position={[-0.05, -0.33, -0.14]} rotation={[0.6, 0, -0.1]} castShadow>
            <cylinderGeometry args={[0.055, 0.05, 0.3, 10]} />
            <meshStandardMaterial color={HOODIE} roughness={0.95} />
          </mesh>
          {/* Left hand */}
          <group ref={lHandRef} position={[-0.1, -0.52, -0.26]}>
            <mesh castShadow>
              <boxGeometry args={[0.09, 0.055, 0.1]} />
              <meshStandardMaterial color={SKIN} roughness={0.7} />
            </mesh>
            {/* Watch on left wrist */}
            <mesh position={[0, 0, 0.055]}>
              <cylinderGeometry args={[0.045, 0.045, 0.02, 12]} />
              <meshStandardMaterial color={WATCH} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.03, 0.065]}>
              <boxGeometry args={[0.038, 0.014, 0.03]} />
              <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.3} />
            </mesh>
          </group>
        </group>

        {/* ── RIGHT ARM ── */}
        <group ref={rArmRef} position={[0.26, 0.05, 0.02]}>
          {/* Upper arm */}
          <mesh position={[0, -0.12, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.065, 0.28, 10]} />
            <meshStandardMaterial color={HOODIE} roughness={0.95} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0.05, -0.33, -0.14]} rotation={[0.6, 0, 0.1]} castShadow>
            <cylinderGeometry args={[0.055, 0.05, 0.3, 10]} />
            <meshStandardMaterial color={HOODIE} roughness={0.95} />
          </mesh>
          {/* Right hand */}
          <group ref={rHandRef} position={[0.1, -0.52, -0.26]}>
            <mesh castShadow>
              <boxGeometry args={[0.09, 0.055, 0.1]} />
              <meshStandardMaterial color={SKIN} roughness={0.7} />
            </mesh>
          </group>
        </group>

        {/* ── HEAD ── */}
        <group ref={headRef} position={[0, 0.52, 0.0]}>
          {/* Head (slightly oval) */}
          <mesh castShadow scale={[1, 1.08, 0.95]}>
            <sphereGeometry args={[0.155, 20, 16]} />
            <meshStandardMaterial color={SKIN} roughness={0.75} />
          </mesh>

          {/* ── HAIR ── voluminous, wavy, dark */}
          {/* Top mass */}
          <mesh position={[0, 0.1, 0.0]} scale={[1.05, 0.7, 0.9]}>
            <sphereGeometry args={[0.165, 16, 12]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>
          {/* Side hair — left */}
          <mesh position={[-0.14, 0.04, 0.0]} scale={[0.5, 0.75, 0.75]}>
            <sphereGeometry args={[0.16, 12, 10]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>
          {/* Side hair — right */}
          <mesh position={[0.14, 0.04, 0.0]} scale={[0.5, 0.75, 0.75]}>
            <sphereGeometry args={[0.16, 12, 10]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>
          {/* Back hair (extends to nape) */}
          <mesh position={[0, 0.0, 0.1]} scale={[0.9, 0.9, 0.5]}>
            <sphereGeometry args={[0.16, 12, 10]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>
          {/* Front sweep over forehead */}
          <mesh position={[0.03, 0.14, -0.1]} rotation={[0.3, -0.1, 0.1]} scale={[0.9, 0.3, 0.6]}>
            <sphereGeometry args={[0.18, 12, 8]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>

          {/* ── EYES ── */}
          <mesh position={[-0.055, 0.02, -0.148]}>
            <sphereGeometry args={[0.022, 10, 8]} />
            <meshStandardMaterial color="#1a1010" roughness={0.2} />
          </mesh>
          <mesh position={[0.055, 0.02, -0.148]}>
            <sphereGeometry args={[0.022, 10, 8]} />
            <meshStandardMaterial color="#1a1010" roughness={0.2} />
          </mesh>

          {/* ── GLASSES ── dark rectangular frames */}
          {/* Left lens frame */}
          <mesh position={[-0.056, 0.022, -0.158]}>
            <torusGeometry args={[0.038, 0.007, 4, 4]} />
            <meshStandardMaterial color={GLASS_FRAME} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Right lens frame */}
          <mesh position={[0.056, 0.022, -0.158]}>
            <torusGeometry args={[0.038, 0.007, 4, 4]} />
            <meshStandardMaterial color={GLASS_FRAME} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Nose bridge */}
          <mesh position={[0, 0.022, -0.159]}>
            <boxGeometry args={[0.036, 0.007, 0.004]} />
            <meshStandardMaterial color={GLASS_FRAME} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Lens glass left */}
          <mesh position={[-0.056, 0.022, -0.157]}>
            <planeGeometry args={[0.058, 0.044]} />
            <meshStandardMaterial
              color={GLASS_LENS}
              transparent
              opacity={0.35}
              roughness={0.05}
              metalness={0.0}
            />
          </mesh>
          {/* Lens glass right */}
          <mesh position={[0.056, 0.022, -0.157]}>
            <planeGeometry args={[0.058, 0.044]} />
            <meshStandardMaterial
              color={GLASS_LENS}
              transparent
              opacity={0.35}
              roughness={0.05}
              metalness={0.0}
            />
          </mesh>
          {/* Temple arms */}
          <mesh position={[-0.165, 0.022, -0.09]} rotation={[0, 0.5, 0]}>
            <boxGeometry args={[0.14, 0.006, 0.006]} />
            <meshStandardMaterial color={GLASS_FRAME} roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0.165, 0.022, -0.09]} rotation={[0, -0.5, 0]}>
            <boxGeometry args={[0.14, 0.006, 0.006]} />
            <meshStandardMaterial color={GLASS_FRAME} roughness={0.3} metalness={0.4} />
          </mesh>

          {/* ── NOSE ── */}
          <mesh position={[0, -0.015, -0.158]}>
            <sphereGeometry args={[0.018, 8, 6]} />
            <meshStandardMaterial color={SKIN} roughness={0.75} />
          </mesh>

          {/* ── BEARD / MUSTACHE area (darker skin patch) ── */}
          <mesh position={[0, -0.055, -0.148]} scale={[1, 0.4, 0.7]}>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshStandardMaterial color={SKIN_DARK} roughness={0.8} />
          </mesh>
          {/* Mustache strip */}
          <mesh position={[0, -0.03, -0.157]} scale={[0.9, 0.35, 0.3]}>
            <sphereGeometry args={[0.055, 8, 6]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>

          {/* ── EARS ── */}
          <mesh position={[-0.158, 0.01, 0.0]} scale={[0.3, 0.55, 0.45]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color={SKIN} roughness={0.75} />
          </mesh>
          <mesh position={[0.158, 0.01, 0.0]} scale={[0.3, 0.55, 0.45]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color={SKIN} roughness={0.75} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
