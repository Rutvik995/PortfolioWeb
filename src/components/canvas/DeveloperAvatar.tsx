import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// DeveloperAvatar — Stylized 3D Developer (Exact Match to Image 5 & Photo 4)
// STRICT RULE: ZERO BoxGeometry anywhere on the character, clothes, or hair!
// Every part uses smooth organic curves: LatheGeometry, CapsuleGeometry,
// TubeGeometry (CatmullRomCurve3), TorusGeometry, and high-segment spheres.
// ─────────────────────────────────────────────────────────────────────────────

const SKIN          = '#c68b66' // Warm medium-tan skin
const BEARD         = '#1b1412'
const HAIR          = '#181210' // Voluminous dark brown-black wavy hair
const HOODIE        = '#4a3022' // Dark brown pullover hoodie from Image 5
const HOODIE_SHADOW = '#392215'
const GLASS_FRAME   = '#1a1d24'
const GLASS_LENS    = '#38bdf8'
const WATCH         = '#0f172a'
const JEANS         = '#1e293b' // Dark jeans from Image 5
const SNEAKER       = '#111827'
const SNEAKER_SOLE  = '#f8fafc'
const CHAIR_FRAME   = '#0a0d14'
const CHAIR_MESH    = '#161e2e'

// Helper to generate a smooth TubeGeometry from an array of 3D points
function createHairLock(points: [number, number, number][], radius = 0.016) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
  return new THREE.TubeGeometry(curve, 16, radius, 8, false)
}

function WavyHairSculpt() {
  // 16+ Sculpted CatmullRomCurve3 wavy locks (forehead fringe, ears, crown, nape)
  const hairTubes = useMemo(() => [
    // ── Forehead Side-Swept Wave (Sweeps right to left across forehead) ──
    createHairLock([[-0.08, 0.08, -0.11], [-0.03, 0.09, -0.14], [0.03, 0.065, -0.14], [0.08, 0.03, -0.12]], 0.02),
    createHairLock([[-0.06, 0.09, -0.10], [0.0, 0.10, -0.135], [0.06, 0.08, -0.135], [0.10, 0.045, -0.11]], 0.018),
    createHairLock([[-0.04, 0.07, -0.12], [0.02, 0.05, -0.135], [0.07, 0.02, -0.12]], 0.016),

    // ── Crown & Top Voluminous Texture Clumps ──
    createHairLock([[-0.06, 0.12, -0.05], [-0.04, 0.15, -0.01], [-0.02, 0.14, 0.04]], 0.024),
    createHairLock([[0.02, 0.13, -0.06], [0.04, 0.16, -0.01], [0.03, 0.14, 0.05]], 0.025),
    createHairLock([[-0.02, 0.14, -0.07], [0.0, 0.165, 0.0], [-0.01, 0.15, 0.07]], 0.026),
    createHairLock([[0.06, 0.11, -0.03], [0.08, 0.14, 0.02], [0.07, 0.12, 0.06]], 0.022),
    createHairLock([[-0.07, 0.11, -0.02], [-0.09, 0.135, 0.03], [-0.08, 0.115, 0.07]], 0.022),

    // ── Left Side Locks (Covering Top of Left Ear) ──
    createHairLock([[-0.09, 0.09, -0.04], [-0.13, 0.06, -0.01], [-0.14, 0.01, 0.02], [-0.13, -0.04, 0.04]], 0.022),
    createHairLock([[-0.08, 0.07, -0.06], [-0.12, 0.04, -0.03], [-0.135, -0.01, -0.01]], 0.018),
    createHairLock([[-0.10, 0.08, 0.02], [-0.13, 0.04, 0.05], [-0.12, -0.02, 0.07]], 0.02),

    // ── Right Side Locks (Covering Top of Right Ear — Clearly in Image 5 view!) ──
    createHairLock([[0.09, 0.09, -0.04], [0.13, 0.06, -0.01], [0.14, 0.01, 0.02], [0.13, -0.04, 0.04]], 0.022),
    createHairLock([[0.08, 0.07, -0.06], [0.12, 0.04, -0.03], [0.135, -0.01, -0.01]], 0.018),
    createHairLock([[0.10, 0.08, 0.02], [0.13, 0.04, 0.05], [0.12, -0.02, 0.07]], 0.02),

    // ── Back & Nape Wavy Flare (Tapering to Hoodie Collar) ──
    createHairLock([[-0.05, 0.09, 0.08], [-0.04, 0.04, 0.12], [-0.02, -0.03, 0.13]], 0.022),
    createHairLock([[0.05, 0.09, 0.08], [0.04, 0.04, 0.12], [0.02, -0.03, 0.13]], 0.022),
    createHairLock([[0.0, 0.10, 0.09], [0.0, 0.05, 0.13], [0.0, -0.04, 0.135]], 0.024),
  ], [])

  return (
    <group>
      {/* Fitted scalp volume dome */}
      <mesh position={[0, 0.04, 0.01]} scale={[1.05, 1.0, 1.05]}>
        <sphereGeometry args={[0.136, 24, 20]} />
        <meshStandardMaterial color={HAIR} roughness={0.94} />
      </mesh>

      {/* 16+ Curved tube wavy locks */}
      {hairTubes.map((geo, i) => (
        <mesh key={i} geometry={geo} castShadow>
          <meshStandardMaterial color={HAIR} roughness={0.92} />
        </mesh>
      ))}
    </group>
  )
}

