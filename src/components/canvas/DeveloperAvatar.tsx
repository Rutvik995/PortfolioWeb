import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// DeveloperAvatar — Stylized 3D Developer (Rutvik)
// Reference:
// - Young Indian man, early 20s, lean build, warm medium-tan skin (#c68b66)
// - Medium-long, thick, voluminous dark brown-black wavy hair (#1b1412)
//   covering the ears, reaching the nape, with soft side-swept wave over forehead
// - Dark rectangular-rounded glasses (#1f242d) with subtle screen reflection
// - Neatly trimmed light mustache & short jawline beard (#1f1614)
// - Oversized dark brown pullover hoodie (#4e3429) with draped hood & kangaroo pocket
// - Black smartwatch/wristwatch on left wrist (#111111)
// - Modern ergonomic desk chair with 5-star base & contoured backrest
// - Living animations: breathing, head-tracking screen/keys, typing hands
// ─────────────────────────────────────────────────────────────────────────────

const SKIN = '#c68b66'
const BEARD = '#1f1614'
const HAIR = '#1b1412'
const HOODIE = '#4e3429'
const HOODIE_SHADOW = '#3c271e'
const HOODIE_ACCENT = '#5a3d30'
const GLASS_FRAME = '#1f242d'
const GLASS_LENS = '#38bdf8'
const WATCH = '#111111'
const PANTS = '#161922'
const SNEAKER = '#14171f'
const SNEAKER_SOLE = '#e2e8f0'
const CHAIR_FRAME = '#111318'
const CHAIR_CUSHION = '#1c202a'
const CHAIR_METAL = '#475569'

