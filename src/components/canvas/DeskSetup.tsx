import { useMemo } from 'react'
import * as THREE from 'three'
import { useLampStore } from './lampStore'

// ─────────────────────────────────────────────────────────────────────────────
// DeskSetup — Iconic Anglepoise / Tolomeo Designer Architect Lamp
// - Stepped weighted circular brass base with rotary power switch
// - Twin parallel tubular struts for lower & upper articulated arms
// - Mechanical pivot joints with knurled wing nuts & chrome tension springs
// - Classic flared bell lampshade with enameled warm interior reflector
// - Glowing frosted spherical bulb emitting rich warm golden-amber light (#ffaa3b)
// - Clickable with pointer cursor to toggle warm glow (connected to useLampStore)
// ─────────────────────────────────────────────────────────────────────────────

const BRASS_GOLD   = '#d4af37' // Warm brushed brass
const BRASS_DARK   = '#997d26'
const CHROME_METAL = '#e2e8f0' // Polished chrome pivot pins & springs
const SHADE_INNER  = '#fff7ed' // Warm enameled interior reflector
const BASE_RUBBER  = '#111827'

// Helper to generate a realistic helical tension spring
function createHelicalSpring(radius: number, height: number, turns: number) {
  const pts: THREE.Vector3[] = []
  const steps = turns * 20
  for (let i = 0; i <= steps; i++) {
    const u = i / steps
    const angle = u * turns * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = u * height
    pts.push(new THREE.Vector3(x, y, z))
  }
  const curve = new THREE.CatmullRomCurve3(pts)
  return new THREE.TubeGeometry(curve, steps, 0.0022, 6, false)
}