function OrganicHoodieTorso() {
  // Lathe points creating a smooth organic tapered pullover hoodie profile
  const lathePoints = useMemo(() => {
    const pts: THREE.Vector2[] = []
    const count = 16
    for (let i = 0; i <= count; i++) {
      const v = i / count
      const y = -0.18 + v * 0.44
      // Flared rib at bottom, soft belly pouch, rounded shoulders at top
      const r = 0.22 - Math.pow(v - 0.35, 2) * 0.15 + (v > 0.85 ? -0.04 * (v - 0.85) : 0)
      pts.push(new THREE.Vector2(r, y))
    }
    return pts
  }, [])

  return (
    <group>
      {/* Smooth tapered hoodie body */}
      <mesh castShadow receiveShadow scale={[1.08, 1, 0.82]}>
        <latheGeometry args={[lathePoints, 24]} />
        <meshStandardMaterial color={HOODIE} roughness={0.88} />
      </mesh>

      {/* Thick rolled hood collar draped around neck & shoulders (Image 5) */}
      <mesh position={[0, 0.23, 0.06]} rotation={[0.45, 0, 0]} castShadow>
        <torusGeometry args={[0.135, 0.045, 12, 24]} />
        <meshStandardMaterial color={HOODIE_SHADOW} roughness={0.92} />
      </mesh>

      {/* Draped hood fold on back */}
      <mesh position={[0, 0.16, 0.14]} scale={[1.1, 0.7, 0.6]} castShadow>
        <sphereGeometry args={[0.11, 16, 14]} />
        <meshStandardMaterial color={HOODIE_SHADOW} roughness={0.94} />
      </mesh>

      {/* Kangaroo pocket front pouch curve */}
      <mesh position={[0, -0.02, -0.15]} rotation={[-0.08, 0, 0]} scale={[1.2, 0.65, 0.35]} castShadow>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial color={new THREE.Color(HOODIE).multiplyScalar(1.08)} roughness={0.88} />
      </mesh>
    </group>
  )
}

