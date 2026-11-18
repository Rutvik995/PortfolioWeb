import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// DeveloperAvatar — Stylized 3D Character of Rutvik (Matching Photo 4)
// Features from Reference Photo:
// - Young Indian man, early 20s, lean build, warm medium-tan skin (#c98e6b)
// - Thick, voluminous dark brown-black wavy hair (#181210) with soft side-swept
//   bangs across forehead, side volume over ears, and natural nape curl.
//   (NO oversized spheres! Accurate, stylish proportioned geometry).
// - Dark rectangular eyeglasses (#1c212a) with subtle transparent reflection.
// - Neatly trimmed light mustache & short jawline beard (#221614).
// - Oversized dark brown pullover hoodie (#5e3829) with draped hood & kangaroo pocket.
// - Black smartwatch/fitness band on left wrist (#141416).
// - Modern ergonomic desk chair with 5-star base & mesh backrest.
// - Living animations: natural breathing, head shifting between screen & keys,
//   and active typing fingers over the mechanical keyboard.
// ─────────────────────────────────────────────────────────────────────────────

const SKIN = '#c98e6b'
const BEARD = '#221614'
const HAIR = '#181210'
const HOODIE = '#5e3829'           // Warm earthy chestnut brown from Photo 4
const HOODIE_SHADOW = '#4a2c20'
const HOODIE_POCKET = '#683f2e'
const GLASS_FRAME = '#1c212a'
const GLASS_LENS = '#38bdf8'
const WATCH = '#141416'
const PANTS = '#1b1e28'
const SNEAKER = '#13161f'
const SNEAKER_SOLE = '#e2e8f0'
const CHAIR_FRAME = '#111318'
const CHAIR_CUSHION = '#1e222e'
const CHAIR_METAL = '#64748b'

