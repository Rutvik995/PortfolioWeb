import { useMemo } from 'react'
import * as THREE from 'three'
import { useLampStore } from './lampStore'

// ─────────────────────────────────────────────────────────────────────────────
// DeskSetup — Iconic Anglepoise / Tolomeo Designer Architect Drafting Lamp
// - Stepped weighted circular brass base with rotary switch
// - Twin parallel tubular brass struts for articulated lower & upper arms
// - Mechanical elbow joint with circular hinge plates, wing nut & tension springs
// - Flared bell lampshade angled downward toward the desk workspace
// - Frosted glowing warm amber bulb emitting cozy golden light (#ffaa3b)
// - Interactive toggle via useLampStore
// ─────────────────────────────────────────────────────────────────────────────

const BRASS_GOLD   = '#d4af37' // Polished warm brass
const BRASS_DARK   = '#997d26' // Antique brass accents
const CHROME_METAL = '#e2e8f0' // Polished steel / chrome springs
const SHADE_INNER  = '#fffbeb' // Warm enameled reflector
const BASE_RUBBER  = '#0f172a'

function createSpring(radius: number, height: number, turns: number) {
  const pts: THREE.Vector3[] = []
  const steps = turns * 16
  for (let i = 0; i <= steps; i++) {
    const u = i / steps
    const angle = u * turns * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = u * height
    pts.push(new THREE.Vector3(x, y, z))
  }
  const curve = new THREE.CatmullRomCurve3(pts)
  return new THREE.TubeGeometry(curve, steps, 0.002, 6, false)
}