export function DeveloperAvatar() {
  const torsoRef = useRef<THREE.Group>(null!)
  const headRef  = useRef<THREE.Group>(null!)
  const lHandRef = useRef<THREE.Group>(null!)
  const rHandRef = useRef<THREE.Group>(null!)
  const lArmRef  = useRef<THREE.Group>(null!)
  const rArmRef  = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // 1. Natural breathing motion
    if (torsoRef.current) {
      const breathe = Math.sin(t * 1.3) * 0.007
      torsoRef.current.scale.set(1 + breathe * 0.4, 1 + breathe, 1 + breathe * 0.6)
      torsoRef.current.rotation.x = -0.04 + Math.sin(t * 1.3) * 0.003
    }

    // 2. Head shifting focus smoothly between primary code screen & secondary node graph (Image 5)
    if (headRef.current) {
      // Subtle rhythmic rotation looking between center screen and right monitor
      headRef.current.rotation.y = Math.sin(t * 0.45) * 0.14 - 0.04
      headRef.current.rotation.x = 0.07 + Math.sin(t * 0.65) * 0.03
      headRef.current.rotation.z = Math.sin(t * 0.3) * 0.015
    }

    // 3. Fluid alternating finger & hand typing motion over keyboard
    if (lHandRef.current && rHandRef.current && lArmRef.current && rArmRef.current) {
      const tapL = Math.sin(t * 9.5)
      const tapR = Math.sin(t * 9.5 + 2.3)

      lHandRef.current.position.y = tapL * 0.006
      rHandRef.current.position.y = tapR * 0.006

      lHandRef.current.rotation.x = -0.1 + tapL * 0.04
      rHandRef.current.rotation.x = -0.1 + tapR * 0.04

      lArmRef.current.rotation.x = -0.58 + tapL * 0.014
      rArmRef.current.rotation.x = -0.58 + tapR * 0.014
    }
  })

  return (
    // Seated in desk coordinate space (keyboard at x = -0.12, z = 0.14)
    <group position={[-0.12, 0, 0.48]}>

      {/* ═════════════════════════════════════════════════════════════════════════
          ERGONOMIC BLACK MESH OFFICE CHAIR (Image 5 Reference)
          ═════════════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0, 0]}>
        {/* 5-Star Caster Wheel Base */}
        <mesh position={[0, 0.038, 0]}>
          <cylinderGeometry args={[0.042, 0.048, 0.045, 16]} />
          <meshStandardMaterial color={CHAIR_FRAME} metalness={0.7} roughness={0.3} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh position={[0, 0.035, 0.16]} rotation={[0.08, 0, 0]}>
                <capsuleGeometry args={[0.014, 0.28, 6, 8]} />
                <meshStandardMaterial color={CHAIR_FRAME} metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Wheel */}
              <mesh position={[0, 0.02, 0.28]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.018, 10]} />
                <meshStandardMaterial color="#05070a" roughness={0.6} />
              </mesh>
            </group>
          )
        })}

        {/* Chrome Hydraulic Stem */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.32, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Contoured Ergonomic Seat Cushion */}
        <mesh position={[0, 0.43, -0.02]} castShadow receiveShadow scale={[1.1, 0.3, 1]}>
          <sphereGeometry args={[0.24, 20, 16]} />
          <meshStandardMaterial color={CHAIR_MESH} roughness={0.85} />
        </mesh>

        {/* Curved Mesh High Backrest (Image 5) */}
        <group position={[0, 0.72, 0.22]} rotation={[-0.08, 0, 0]}>
          {/* Outer curved frame tube */}
          <mesh castShadow scale={[1.15, 1.35, 0.3]}>
            <torusGeometry args={[0.22, 0.022, 12, 24]} />
            <meshStandardMaterial color={CHAIR_FRAME} metalness={0.6} roughness={0.35} />
          </mesh>
          {/* Breathable mesh membrane */}
          <mesh scale={[1.12, 1.32, 0.15]}>
            <sphereGeometry args={[0.21, 16, 12]} />
            <meshStandardMaterial color={CHAIR_MESH} roughness={0.95} />
          </mesh>
        </group>

        {/* Ergonomic Curved Armrests */}
        {[-0.26, 0.26].map((x, i) => (
          <group key={i} position={[x, 0.45, -0.02]}>
            <mesh position={[0, 0.11, 0]}>
              <cylinderGeometry args={[0.014, 0.016, 0.2, 10]} />
              <meshStandardMaterial color={CHAIR_FRAME} metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.21, 0.02]}>
              <capsuleGeometry args={[0.026, 0.22, 8, 12]} />
              <meshStandardMaterial color="#090c12" roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ═════════════════════════════════════════════════════════════════════════
          LOWER BODY (Dark Jeans & Sneakers — NO BoxGeometry)
          ═════════════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0.43, 0]}>
        {/* Pelvis & Hips */}
        <mesh position={[0, 0.06, -0.03]} castShadow scale={[1.1, 0.65, 1]}>
          <sphereGeometry args={[0.18, 16, 14]} />
          <meshStandardMaterial color={JEANS} roughness={0.88} />
        </mesh>

        {/* Legs / Jeans Capsules extending naturally under desk */}
        {[-0.12, 0.12].map((x, i) => (
          <group key={i}>
            {/* Thigh */}
            <mesh position={[x, 0.02, -0.16]} rotation={[1.48, 0, 0]} castShadow>
              <capsuleGeometry args={[0.076, 0.24, 10, 14]} />
              <meshStandardMaterial color={JEANS} roughness={0.88} />
            </mesh>
            {/* Lower Leg / Calf */}
            <mesh position={[x, -0.21, -0.32]} rotation={[-0.08, 0, 0]} castShadow>
              <capsuleGeometry args={[0.064, 0.26, 10, 14]} />
              <meshStandardMaterial color={JEANS} roughness={0.88} />
            </mesh>
            {/* Sneaker */}
            <group position={[x, -0.39, -0.32]}>
              <mesh castShadow scale={[0.9, 0.55, 1.4]}>
                <sphereGeometry args={[0.07, 12, 10]} />
                <meshStandardMaterial color={SNEAKER} roughness={0.7} />
              </mesh>
              {/* White Sole Curve */}
              <mesh position={[0, -0.024, 0]} scale={[0.94, 0.15, 1.44]}>
                <sphereGeometry args={[0.07, 12, 10]} />
                <meshStandardMaterial color={SNEAKER_SOLE} roughness={0.35} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* ═════════════════════════════════════════════════════════════════════════
          TORSO (Dark Brown Pullover Hoodie — Smooth Organic LatheGeometry)
          ═════════════════════════════════════════════════════════════════════════ */}
      <group ref={torsoRef} position={[0, 0.62, -0.02]}>
        {/* Organic lathe hoodie body */}
        <OrganicHoodieTorso />

        {/* Smooth Neck */}
        <mesh position={[0, 0.35, -0.02]} castShadow>
          <cylinderGeometry args={[0.058, 0.066, 0.11, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.68} />
        </mesh>

        {/* ─────────────────────────────────────────────────────────────────
            LEFT ARM & HAND (Typing on Keyboard + Black Smartwatch)
            ───────────────────────────────────────────────────────────────── */}
        <group ref={lArmRef} position={[-0.24, 0.27, -0.02]}>
          {/* Rounded shoulder */}
          <mesh position={[0, -0.02, 0]} castShadow>
            <sphereGeometry args={[0.084, 14, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.88} />
          </mesh>
          {/* Upper arm capsule */}
          <mesh position={[-0.02, -0.13, -0.04]} rotation={[0.42, 0, 0.1]} castShadow>
            <capsuleGeometry args={[0.068, 0.18, 10, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.88} />
          </mesh>
          {/* Forearm capsule angled down toward keyboard */}
          <mesh position={[-0.01, -0.28, -0.22]} rotation={[-0.64, 0.12, -0.14]} castShadow>
            <capsuleGeometry args={[0.058, 0.2, 10, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.88} />
          </mesh>

          {/* Left Hand & Black Smartwatch */}
          <group ref={lHandRef} position={[0.03, -0.38, -0.36]}>
            {/* Smartwatch torus band */}
            <mesh position={[0, 0.016, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.035, 0.009, 8, 16]} />
              <meshStandardMaterial color={WATCH} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Organic palm curve */}
            <mesh position={[0, 0, -0.03]} rotation={[-0.15, 0.1, 0]} castShadow scale={[1, 0.45, 1.1]}>
              <sphereGeometry args={[0.046, 12, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.65} />
            </mesh>
            {/* Typing fingers capsules */}
            {[-0.025, -0.007, 0.01, 0.027].map((fx, fi) => (
              <mesh key={fi} position={[fx, -0.01, -0.075]} rotation={[0.42, 0, 0]}>
                <capsuleGeometry args={[0.0065, 0.032, 6, 8]} />
                <meshStandardMaterial color={SKIN} roughness={0.65} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ─────────────────────────────────────────────────────────────────
            RIGHT ARM & HAND (Typing on Keyboard)
            ───────────────────────────────────────────────────────────────── */}
        <group ref={rArmRef} position={[0.24, 0.27, -0.02]}>
          {/* Rounded shoulder */}
          <mesh position={[0, -0.02, 0]} castShadow>
            <sphereGeometry args={[0.084, 14, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.88} />
          </mesh>
          {/* Upper arm capsule */}
          <mesh position={[0.02, -0.13, -0.04]} rotation={[0.42, 0, -0.1]} castShadow>
            <capsuleGeometry args={[0.068, 0.18, 10, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.88} />
          </mesh>
          {/* Forearm capsule */}
          <mesh position={[0.01, -0.28, -0.22]} rotation={[-0.64, -0.12, 0.14]} castShadow>
            <capsuleGeometry args={[0.058, 0.2, 10, 12]} />
            <meshStandardMaterial color={HOODIE} roughness={0.88} />
          </mesh>

          {/* Right Hand */}
          <group ref={rHandRef} position={[-0.03, -0.38, -0.36]}>
            {/* Organic palm curve */}
            <mesh position={[0, 0, -0.03]} rotation={[-0.15, -0.1, 0]} castShadow scale={[1, 0.45, 1.1]}>
              <sphereGeometry args={[0.046, 12, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.65} />
            </mesh>
            {/* Typing fingers capsules */}
            {[-0.027, -0.01, 0.007, 0.025].map((fx, fi) => (
              <mesh key={fi} position={[fx, -0.01, -0.075]} rotation={[0.42, 0, 0]}>
                <capsuleGeometry args={[0.0065, 0.032, 6, 8]} />
                <meshStandardMaterial color={SKIN} roughness={0.65} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ═════════════════════════════════════════════════════════════════
            HEAD, FACE & VOLUMINOUS WAVY HAIR (Matching Image 5 & Photo 4)
            ═════════════════════════════════════════════════════════════════ */}
        <group ref={headRef} position={[0, 0.52, -0.03]}>
          {/* Sculpted Organic Head (High-segment sphere with jaw taper) */}
          <mesh castShadow scale={[1, 1.12, 0.98]}>
            <sphereGeometry args={[0.136, 24, 20]} />
            <meshStandardMaterial color={SKIN} roughness={0.65} />
          </mesh>

          {/* Chin and Jaw Contour */}
          <mesh position={[0, -0.062, -0.048]} scale={[1, 0.7, 0.88]}>
            <sphereGeometry args={[0.096, 16, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.65} />
          </mesh>

          {/* Visible Sculpted Ears */}
          {[-0.138, 0.138].map((ex, i) => (
            <mesh key={i} position={[ex, 0.01, 0]} rotation={[0, (i === 0 ? -0.2 : 0.2), 0]} scale={[0.26, 0.55, 0.38]}>
              <sphereGeometry args={[0.065, 12, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.65} />
            </mesh>
          ))}

          {/* Defined Eyebrows */}
          <mesh position={[-0.046, 0.054, -0.13]} rotation={[0, 0, 0.08]}>
            <capsuleGeometry args={[0.006, 0.042, 6, 8]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>
          <mesh position={[0.046, 0.054, -0.13]} rotation={[0, 0, -0.08]}>
            <capsuleGeometry args={[0.006, 0.042, 6, 8]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>

          {/* Eyes (Stylized with warm pupils) */}
          {[-0.044, 0.044].map((ex, i) => (
            <group key={i} position={[ex, 0.018, -0.126]}>
              <mesh scale={[1, 0.65, 0.4]}>
                <sphereGeometry args={[0.02, 10, 8]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.1} />
              </mesh>
              <mesh position={[0, 0, -0.006]}>
                <sphereGeometry args={[0.011, 8, 6]} />
                <meshStandardMaterial color="#0f172a" roughness={0.2} />
              </mesh>
            </group>
          ))}

          {/* Smooth Nose Bridge */}
          <mesh position={[0, 0.002, -0.144]} rotation={[0.1, 0, 0]}>
            <coneGeometry args={[0.016, 0.044, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.65} />
          </mesh>

          {/* Neatly Trimmed Mustache & Jawline Beard Stubble */}
          <mesh position={[0, -0.036, -0.138]} scale={[1, 0.28, 0.35]}>
            <sphereGeometry args={[0.042, 12, 8]} />
            <meshStandardMaterial color={BEARD} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.08, -0.122]} scale={[1, 0.45, 0.45]}>
            <sphereGeometry args={[0.036, 12, 8]} />
            <meshStandardMaterial color={BEARD} roughness={0.9} />
          </mesh>
          {[-0.076, 0.076].map((bx, i) => (
            <mesh key={i} position={[bx, -0.058, -0.068]} rotation={[0.3, (i === 0 ? -0.4 : 0.4), (i === 0 ? 0.35 : -0.35)]}>
              <capsuleGeometry args={[0.014, 0.08, 6, 8]} />
              <meshStandardMaterial color={BEARD} roughness={0.9} />
            </mesh>
          ))}

          {/* ── DARK RECTANGULAR EYEGLASSES (Thin Frame with Translucent Lenses) ── */}
          <group position={[0, 0.018, -0.142]}>
            {/* Left lens rim torus */}
            <mesh position={[-0.046, 0, 0]}>
              <torusGeometry args={[0.034, 0.005, 6, 16]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
            {/* Right lens rim torus */}
            <mesh position={[0.046, 0, 0]}>
              <torusGeometry args={[0.034, 0.005, 6, 16]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
            {/* Bridge */}
            <mesh position={[0, 0.005, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.028, 8]} rotation={[0, 0, Math.PI / 2]} />
              <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
            </mesh>
            {/* Transparent reflective lenses */}
            {[-0.046, 0.046].map((lx, i) => (
              <mesh key={i} position={[lx, 0, 0.002]}>
                <circleGeometry args={[0.03, 16]} />
                <meshStandardMaterial
                  color={GLASS_LENS}
                  emissive="#38bdf8"
                  emissiveIntensity={0.16}
                  transparent
                  opacity={0.22}
                  roughness={0.05}
                />
              </mesh>
            ))}
            {/* Temple arms reaching back past ears */}
            {[-0.094, 0.094].map((tx, i) => (
              <mesh key={i} position={[tx, 0, 0.07]} rotation={[0, (i === 0 ? 0.32 : -0.32), 0]}>
                <cylinderGeometry args={[0.0025, 0.0025, 0.14, 6]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color={GLASS_FRAME} roughness={0.25} metalness={0.5} />
              </mesh>
            ))}
          </group>

          {/* ── SCULPTED VOLUMINOUS WAVY HAIR (16+ TubeGeometry locks — NO BoxGeometry!) ── */}
          <WavyHairSculpt />
        </group>
      </group>
    </group>
  )
}