export function DeveloperAvatar() {
  const torsoRef = useRef<THREE.Group>(null!)
  const headRef = useRef<THREE.Group>(null!)
  const lHandRef = useRef<THREE.Group>(null!)
  const rHandRef = useRef<THREE.Group>(null!)
  const lArmRef = useRef<THREE.Group>(null!)
  const rArmRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // 1. Natural breathing motion (chest expansion & subtle rise)
    if (torsoRef.current) {
      const breathe = Math.sin(t * 1.2) * 0.008
      torsoRef.current.scale.set(1 + breathe * 0.5, 1 + breathe, 1 + breathe * 0.8)
      torsoRef.current.rotation.x = -0.06 + Math.sin(t * 1.2) * 0.005
    }

    // 2. Head motion: shifting focus between Mac screen and keyboard
    if (headRef.current) {
      headRef.current.rotation.x = 0.06 + Math.sin(t * 0.5) * 0.04
      headRef.current.rotation.y = Math.sin(t * 0.35) * 0.05
      headRef.current.rotation.z = Math.sin(t * 0.25) * 0.02
    }

    // 3. Fluid typing animation: alternating fingers & wrists tapping
    if (lHandRef.current && rHandRef.current && lArmRef.current && rArmRef.current) {
      const tapL = Math.sin(t * 8.5)
      const tapR = Math.sin(t * 8.5 + 2.1)

      lHandRef.current.position.y = tapL * 0.007
      rHandRef.current.position.y = tapR * 0.007

      lHandRef.current.rotation.x = -0.15 + tapL * 0.05
      rHandRef.current.rotation.x = -0.15 + tapR * 0.05

      lArmRef.current.rotation.x = -0.58 + tapL * 0.018
      rArmRef.current.rotation.x = -0.58 + tapR * 0.018
    }
  })

  return (
    // Seated in front of the desk (keyboard is at z = 0.26, x = 0.08)
    <group position={[0.08, 0, 0.64]}>

      {/* ═════════════════════════════════════════════════════════════════════════
          ERGONOMIC OFFICE CHAIR
          ═════════════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0, 0]}>
        {/* 5-Star Caster Wheel Base */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.045, 0.05, 0.06, 16]} />
          <meshStandardMaterial color={CHAIR_FRAME} metalness={0.6} roughness={0.4} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh position={[0, 0.04, 0.16]} rotation={[0.08, 0, 0]}>
                <boxGeometry args={[0.032, 0.025, 0.32]} />
                <meshStandardMaterial color={CHAIR_FRAME} metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Caster Wheel */}
              <mesh position={[0, 0.022, 0.31]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.022, 0.022, 0.022, 12]} />
                <meshStandardMaterial color="#090a0d" roughness={0.7} />
              </mesh>
            </group>
          )
        })}

        {/* Central Hydraulic Piston */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.32, 16]} />
          <meshStandardMaterial color={CHAIR_METAL} metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Seat Tilt Mechanism Box */}
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[0.22, 0.06, 0.24]} />
          <meshStandardMaterial color={CHAIR_FRAME} metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Ergonomic Seat Cushion */}
        <mesh position={[0, 0.44, -0.02]} castShadow receiveShadow>
          <boxGeometry args={[0.54, 0.08, 0.52]} />
          <meshStandardMaterial color={CHAIR_CUSHION} roughness={0.85} />
        </mesh>
        {/* Seat side contour bolsters */}
        {[-0.25, 0.25].map((x, i) => (
          <mesh key={i} position={[x, 0.47, -0.02]}>
            <boxGeometry args={[0.06, 0.05, 0.48]} />
            <meshStandardMaterial color={CHAIR_CUSHION} roughness={0.85} />
          </mesh>
        ))}

        {/* Curved Ergonomic Backrest Spine */}
        <mesh position={[0, 0.65, 0.25]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.06, 0.48, 0.035]} />
          <meshStandardMaterial color={CHAIR_FRAME} metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Mesh High Backrest */}
        <mesh position={[0, 0.74, 0.26]} rotation={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.48, 0.58, 0.04]} />
          <meshStandardMaterial color={CHAIR_CUSHION} roughness={0.9} />
        </mesh>
        {/* Lumbar Support Pad */}
        <mesh position={[0, 0.6, 0.23]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.36, 0.12, 0.035]} />
          <meshStandardMaterial color={CHAIR_FRAME} roughness={0.6} />
        </mesh>

        {/* Armrest Supports & Padded Tops */}
        {[-0.28, 0.28].map((x, i) => (
          <group key={i} position={[x, 0.46, -0.02]}>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.016, 0.018, 0.22, 10]} />
              <meshStandardMaterial color={CHAIR_FRAME} metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.23, 0.02]}>
              <boxGeometry args={[0.065, 0.024, 0.28]} />
              <meshStandardMaterial color="#0e1015" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ═════════════════════════════════════════════════════════════════════════
          LOWER BODY (Tapered Joggers & Sneakers)
          ═════════════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0.44, 0]}>
        {/* Hips & Pelvis */}
        <mesh position={[0, 0.08, -0.04]} castShadow>
          <boxGeometry args={[0.42, 0.16, 0.42]} />
          <meshStandardMaterial color={PANTS} roughness={0.85} />
        </mesh>

        {/* Thighs extending forward under the desk */}
        {[-0.13, 0.13].map((x, i) => (
          <group key={i}>
            <mesh position={[x, 0.04, -0.18]} rotation={[1.48, 0, 0]} castShadow>
              <cylinderGeometry args={[0.09, 0.08, 0.38, 14]} />
              <meshStandardMaterial color={PANTS} roughness={0.85} />
            </mesh>
            {/* Knees */}
            <mesh position={[x, 0.02, -0.38]} castShadow>
              <sphereGeometry args={[0.085, 12, 10]} />
              <meshStandardMaterial color={PANTS} roughness={0.85} />
            </mesh>
            {/* Shins / Lower legs angled down to floor */}
            <mesh position={[x, -0.22, -0.37]} rotation={[-0.08, 0, 0]} castShadow>
              <cylinderGeometry args={[0.075, 0.065, 0.4, 14]} />
              <meshStandardMaterial color={PANTS} roughness={0.85} />
            </mesh>
            {/* Sneakers */}
            <group position={[x, -0.42, -0.36]}>
              <mesh castShadow>
                <boxGeometry args={[0.11, 0.06, 0.22]} />
                <meshStandardMaterial color={SNEAKER} roughness={0.7} />
              </mesh>
              {/* Sole */}
              <mesh position={[0, -0.025, 0]}>
                <boxGeometry args={[0.115, 0.018, 0.23]} />
                <meshStandardMaterial color={SNEAKER_SOLE} roughness={0.4} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* ═════════════════════════════════════════════════════════════════════════
          TORSO (Oversized Dark Brown Pullover Hoodie)
          ═════════════════════════════════════════════════════════════════════════ */}
      <group ref={torsoRef} position={[0, 0.62, -0.02]}>
        {/* Main Hoodie Body — Relaxed, chunky oversized shape */}
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.52, 0.46, 0.34]} />
          <meshStandardMaterial color={HOODIE} roughness={0.92} />
        </mesh>
        {/* Hoodie bottom rib hem */}
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[0.49, 0.06, 0.32]} />
          <meshStandardMaterial color={HOODIE_SHADOW} roughness={0.95} />
        </mesh>

        {/* Front Kangaroo Pouch Pocket */}
        <mesh position={[0, 0.06, -0.175]} rotation={[-0.06, 0, 0]} castShadow>
          <boxGeometry args={[0.34, 0.18, 0.04]} />
          <meshStandardMaterial color={HOODIE_ACCENT} roughness={0.92} />
        </mesh>
        {/* Kangaroo Pocket Stitch Seam Lines */}
        <mesh position={[0, 0.145, -0.19]}>
          <boxGeometry args={[0.32, 0.008, 0.006]} />
          <meshStandardMaterial color={HOODIE_SHADOW} />
        </mesh>

        {/* Sculpted Hood draped behind neck and shoulders */}
        <group position={[0, 0.34, 0.09]}>
          {/* Main draped hood volume */}
          <mesh rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.22, 0.14, 16]} />
            <meshStandardMaterial color={HOODIE_SHADOW} roughness={0.95} />
          </mesh>
          {/* Hood collar fold around neck front */}
          <mesh position={[0, 0.02, -0.18]} rotation={[-0.3, 0, 0]}>
            <torusGeometry args={[0.12, 0.035, 8, 16, Math.PI * 1.1]} />
            <meshStandardMaterial color={HOODIE} roughness={0.9} />
          </mesh>
          {/* Drawstrings */}
          {[-0.04, 0.04].map((dx, i) => (
            <mesh key={i} position={[dx, -0.06, -0.2]}>
              <cylinderGeometry args={[0.004, 0.004, 0.12, 6]} />
              <meshStandardMaterial color="#d4c5b9" roughness={0.6} />
            </mesh>
          ))}
        </group>

        {/* Neck */}
        <mesh position={[0, 0.42, -0.02]} castShadow>
          <cylinderGeometry args={[0.065, 0.075, 0.12, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.7} />
        </mesh>

        {/* ─────────────────────────────────────────────────────────────────
            LEFT ARM & HAND (Typing on Keyboard + Black Smartwatch)
            ───────────────────────────────────────────────────────────────── */}
        <group ref={lArmRef} position={[-0.28, 0.32, -0.02]}>
          {/* Drop-shoulder oversized hoodie sleeve top */}
          <mesh position={[0, -0.04, 0]} castShadow>
            <sphereGeometry args={[0.095, 14, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.92} />
          </mesh>
          {/* Upper Arm */}
          <mesh position={[-0.02, -0.16, -0.04]} rotation={[0.45, 0, 0.1]} castShadow>
            <cylinderGeometry args={[0.08, 0.072, 0.26, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.92} />
          </mesh>
          {/* Elbow bend */}
          <mesh position={[-0.03, -0.28, -0.14]}>
            <sphereGeometry args={[0.072, 12, 10]} />
            <meshStandardMaterial color={HOODIE} roughness={0.92} />
          </mesh>
          {/* Forearm angled down toward keyboard */}
          <mesh position={[-0.01, -0.34, -0.27]} rotation={[-0.68, 0.12, -0.15]} castShadow>
            <cylinderGeometry args={[0.068, 0.058, 0.28, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.92} />
          </mesh>
          {/* Sleeve cuff */}
          <mesh position={[0.02, -0.42, -0.38]} rotation={[-0.68, 0.12, -0.15]}>
            <cylinderGeometry args={[0.055, 0.055, 0.04, 12]} />
            <meshStandardMaterial color={HOODIE_SHADOW} roughness={0.95} />
          </mesh>

          {/* Left Hand & Smartwatch */}
          <group ref={lHandRef} position={[0.04, -0.46, -0.43]}>
            {/* Black Wristwatch (Pixel Watch style) */}
            <mesh position={[0, 0.02, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.042, 0.042, 0.024, 16]} />
              <meshStandardMaterial color={WATCH} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.038, 0.04]}>
              <cylinderGeometry args={[0.024, 0.024, 0.008, 16]} />
              <meshStandardMaterial color="#050810" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Hand Palm */}
            <mesh position={[0, 0, -0.04]} rotation={[-0.15, 0.1, 0]} castShadow>
              <boxGeometry args={[0.088, 0.035, 0.095]} />
              <meshStandardMaterial color={SKIN} roughness={0.65} />
            </mesh>
            {/* Fingers curved over keyboard */}
            {[-0.028, -0.008, 0.012, 0.032].map((fx, fi) => (
              <mesh key={fi} position={[fx, -0.015, -0.095]} rotation={[0.4, 0, 0]}>
                <cylinderGeometry args={[0.008, 0.007, 0.045, 6]} />
                <meshStandardMaterial color={SKIN} roughness={0.65} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ─────────────────────────────────────────────────────────────────
            RIGHT ARM & HAND (Typing on Keyboard)
            ───────────────────────────────────────────────────────────────── */}
        <group ref={rArmRef} position={[0.28, 0.32, -0.02]}>
          {/* Drop-shoulder oversized hoodie sleeve top */}
          <mesh position={[0, -0.04, 0]} castShadow>
            <sphereGeometry args={[0.095, 14, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.92} />
          </mesh>
          {/* Upper Arm */}
          <mesh position={[0.02, -0.16, -0.04]} rotation={[0.45, 0, -0.1]} castShadow>
            <cylinderGeometry args={[0.08, 0.072, 0.26, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.92} />
          </mesh>
          {/* Elbow bend */}
          <mesh position={[0.03, -0.28, -0.14]}>
            <sphereGeometry args={[0.072, 12, 10]} />
            <meshStandardMaterial color={HOODIE} roughness={0.92} />
          </mesh>
          {/* Forearm angled down toward keyboard */}
          <mesh position={[0.01, -0.34, -0.27]} rotation={[-0.68, -0.12, 0.15]} castShadow>
            <cylinderGeometry args={[0.068, 0.058, 0.28, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.92} />
          </mesh>
          {/* Sleeve cuff */}
          <mesh position={[-0.02, -0.42, -0.38]} rotation={[-0.68, -0.12, 0.15]}>
            <cylinderGeometry args={[0.055, 0.055, 0.04, 12]} />
            <meshStandardMaterial color={HOODIE_SHADOW} roughness={0.95} />
          </mesh>

          {/* Right Hand */}
          <group ref={rHandRef} position={[-0.04, -0.46, -0.43]}>
            {/* Hand Palm */}
            <mesh position={[0, 0, -0.04]} rotation={[-0.15, -0.1, 0]} castShadow>
              <boxGeometry args={[0.088, 0.035, 0.095]} />
              <meshStandardMaterial color={SKIN} roughness={0.65} />
            </mesh>
            {/* Fingers curved over keyboard */}
            {[-0.032, -0.012, 0.008, 0.028].map((fx, fi) => (
              <mesh key={fi} position={[fx, -0.015, -0.095]} rotation={[0.4, 0, 0]}>
                <cylinderGeometry args={[0.008, 0.007, 0.045, 6]} />
                <meshStandardMaterial color={SKIN} roughness={0.65} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ═════════════════════════════════════════════════════════════════
            HEAD, FACE & HAIR (Distinct, Well-Lit & Recognizable as Rutvik)
            ═════════════════════════════════════════════════════════════════ */}
        <group ref={headRef} position={[0, 0.62, -0.04]}>
          {/* Stylized Head Geometry */}
          <mesh castShadow scale={[1, 1.12, 0.98]}>
            <sphereGeometry args={[0.152, 24, 20]} />
            <meshStandardMaterial color={SKIN} roughness={0.68} />
          </mesh>

          {/* Jaw & Chin Sculpt */}
          <mesh position={[0, -0.075, -0.06]} scale={[1, 0.7, 0.9]}>
            <sphereGeometry args={[0.11, 16, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.68} />
          </mesh>

          {/* Visible Sculpted Ears */}
          {[-0.156, 0.156].map((ex, i) => (
            <group key={i} position={[ex, 0.01, 0]}>
              <mesh rotation={[0, (i === 0 ? -0.2 : 0.2), 0]} scale={[0.3, 0.6, 0.45]}>
                <sphereGeometry args={[0.07, 10, 8]} />
                <meshStandardMaterial color={SKIN} roughness={0.68} />
              </mesh>
            </group>
          ))}

          {/* ── EYEBROWS ── (Dark defined arches) */}
          <mesh position={[-0.054, 0.065, -0.145]} rotation={[0, 0, 0.08]}>
            <boxGeometry args={[0.055, 0.012, 0.018]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>
          <mesh position={[0.054, 0.065, -0.145]} rotation={[0, 0, -0.08]}>
            <boxGeometry args={[0.055, 0.012, 0.018]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>

          {/* ── EYES ── */}
          {[-0.052, 0.052].map((ex, i) => (
            <group key={i} position={[ex, 0.024, -0.142]}>
              {/* Eye white */}
              <mesh scale={[1, 0.65, 0.4]}>
                <sphereGeometry args={[0.025, 12, 10]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.1} />
              </mesh>
              {/* Dark pupil/iris */}
              <mesh position={[0, 0, -0.009]}>
                <sphereGeometry args={[0.014, 10, 8]} />
                <meshStandardMaterial color="#120c0a" roughness={0.2} />
              </mesh>
            </group>
          ))}

          {/* ── NOSE ── */}
          <mesh position={[0, 0.002, -0.165]}>
            <coneGeometry args={[0.022, 0.055, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.65} />
          </mesh>

          {/* ── MUSTACHE & JAWLINE BEARD (Neatly Trimmed) ── */}
          {/* Mustache above upper lip */}
          <mesh position={[0, -0.042, -0.158]} scale={[1, 0.35, 0.4]}>
            <boxGeometry args={[0.078, 0.026, 0.022]} />
            <meshStandardMaterial color={BEARD} roughness={0.88} />
          </mesh>
          {/* Lips */}
          <mesh position={[0, -0.06, -0.154]} scale={[1, 0.4, 0.5]}>
            <boxGeometry args={[0.058, 0.02, 0.016]} />
            <meshStandardMaterial color="#b37357" roughness={0.7} />
          </mesh>
          {/* Chin beard patch */}
          <mesh position={[0, -0.095, -0.142]} scale={[1, 0.5, 0.5]}>
            <sphereGeometry args={[0.045, 12, 8]} />
            <meshStandardMaterial color={BEARD} roughness={0.88} />
          </mesh>
          {/* Jawline beard strips along left & right mandible */}
          {[-0.09, 0.09].map((bx, i) => (
            <mesh
              key={i}
              position={[bx, -0.07, -0.08]}
              rotation={[0.3, (i === 0 ? -0.4 : 0.4), (i === 0 ? 0.35 : -0.35)]}
            >
              <boxGeometry args={[0.028, 0.038, 0.12]} />
              <meshStandardMaterial color={BEARD} roughness={0.88} />
            </mesh>
          ))}

          {/* ── DARK RECTANGULAR-ROUNDED GLASSES ── */}
          <group position={[0, 0.024, -0.16]}>
            {/* Left lens frame */}
            <mesh position={[-0.055, 0, 0]}>
              <torusGeometry args={[0.04, 0.0065, 8, 16]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
            {/* Right lens frame */}
            <mesh position={[0.055, 0, 0]}>
              <torusGeometry args={[0.04, 0.0065, 8, 16]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
            {/* Nose bridge */}
            <mesh position={[0, 0.006, 0]}>
              <boxGeometry args={[0.035, 0.008, 0.006]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
            {/* Left lens glass (subtle blue reflection of Mac terminal) */}
            <mesh position={[-0.055, 0, 0.002]}>
              <planeGeometry args={[0.065, 0.05]} />
              <meshStandardMaterial
                color={GLASS_LENS}
                emissive="#38bdf8"
                emissiveIntensity={0.12}
                transparent
                opacity={0.28}
                roughness={0.05}
              />
            </mesh>
            {/* Right lens glass */}
            <mesh position={[0.055, 0, 0.002]}>
              <planeGeometry args={[0.065, 0.05]} />
              <meshStandardMaterial
                color={GLASS_LENS}
                emissive="#38bdf8"
                emissiveIntensity={0.12}
                transparent
                opacity={0.28}
                roughness={0.05}
              />
            </mesh>
            {/* Temple arms running back to ears */}
            <mesh position={[-0.11, 0, 0.09]} rotation={[0, 0.35, 0]}>
              <boxGeometry args={[0.006, 0.006, 0.17]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
            <mesh position={[0.11, 0, 0.09]} rotation={[0, -0.35, 0]}>
              <boxGeometry args={[0.006, 0.006, 0.17]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
          </group>

          {/* ── MEDIUM-LONG, THICK, VOLUMINOUS DARK WAVY HAIR ── */}
          {/* Hair Base Crown Dome */}
          <mesh position={[0, 0.11, -0.01]} scale={[1.12, 0.85, 1.1]}>
            <sphereGeometry args={[0.165, 20, 16]} />
            <meshStandardMaterial color={HAIR} roughness={0.92} />
          </mesh>

          {/* Top Wavy Locks & Texture */}
          {[
            { pos: [-0.07, 0.19, -0.04], rot: [0.2, -0.1, 0.3], s: [0.12, 0.06, 0.14] },
            { pos: [0.03, 0.21, -0.02], rot: [0.1, 0.1, -0.2], s: [0.14, 0.07, 0.16] },
            { pos: [0.08, 0.18, 0.04], rot: [-0.2, 0.2, -0.3], s: [0.12, 0.06, 0.14] },
            { pos: [-0.04, 0.2, 0.06], rot: [-0.1, -0.2, 0.1], s: [0.13, 0.06, 0.15] },
          ].map((w, i) => (
            <mesh key={i} position={w.pos as [number, number, number]} rotation={w.rot as [number, number, number]}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
          ))}

          {/* Soft Side-Swept Wavy Fringe / Bangs (across forehead over glasses) */}
          <group position={[0.02, 0.12, -0.13]}>
            <mesh rotation={[0.45, -0.25, 0.28]} scale={[1.2, 0.45, 0.7]}>
              <sphereGeometry args={[0.12, 14, 10]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
            <mesh position={[-0.06, -0.02, 0.01]} rotation={[0.3, -0.4, 0.4]} scale={[0.8, 0.35, 0.6]}>
              <sphereGeometry args={[0.09, 10, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
          </group>

          {/* Left Side Hair (covers ears, flowing wave) */}
          <group position={[-0.15, 0.03, 0.01]}>
            <mesh scale={[0.55, 1.0, 0.85]}>
              <sphereGeometry args={[0.14, 12, 10]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
            <mesh position={[-0.01, -0.08, 0.02]} rotation={[0, 0, 0.2]} scale={[0.4, 0.6, 0.6]}>
              <sphereGeometry args={[0.12, 10, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
          </group>

          {/* Right Side Hair (covers ears, flowing wave) */}
          <group position={[0.15, 0.03, 0.01]}>
            <mesh scale={[0.55, 1.0, 0.85]}>
              <sphereGeometry args={[0.14, 12, 10]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
            <mesh position={[0.01, -0.08, 0.02]} rotation={[0, 0, -0.2]} scale={[0.4, 0.6, 0.6]}>
              <sphereGeometry args={[0.12, 10, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
          </group>

          {/* Back Waves (thick, reaching down to nape of neck) */}
          <group position={[0, -0.01, 0.11]}>
            <mesh scale={[1.05, 1.0, 0.6]}>
              <sphereGeometry args={[0.165, 16, 12]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
            {/* Nape flare curls */}
            <mesh position={[0, -0.1, 0.02]} scale={[0.9, 0.5, 0.5]}>
              <sphereGeometry args={[0.14, 12, 10]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