export function DeveloperAvatar() {
  const torsoRef = useRef<THREE.Group>(null!)
  const headRef = useRef<THREE.Group>(null!)
  const lHandRef = useRef<THREE.Group>(null!)
  const rHandRef = useRef<THREE.Group>(null!)
  const lArmRef = useRef<THREE.Group>(null!)
  const rArmRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // 1. Natural breathing motion (chest rise & slight forward posture)
    if (torsoRef.current) {
      const breathe = Math.sin(t * 1.3) * 0.007
      torsoRef.current.scale.set(1 + breathe * 0.4, 1 + breathe, 1 + breathe * 0.6)
      torsoRef.current.rotation.x = -0.05 + Math.sin(t * 1.3) * 0.004
    }

    // 2. Head motion: shifting focus naturally between screen and keys
    if (headRef.current) {
      headRef.current.rotation.x = 0.08 + Math.sin(t * 0.6) * 0.035
      headRef.current.rotation.y = Math.sin(t * 0.4) * 0.04
      headRef.current.rotation.z = Math.sin(t * 0.3) * 0.015
    }

    // 3. Fluid typing animation: alternating fingers & wrists tapping
    if (lHandRef.current && rHandRef.current && lArmRef.current && rArmRef.current) {
      const tapL = Math.sin(t * 9.0)
      const tapR = Math.sin(t * 9.0 + 2.2)

      lHandRef.current.position.y = tapL * 0.006
      rHandRef.current.position.y = tapR * 0.006

      lHandRef.current.rotation.x = -0.12 + tapL * 0.04
      rHandRef.current.rotation.x = -0.12 + tapR * 0.04

      lArmRef.current.rotation.x = -0.56 + tapL * 0.015
      rArmRef.current.rotation.x = -0.56 + tapR * 0.015
    }
  })

  return (
    // Seated in front of the desk (keyboard is at z = 0.15, monitor at z = -0.28)
    <group position={[0, 0, 0.46]}>

      {/* ═════════════════════════════════════════════════════════════════════════
          ERGONOMIC OFFICE CHAIR
          ═════════════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0, 0]}>
        {/* 5-Star Caster Wheel Base */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.04, 0.045, 0.05, 16]} />
          <meshStandardMaterial color={CHAIR_FRAME} metalness={0.7} roughness={0.3} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh position={[0, 0.038, 0.15]} rotation={[0.08, 0, 0]}>
                <boxGeometry args={[0.028, 0.022, 0.3]} />
                <meshStandardMaterial color={CHAIR_FRAME} metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Wheel */}
              <mesh position={[0, 0.02, 0.28]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.02, 10]} />
                <meshStandardMaterial color="#090a0e" roughness={0.7} />
              </mesh>
            </group>
          )
        })}

        {/* Chrome Hydraulic Cylinder */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.32, 16]} />
          <meshStandardMaterial color={CHAIR_METAL} metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Seat Tilt Box */}
        <mesh position={[0, 0.37, 0]}>
          <boxGeometry args={[0.2, 0.05, 0.22]} />
          <meshStandardMaterial color={CHAIR_FRAME} roughness={0.5} />
        </mesh>

        {/* Ergonomic Contoured Seat Cushion */}
        <mesh position={[0, 0.43, -0.02]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.075, 0.48]} />
          <meshStandardMaterial color={CHAIR_CUSHION} roughness={0.85} />
        </mesh>
        {/* Seat side bolsters */}
        {[-0.23, 0.23].map((x, i) => (
          <mesh key={i} position={[x, 0.46, -0.02]}>
            <boxGeometry args={[0.055, 0.045, 0.44]} />
            <meshStandardMaterial color={CHAIR_CUSHION} roughness={0.85} />
          </mesh>
        ))}

        {/* Backrest Spine Frame */}
        <mesh position={[0, 0.64, 0.23]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.05, 0.46, 0.03]} />
          <meshStandardMaterial color={CHAIR_FRAME} metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Breathable Mesh Backrest */}
        <mesh position={[0, 0.72, 0.24]} rotation={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.44, 0.54, 0.035]} />
          <meshStandardMaterial color={CHAIR_CUSHION} roughness={0.9} />
        </mesh>
        {/* Lumbar Support Pad */}
        <mesh position={[0, 0.58, 0.21]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.32, 0.1, 0.03]} />
          <meshStandardMaterial color={CHAIR_FRAME} roughness={0.6} />
        </mesh>

        {/* Armrest Supports & Padded Tops */}
        {[-0.26, 0.26].map((x, i) => (
          <group key={i} position={[x, 0.45, -0.02]}>
            <mesh position={[0, 0.11, 0]}>
              <cylinderGeometry args={[0.015, 0.016, 0.2, 10]} />
              <meshStandardMaterial color={CHAIR_FRAME} metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.21, 0.02]}>
              <boxGeometry args={[0.06, 0.022, 0.26]} />
              <meshStandardMaterial color="#0e1015" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ═════════════════════════════════════════════════════════════════════════
          LOWER BODY (Dark Tapered Joggers & Sneakers)
          ═════════════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0.43, 0]}>
        {/* Pelvis */}
        <mesh position={[0, 0.07, -0.03]} castShadow>
          <boxGeometry args={[0.38, 0.14, 0.38]} />
          <meshStandardMaterial color={PANTS} roughness={0.85} />
        </mesh>

        {/* Thighs extending forward toward keyboard */}
        {[-0.12, 0.12].map((x, i) => (
          <group key={i}>
            <mesh position={[x, 0.03, -0.16]} rotation={[1.48, 0, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.072, 0.34, 14]} />
              <meshStandardMaterial color={PANTS} roughness={0.85} />
            </mesh>
            {/* Knees */}
            <mesh position={[x, 0.02, -0.34]} castShadow>
              <sphereGeometry args={[0.076, 12, 10]} />
              <meshStandardMaterial color={PANTS} roughness={0.85} />
            </mesh>
            {/* Shins / Lower legs */}
            <mesh position={[x, -0.21, -0.33]} rotation={[-0.08, 0, 0]} castShadow>
              <cylinderGeometry args={[0.068, 0.058, 0.38, 14]} />
              <meshStandardMaterial color={PANTS} roughness={0.85} />
            </mesh>
            {/* Sneakers */}
            <group position={[x, -0.4, -0.32]}>
              <mesh castShadow>
                <boxGeometry args={[0.1, 0.055, 0.2]} />
                <meshStandardMaterial color={SNEAKER} roughness={0.7} />
              </mesh>
              {/* White Sole */}
              <mesh position={[0, -0.024, 0]}>
                <boxGeometry args={[0.105, 0.016, 0.21]} />
                <meshStandardMaterial color={SNEAKER_SOLE} roughness={0.35} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* ═════════════════════════════════════════════════════════════════════════
          TORSO (Oversized Earthy Brown Pullover Hoodie from Photo 4)
          ═════════════════════════════════════════════════════════════════════════ */}
      <group ref={torsoRef} position={[0, 0.6, -0.02]}>
        {/* Main Hoodie Body — Relaxed, chunky oversized drop-shoulder fit */}
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.44, 0.32]} />
          <meshStandardMaterial color={HOODIE} roughness={0.9} />
        </mesh>
        {/* Hoodie Bottom Rib Hem */}
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[0.45, 0.055, 0.3]} />
          <meshStandardMaterial color={HOODIE_SHADOW} roughness={0.95} />
        </mesh>

        {/* Kangaroo Pouch Pocket on Front */}
        <mesh position={[0, 0.05, -0.165]} rotation={[-0.06, 0, 0]} castShadow>
          <boxGeometry args={[0.32, 0.16, 0.035]} />
          <meshStandardMaterial color={HOODIE_POCKET} roughness={0.9} />
        </mesh>
        {/* Pocket Top Seam Line */}
        <mesh position={[0, 0.13, -0.18]}>
          <boxGeometry args={[0.3, 0.006, 0.005]} />
          <meshStandardMaterial color={HOODIE_SHADOW} />
        </mesh>

        {/* Sculpted Relaxed Hood Draped Around Collar & Shoulders */}
        <group position={[0, 0.32, 0.08]}>
          {/* Back hood roll */}
          <mesh rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.2, 0.12, 16]} />
            <meshStandardMaterial color={HOODIE_SHADOW} roughness={0.92} />
          </mesh>
          {/* Hood collar fold framing neck */}
          <mesh position={[0, 0.02, -0.16]} rotation={[-0.3, 0, 0]}>
            <torusGeometry args={[0.11, 0.03, 8, 16, Math.PI * 1.1]} />
            <meshStandardMaterial color={HOODIE} roughness={0.9} />
          </mesh>
          {/* Drawstrings */}
          {[-0.035, 0.035].map((dx, i) => (
            <mesh key={i} position={[dx, -0.05, -0.18]}>
              <cylinderGeometry args={[0.0035, 0.0035, 0.11, 6]} />
              <meshStandardMaterial color="#c8baa8" roughness={0.6} />
            </mesh>
          ))}
        </group>

        {/* Neck */}
        <mesh position={[0, 0.38, -0.02]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.12, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.7} />
        </mesh>

        {/* ─────────────────────────────────────────────────────────────────
            LEFT ARM & HAND (Typing on Keyboard + Black Smartwatch)
            ───────────────────────────────────────────────────────────────── */}
        <group ref={lArmRef} position={[-0.26, 0.29, -0.02]}>
          {/* Drop-shoulder hoodie sleeve cap */}
          <mesh position={[0, -0.03, 0]} castShadow>
            <sphereGeometry args={[0.088, 14, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.9} />
          </mesh>
          {/* Upper Arm */}
          <mesh position={[-0.02, -0.14, -0.04]} rotation={[0.42, 0, 0.1]} castShadow>
            <cylinderGeometry args={[0.074, 0.066, 0.24, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.9} />
          </mesh>
          {/* Elbow bend */}
          <mesh position={[-0.03, -0.25, -0.13]}>
            <sphereGeometry args={[0.066, 12, 10]} />
            <meshStandardMaterial color={HOODIE} roughness={0.9} />
          </mesh>
          {/* Forearm angled down toward keyboard */}
          <mesh position={[-0.01, -0.31, -0.24]} rotation={[-0.65, 0.12, -0.15]} castShadow>
            <cylinderGeometry args={[0.062, 0.054, 0.26, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.9} />
          </mesh>
          {/* Ribbed Sleeve Cuff */}
          <mesh position={[0.015, -0.38, -0.34]} rotation={[-0.65, 0.12, -0.15]}>
            <cylinderGeometry args={[0.05, 0.05, 0.035, 12]} />
            <meshStandardMaterial color={HOODIE_SHADOW} roughness={0.95} />
          </mesh>

          {/* Left Hand & Black Smartwatch */}
          <group ref={lHandRef} position={[0.03, -0.42, -0.39]}>
            {/* Black Smartwatch Band & Case (Pixel Watch from Photo 4) */}
            <mesh position={[0, 0.02, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.022, 16]} />
              <meshStandardMaterial color={WATCH} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.034, 0.035]}>
              <cylinderGeometry args={[0.022, 0.022, 0.006, 16]} />
              <meshStandardMaterial color="#04060a" metalness={0.95} roughness={0.05} />
            </mesh>
            {/* Hand Palm */}
            <mesh position={[0, 0, -0.035]} rotation={[-0.15, 0.1, 0]} castShadow>
              <boxGeometry args={[0.08, 0.03, 0.085]} />
              <meshStandardMaterial color={SKIN} roughness={0.65} />
            </mesh>
            {/* Curved Typing Fingers */}
            {[-0.026, -0.007, 0.011, 0.029].map((fx, fi) => (
              <mesh key={fi} position={[fx, -0.012, -0.082]} rotation={[0.42, 0, 0]}>
                <cylinderGeometry args={[0.007, 0.006, 0.04, 6]} />
                <meshStandardMaterial color={SKIN} roughness={0.65} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ─────────────────────────────────────────────────────────────────
            RIGHT ARM & HAND (Typing on Keyboard)
            ───────────────────────────────────────────────────────────────── */}
        <group ref={rArmRef} position={[0.26, 0.29, -0.02]}>
          {/* Drop-shoulder hoodie sleeve cap */}
          <mesh position={[0, -0.03, 0]} castShadow>
            <sphereGeometry args={[0.088, 14, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.9} />
          </mesh>
          {/* Upper Arm */}
          <mesh position={[0.02, -0.14, -0.04]} rotation={[0.42, 0, -0.1]} castShadow>
            <cylinderGeometry args={[0.074, 0.066, 0.24, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.9} />
          </mesh>
          {/* Elbow bend */}
          <mesh position={[0.03, -0.25, -0.13]}>
            <sphereGeometry args={[0.066, 12, 10]} />
            <meshStandardMaterial color={HOODIE} roughness={0.9} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0.01, -0.31, -0.24]} rotation={[-0.65, -0.12, 0.15]} castShadow>
            <cylinderGeometry args={[0.062, 0.054, 0.26, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.9} />
          </mesh>
          {/* Sleeve Cuff */}
          <mesh position={[-0.015, -0.38, -0.34]} rotation={[-0.65, -0.12, 0.15]}>
            <cylinderGeometry args={[0.05, 0.05, 0.035, 12]} />
            <meshStandardMaterial color={HOODIE_SHADOW} roughness={0.95} />
          </mesh>

          {/* Right Hand */}
          <group ref={rHandRef} position={[-0.03, -0.42, -0.39]}>
            {/* Hand Palm */}
            <mesh position={[0, 0, -0.035]} rotation={[-0.15, -0.1, 0]} castShadow>
              <boxGeometry args={[0.08, 0.03, 0.085]} />
              <meshStandardMaterial color={SKIN} roughness={0.65} />
            </mesh>
            {/* Curved Typing Fingers */}
            {[-0.029, -0.011, 0.007, 0.026].map((fx, fi) => (
              <mesh key={fi} position={[fx, -0.012, -0.082]} rotation={[0.42, 0, 0]}>
                <cylinderGeometry args={[0.007, 0.006, 0.04, 6]} />
                <meshStandardMaterial color={SKIN} roughness={0.65} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ═════════════════════════════════════════════════════════════════
            HEAD, FACE & ACCURATELY SCULPTED WAVY HAIR (Rutvik - Photo 4)
            ═════════════════════════════════════════════════════════════════ */}
        <group ref={headRef} position={[0, 0.56, -0.03]}>
          {/* Head Base Geometry (Natural Stylized Oval) */}
          <mesh castShadow scale={[1, 1.12, 0.98]}>
            <sphereGeometry args={[0.138, 20, 16]} />
            <meshStandardMaterial color={SKIN} roughness={0.65} />
          </mesh>

          {/* Jaw & Chin Shape */}
          <mesh position={[0, -0.065, -0.05]} scale={[1, 0.7, 0.88]}>
            <sphereGeometry args={[0.1, 14, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.65} />
          </mesh>

          {/* Ears (Visible, Framing the Face) */}
          {[-0.142, 0.142].map((ex, i) => (
            <mesh key={i} position={[ex, 0.01, 0]} rotation={[0, (i === 0 ? -0.2 : 0.2), 0]} scale={[0.28, 0.55, 0.4]}>
              <sphereGeometry args={[0.065, 10, 8]} />
              <meshStandardMaterial color={SKIN} roughness={0.65} />
            </mesh>
          ))}

          {/* ── EYEBROWS (Soft Arched Dark Brows) ── */}
          <mesh position={[-0.048, 0.056, -0.132]} rotation={[0, 0, 0.07]}>
            <boxGeometry args={[0.048, 0.01, 0.015]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>
          <mesh position={[0.048, 0.056, -0.132]} rotation={[0, 0, -0.07]}>
            <boxGeometry args={[0.048, 0.01, 0.015]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>

          {/* ── EYES (Stylized with Warm Pupils) ── */}
          {[-0.046, 0.046].map((ex, i) => (
            <group key={i} position={[ex, 0.02, -0.128]}>
              <mesh scale={[1, 0.65, 0.4]}>
                <sphereGeometry args={[0.022, 10, 8]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.1} />
              </mesh>
              <mesh position={[0, 0, -0.007]}>
                <sphereGeometry args={[0.012, 8, 6]} />
                <meshStandardMaterial color="#120c0a" roughness={0.2} />
              </mesh>
            </group>
          ))}

          {/* ── NOSE ── */}
          <mesh position={[0, 0.002, -0.148]}>
            <coneGeometry args={[0.018, 0.048, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.65} />
          </mesh>

          {/* ── MUSTACHE & JAWLINE BEARD (Neat & Light, from Photo 4) ── */}
          {/* Mustache strip above upper lip */}
          <mesh position={[0, -0.038, -0.142]} scale={[1, 0.3, 0.35]}>
            <boxGeometry args={[0.068, 0.022, 0.018]} />
            <meshStandardMaterial color={BEARD} roughness={0.88} />
          </mesh>
          {/* Lower lip */}
          <mesh position={[0, -0.052, -0.138]} scale={[1, 0.35, 0.4]}>
            <boxGeometry args={[0.05, 0.016, 0.014]} />
            <meshStandardMaterial color="#b37357" roughness={0.7} />
          </mesh>
          {/* Chin stubble */}
          <mesh position={[0, -0.082, -0.126]} scale={[1, 0.45, 0.45]}>
            <sphereGeometry args={[0.038, 10, 8]} />
            <meshStandardMaterial color={BEARD} roughness={0.88} />
          </mesh>
          {/* Jawline beard strips along left & right mandible */}
          {[-0.078, 0.078].map((bx, i) => (
            <mesh
              key={i}
              position={[bx, -0.06, -0.07]}
              rotation={[0.3, (i === 0 ? -0.4 : 0.4), (i === 0 ? 0.35 : -0.35)]}
            >
              <boxGeometry args={[0.024, 0.032, 0.1]} />
              <meshStandardMaterial color={BEARD} roughness={0.88} />
            </mesh>
          ))}

          {/* ── DARK RECTANGULAR EYEGLASSES (from Photo 4) ── */}
          <group position={[0, 0.02, -0.145]}>
            {/* Left lens frame */}
            <mesh position={[-0.048, 0, 0]}>
              <torusGeometry args={[0.035, 0.0055, 6, 16]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
            {/* Right lens frame */}
            <mesh position={[0.048, 0, 0]}>
              <torusGeometry args={[0.035, 0.0055, 6, 16]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
            {/* Bridge */}
            <mesh position={[0, 0.005, 0]}>
              <boxGeometry args={[0.03, 0.006, 0.005]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
            {/* Left transparent lens */}
            <mesh position={[-0.048, 0, 0.002]}>
              <planeGeometry args={[0.056, 0.044]} />
              <meshStandardMaterial
                color={GLASS_LENS}
                emissive="#38bdf8"
                emissiveIntensity={0.14}
                transparent
                opacity={0.22}
                roughness={0.05}
              />
            </mesh>
            {/* Right transparent lens */}
            <mesh position={[0.048, 0, 0.002]}>
              <planeGeometry args={[0.056, 0.044]} />
              <meshStandardMaterial
                color={GLASS_LENS}
                emissive="#38bdf8"
                emissiveIntensity={0.14}
                transparent
                opacity={0.22}
                roughness={0.05}
              />
            </mesh>
            {/* Temple arms */}
            <mesh position={[-0.096, 0, 0.075]} rotation={[0, 0.35, 0]}>
              <boxGeometry args={[0.005, 0.005, 0.15]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
            <mesh position={[0.096, 0, 0.075]} rotation={[0, -0.35, 0]}>
              <boxGeometry args={[0.005, 0.005, 0.15]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
          </group>

          {/* ═════════════════════════════════════════════════════════════════
              RUTVIK'S WAVY HAIR (PROPORTIONED, TEXTURED & ACCURATE TO PHOTO 4)
              ═════════════════════════════════════════════════════════════════ */}
          {/* Scalp Cap Fitting the Head */}
          <mesh position={[0, 0.035, 0.01]} scale={[1.08, 0.95, 1.05]}>
            <sphereGeometry args={[0.138, 16, 14]} />
            <meshStandardMaterial color={HAIR} roughness={0.92} />
          </mesh>

          {/* Top Volume & Layered Waves */}
          {[
            { p: [-0.03, 0.11, -0.02], s: [0.12, 0.045, 0.11], r: [0.1, 0, 0.1] },
            { p: [0.03, 0.12, 0.01], s: [0.13, 0.05, 0.12], r: [-0.1, 0.1, -0.1] },
            { p: [-0.01, 0.13, 0.04], s: [0.11, 0.045, 0.11], r: [0.15, -0.1, 0] },
            { p: [0.05, 0.11, -0.04], s: [0.1, 0.04, 0.09], r: [0.2, 0.15, -0.2] },
          ].map((w, i) => (
            <mesh
              key={i}
              position={w.p as [number, number, number]}
              rotation={w.r as [number, number, number]}
              scale={w.s as [number, number, number]}
            >
              <sphereGeometry args={[0.6, 10, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
          ))}

          {/* Soft Side-Swept Bangs Across Forehead (Key Photo 4 Feature!) */}
          <group position={[0.01, 0.075, -0.105]}>
            {/* Primary sweep clumping right to left over forehead */}
            <mesh rotation={[0.35, -0.2, 0.22]} scale={[0.12, 0.036, 0.06]}>
              <sphereGeometry args={[0.5, 10, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
            <mesh position={[-0.04, -0.012, 0.01]} rotation={[0.2, -0.35, 0.3]} scale={[0.08, 0.028, 0.05]}>
              <sphereGeometry args={[0.5, 10, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
            <mesh position={[0.04, 0.01, -0.005]} rotation={[0.4, -0.1, 0.15]} scale={[0.09, 0.03, 0.055]}>
              <sphereGeometry args={[0.5, 10, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
          </group>

          {/* Left Side Hair (Covers upper ear, natural wave taper) */}
          <group position={[-0.13, 0.02, 0.01]}>
            <mesh scale={[0.04, 0.08, 0.07]}>
              <sphereGeometry args={[0.7, 10, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
            <mesh position={[-0.01, -0.05, 0.01]} rotation={[0, 0, 0.15]} scale={[0.03, 0.05, 0.05]}>
              <sphereGeometry args={[0.6, 8, 6]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
          </group>

          {/* Right Side Hair (Covers upper ear) */}
          <group position={[0.13, 0.02, 0.01]}>
            <mesh scale={[0.04, 0.08, 0.07]}>
              <sphereGeometry args={[0.7, 10, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
            <mesh position={[0.01, -0.05, 0.01]} rotation={[0, 0, -0.15]} scale={[0.03, 0.05, 0.05]}>
              <sphereGeometry args={[0.6, 8, 6]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
          </group>

          {/* Back & Nape Waves (Flowing down naturally toward hoodie collar) */}
          <group position={[0, -0.01, 0.09]}>
            <mesh scale={[0.1, 0.09, 0.05]}>
              <sphereGeometry args={[0.9, 12, 10]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
            <mesh position={[0, -0.07, 0.02]} scale={[0.08, 0.04, 0.04]}>
              <sphereGeometry args={[0.8, 10, 8]} />
              <meshStandardMaterial color={HAIR} roughness={0.92} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