export function ArticulatedDeskLamp({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const lampOn = useLampStore((s) => s.lampOn)
  const toggleLamp = useLampStore((s) => s.toggleLamp)

  // Spring geometries
  const spring1 = useMemo(() => createHelicalSpring(0.007, 0.22, 14), [])
  const spring2 = useMemo(() => createHelicalSpring(0.007, 0.20, 12), [])

  return (
    <group
      position={position}
      onClick={toggleLamp}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      {/* ═════════════════════════════════════════════════════════════════════
          1. STEPPED WEIGHTED CIRCULAR BASE
          ═════════════════════════════════════════════════════════════════════ */}
      {/* Dark rubber non-slip ring at bottom */}
      <mesh position={[0, 0.004, 0]}>
        <cylinderGeometry args={[0.096, 0.098, 0.008, 32]} />
        <meshStandardMaterial color={BASE_RUBBER} roughness={0.9} />
      </mesh>

      {/* Main beveled weighted brass base disc */}
      <mesh position={[0, 0.018, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.088, 0.095, 0.020, 32]} />
        <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} />
      </mesh>
      {/* Upper base stepped tier */}
      <mesh position={[0, 0.030, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.062, 0.012, 28]} />
        <meshStandardMaterial color={BRASS_DARK} metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Rotary On/Off switch knob on base */}
      <mesh position={[0.045, 0.034, 0.035]}>
        <cylinderGeometry args={[0.007, 0.008, 0.014, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Central swivel boss socket */}
      <mesh position={[0, 0.044, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.025, 0.018, 20]} />
        <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Lower fork bracket */}
      <group position={[0, 0.056, 0]}>
        {[-0.016, 0.016].map((x, i) => (
          <mesh key={i} position={[x, 0.018, 0]}>
            <boxGeometry args={[0.006, 0.036, 0.024]} />
            <meshStandardMaterial color={BRASS_DARK} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        {/* Lower pivot cross-bolt */}
        <mesh position={[0, 0.028, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.044, 12]} />
          <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Knurled adjustment thumbscrew */}
        <mesh position={[0.026, 0.028, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.008, 16]} />
          <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* ═════════════════════════════════════════════════════════════════════
          2. LOWER ARTICULATED ARM (Twin Parallel Brass Struts + Tension Spring)
          ═════════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0.084, 0]} rotation={[-0.22, 0, -0.42]}>
        {/* Twin parallel tubular struts */}
        {[-0.012, 0.012].map((x, i) => (
          <mesh key={i} position={[x, 0.17, 0]} castShadow>
            <cylinderGeometry args={[0.0055, 0.0055, 0.34, 12]} />
            <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} />
          </mesh>
        ))}
        {/* Mid-span strut spacer bracket */}
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.030, 0.014, 0.016]} />
          <meshStandardMaterial color={BRASS_DARK} metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Delicate chrome tension spring running parallel */}
        <mesh position={[0, 0.05, 0.016]} geometry={spring1}>
          <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
        </mesh>

        {/* ═════════════════════════════════════════════════════════════════
            3. ARTICULATED ELBOW JOINT (Circular Discs & Knurled Wing Nut)
            ═════════════════════════════════════════════════════════════════ */}
        <group position={[0, 0.34, 0]}>
          {/* Dual circular hinge plates */}
          {[-0.014, 0.014].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.018, 0.018, 0.005, 20]} />
              <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          {/* Central chrome hinge pin */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.006, 0.006, 0.046, 14]} />
            <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Large knurled adjustment wing nut on elbow */}
          <mesh position={[0.026, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 0.008, 18]} />
            <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0.028, 0, 0]}>
            <boxGeometry args={[0.006, 0.036, 0.010]} />
            <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.3} />
          </mesh>

          {/* ═════════════════════════════════════════════════════════════
              4. UPPER ARTICULATED ARM (Twin Struts Reaching Forward-Down)
              ═════════════════════════════════════════════════════════════ */}
          <group rotation={[0.35, 0, 0.72]}>
            {/* Twin upper tubular struts */}
            {[-0.012, 0.012].map((x, i) => (
              <mesh key={i} position={[x, 0.15, 0]} castShadow>
                <cylinderGeometry args={[0.005, 0.005, 0.30, 12]} />
                <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} />
              </mesh>
            ))}
            {/* Upper strut spacer bracket */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.028, 0.012, 0.014]} />
              <meshStandardMaterial color={BRASS_DARK} metalness={0.85} roughness={0.25} />
            </mesh>

            {/* Upper chrome tension spring */}
            <mesh position={[0, 0.04, -0.014]} geometry={spring2}>
              <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
            </mesh>

            {/* ═════════════════════════════════════════════════════════
                5. SWIVEL WRIST & CLASSIC BELL LAMPSHADE
                ═════════════════════════════════════════════════════════ */}
            <group position={[0, 0.30, 0]} rotation={[0.68, -0.42, 0.75]}>
              {/* Swivel neck bracket */}
              <mesh position={[0, 0.018, 0]}>
                <sphereGeometry args={[0.014, 14, 12]} />
                <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
              </mesh>
              <mesh position={[0, 0.034, 0]}>
                <cylinderGeometry args={[0.010, 0.012, 0.022, 16]} />
                <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.2} />
              </mesh>

              {/* Cylindrical socket housing with ventilation collar */}
              <group position={[0, 0.052, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.024, 0.026, 0.032, 20]} />
                  <meshStandardMaterial color={BRASS_DARK} metalness={0.88} roughness={0.25} />
                </mesh>
                {/* Ventilation ring */}
                <mesh position={[0, 0.010, 0]}>
                  <torusGeometry args={[0.026, 0.003, 8, 20]} />
                  <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
                </mesh>
              </group>

              {/* ── Flared Bell Lampshade Directed Downward at Workspace ── */}
              <group position={[0, 0.068, 0]}>
                {/* Rounded shade top dome */}
                <mesh position={[0, 0.015, 0]} castShadow>
                  <sphereGeometry args={[0.042, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.24} side={THREE.DoubleSide} />
                </mesh>

                {/* Gracefully flared bell cone */}
                <mesh position={[0, 0.075, 0]} castShadow>
                  <cylinderGeometry args={[0.042, 0.092, 0.12, 28, 1, true]} />
                  <meshStandardMaterial
                    color={BRASS_GOLD}
                    metalness={0.88}
                    roughness={0.24}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                {/* Rolled outer rim lip */}
                <mesh position={[0, 0.135, 0]}>
                  <torusGeometry args={[0.092, 0.004, 10, 28]} />
                  <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.2} />
                </mesh>

                {/* Interior warm enameled reflector lining */}
                <mesh position={[0, 0.074, 0]}>
                  <cylinderGeometry args={[0.041, 0.090, 0.116, 24, 1, true]} />
                  <meshStandardMaterial
                    color={SHADE_INNER}
                    emissive="#ffedd5"
                    emissiveIntensity={lampOn ? 0.35 : 0.02}
                    roughness={0.35}
                    side={THREE.BackSide}
                  />
                </mesh>

                {/* ── Frosted Glowing Light Bulb ── */}
                <mesh position={[0, 0.065, 0]}>
                  <sphereGeometry args={[0.032, 18, 16]} />
                  <meshStandardMaterial
                    color="#fffbeb"
                    emissive="#ffaa3b"
                    emissiveIntensity={lampOn ? 4.8 : 0.2}
                    roughness={0.1}
                  />
                </mesh>

                {/* Localized warm light spill right at the bulb */}
                {lampOn && (
                  <pointLight
                    color="#ffaa3b"
                    intensity={2.2}
                    distance={1.4}
                    decay={2}
                    castShadow={false}
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