export function ArticulatedDeskLamp({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const lampOn = useLampStore((s) => s.lampOn)
  const toggleLamp = useLampStore((s) => s.toggleLamp)

  const spring1 = useMemo(() => createSpring(0.0065, 0.22, 14), [])
  const spring2 = useMemo(() => createSpring(0.0065, 0.20, 12), [])

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={toggleLamp}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      {/* ── 1. Weighted Circular Base ── */}
      {/* Rubber anti-slip pad */}
      <mesh position={[0, 0.004, 0]}>
        <cylinderGeometry args={[0.088, 0.090, 0.008, 32]} />
        <meshStandardMaterial color={BASE_RUBBER} roughness={0.9} />
      </mesh>
      {/* Heavy beveled brass base */}
      <mesh position={[0, 0.016, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.082, 0.088, 0.016, 32]} />
        <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} />
      </mesh>
      {/* Stepped center tier */}
      <mesh position={[0, 0.028, 0]} castShadow>
        <cylinderGeometry args={[0.048, 0.054, 0.012, 28]} />
        <meshStandardMaterial color={BRASS_DARK} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Red accent rotary switch on base */}
      <mesh position={[0.042, 0.034, 0.032]}>
        <cylinderGeometry args={[0.0065, 0.0075, 0.012, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Swivel socket boss */}
      <mesh position={[0, 0.042, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, 0.016, 20]} />
        <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ── 2. Lower Bracket & Swivel Fork ── */}
      <group position={[0, 0.050, 0]}>
        {[-0.014, 0.014].map((x, i) => (
          <mesh key={i} position={[x, 0.016, 0]}>
            <boxGeometry args={[0.005, 0.032, 0.022]} />
            <meshStandardMaterial color={BRASS_DARK} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        {/* Pivot pin */}
        <mesh position={[0, 0.024, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.0045, 0.0045, 0.038, 12]} />
          <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Adjustment knob */}
        <mesh position={[0.022, 0.024, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.010, 0.010, 0.007, 16]} />
          <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.25} />
        </mesh>
      </group>

      {/* ── 3. Lower Articulated Arm (twin struts leaning inward) ── */}
      <group position={[0, 0.074, 0]} rotation={[-0.15, 0, -0.38]}>
        {/* Twin parallel tubular struts */}
        {[-0.010, 0.010].map((x, i) => (
          <mesh key={i} position={[x, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.30, 12]} />
            <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} />
          </mesh>
        ))}
        {/* Strut bracket spacer */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.026, 0.012, 0.014]} />
          <meshStandardMaterial color={BRASS_DARK} metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Tension spring */}
        <mesh position={[0, 0.04, 0.014]} geometry={spring1}>
          <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
        </mesh>

        {/* ── 4. Articulated Elbow Joint ── */}
        <group position={[0, 0.30, 0]}>
          {/* Circular hinge plates */}
          {[-0.012, 0.012].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.016, 0.016, 0.004, 20]} />
              <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          {/* Central hinge pin */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 0.038, 14]} />
            <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Wing nut on elbow */}
          <mesh position={[0.024, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.013, 0.013, 0.007, 18]} />
            <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.25} />
          </mesh>

          {/* ── 5. Upper Articulated Arm (reaching forward-down over the desk) ── */}
          <group rotation={[0.25, 0, 0.65]}>
            {/* Twin upper struts */}
            {[-0.010, 0.010].map((x, i) => (
              <mesh key={i} position={[x, 0.14, 0]} castShadow>
                <cylinderGeometry args={[0.0045, 0.0045, 0.28, 12]} />
                <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} />
              </mesh>
            ))}
            {/* Upper strut spacer */}
            <mesh position={[0, 0.14, 0]}>
              <boxGeometry args={[0.024, 0.010, 0.012]} />
              <meshStandardMaterial color={BRASS_DARK} metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Upper tension spring */}
            <mesh position={[0, 0.03, -0.012]} geometry={spring2}>
              <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
            </mesh>

            {/* ── 6. Swivel Wrist & Flared Bell Lampshade ── */}
            <group position={[0, 0.28, 0]} rotation={[0.45, -0.25, 0.60]}>
              {/* Swivel neck ball */}
              <mesh position={[0, 0.015, 0]}>
                <sphereGeometry args={[0.012, 14, 12]} />
                <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
              </mesh>
              {/* Socket cylinder */}
              <mesh position={[0, 0.032, 0]} castShadow>
                <cylinderGeometry args={[0.018, 0.020, 0.026, 20]} />
                <meshStandardMaterial color={BRASS_DARK} metalness={0.88} roughness={0.25} />
              </mesh>

              {/* ── Flared Bell Shade (Pointing Downward) ── */}
              <group position={[0, 0.045, 0]} rotation={[Math.PI, 0, 0]}>
                {/* Rounded top dome of the shade */}
                <mesh position={[0, -0.015, 0]} castShadow>
                  <sphereGeometry args={[0.034, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} side={THREE.DoubleSide} />
                </mesh>

                {/* Graceful flared bell body */}
                <mesh position={[0, 0.045, 0]} castShadow>
                  <cylinderGeometry args={[0.034, 0.082, 0.09, 28, 1, true]} />
                  <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} side={THREE.DoubleSide} />
                </mesh>

                {/* Interior warm enameled reflector lining */}
                <mesh position={[0, 0.045, 0]}>
                  <cylinderGeometry args={[0.033, 0.080, 0.088, 24, 1, true]} />
                  <meshStandardMaterial
                    color={SHADE_INNER}
                    emissive="#ffedd5"
                    emissiveIntensity={lampOn ? 0.45 : 0.02}
                    roughness={0.3}
                    side={THREE.BackSide}
                  />
                </mesh>

                {/* Rolled outer rim lip */}
                <mesh position={[0, 0.090, 0]}>
                  <torusGeometry args={[0.082, 0.0035, 10, 28]} />
                  <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.2} />
                </mesh>

                {/* Frosted glowing warm amber bulb */}
                <mesh position={[0, 0.042, 0]}>
                  <sphereGeometry args={[0.028, 18, 16]} />
                  <meshStandardMaterial
                    color="#fffbeb"
                    emissive="#ffaa3b"
                    emissiveIntensity={lampOn ? 5.2 : 0.2}
                    roughness={0.1}
                  />
                </mesh>

                {/* Core warm key light cast directly from the lamp shade */}
                {lampOn && (
                  <pointLight
                    color="#ffaa3b"
                    intensity={4.8}
                    distance={6.0}
                    decay={1.6}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                    shadow-bias={-0.0004}
                  />
                )}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

export function DeskSetup() {
  return null
}
