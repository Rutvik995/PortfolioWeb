import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// NightWindow — recessed window in back-left wall corner with draped curtains,
// and a contained city-skyline chamber behind the glass (no floating buildings)
// ─────────────────────────────────────────────────────────────────────────────

// Shared materials
const wallColor   = '#16122a'
const frameColor  = '#2a2730'
const sillColor   = '#1f1b30'
const curtainCol  = '#2d1a3e'   // deep plum

function WindowGlass({ w, h }: { w: number; h: number }) {
  return (
    <mesh position={[0, 0, 0.01]}>
      <planeGeometry args={[w - 0.09, h - 0.09]} />
      <meshPhysicalMaterial
        color="#a8c8ff"
        transparent
        opacity={0.14}
        roughness={0.04}
        metalness={0.06}
        transmission={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function CurtainPanel({ side }: { side: 'left' | 'right' }) {
  const sign = side === 'left' ? -1 : 1
  // Panel body
  return (
    <group position={[sign * 0.72, 0, 0.05]}>
      {/* Main drape body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.38, 2.2, 0.06]} />
        <meshStandardMaterial color={curtainCol} roughness={0.98} side={THREE.DoubleSide} />
      </mesh>
      {/* Pleat ridges (3 vertical folds) */}
      {[-0.08, 0, 0.08].map((dx, i) => (
        <mesh key={i} position={[dx, 0, 0.055]} castShadow>
          <boxGeometry args={[0.025, 2.1, 0.03]} />
          <meshStandardMaterial color={new THREE.Color(curtainCol).multiplyScalar(0.75)} roughness={0.98} />
        </mesh>
      ))}
      {/* Bottom hem weight */}
      <mesh position={[0, -1.06, 0.04]}>
        <boxGeometry args={[0.37, 0.025, 0.07]} />
        <meshStandardMaterial color={new THREE.Color(curtainCol).multiplyScalar(0.6)} roughness={0.9} />
      </mesh>
    </group>
  )
}

// City scene rendered inside a "chamber" clipped behind the window wall
function CityBackdrop() {
  // Sky
  return (
    <group position={[0, 0, -0.5]}>
      {/* Sky plane */}
      <mesh position={[0, 1.0, -4.5]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#040714" roughness={1} />
      </mesh>

      {/* Moon */}
      <mesh position={[0.5, 2.6, -4.0]}>
        <sphereGeometry args={[0.28, 24, 20]} />
        <meshStandardMaterial color="#fffde7" emissive="#fff9c4" emissiveIntensity={1.2} roughness={0.9} />
      </mesh>
      {/* Moon glow halo */}
      <mesh position={[0.5, 2.6, -4.0]}>
        <sphereGeometry args={[0.38, 16, 12]} />
        <meshStandardMaterial color="#c5d8ff" transparent opacity={0.08} roughness={1} />
      </mesh>
      <pointLight color="#6ea8fe" intensity={1.5} position={[0.5, 2.6, -3.9]} distance={12} decay={2} />

      {/* Stars */}
      {Array.from({ length: 60 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 8
        const y = 1.5 + Math.random() * 3.5
        const z = -3.5 - Math.random() * 1.0
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.012 + Math.random() * 0.016, 4, 4]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8 + Math.random() * 0.5} />
          </mesh>
        )
      })}

      {/* Buildings — strictly contained within window view */}
      {[
        { x: -1.4, h: 2.2, w: 0.5, z: -4.0 },
        { x: -0.8, h: 3.0, w: 0.4, z: -4.2 },
        { x: -0.3, h: 2.5, w: 0.55, z: -4.1 },
        { x:  0.3, h: 3.4, w: 0.45, z: -4.3 },
        { x:  0.9, h: 2.0, w: 0.5, z: -4.0 },
        { x:  1.4, h: 2.8, w: 0.4, z: -4.2 },
        // mid layer
        { x: -1.1, h: 1.6, w: 0.42, z: -3.5 },
        { x:  0.0, h: 2.1, w: 0.46, z: -3.6 },
        { x:  1.1, h: 1.8, w: 0.44, z: -3.5 },
      ].map((b, i) => (
        <group key={i} position={[b.x, b.h / 2 - 1.2, b.z]}>
          <mesh>
            <boxGeometry args={[b.w, b.h, 0.3]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#0f172a' : '#1e293b'} roughness={0.9} />
          </mesh>
          {/* Lit windows on building */}
          {Array.from({ length: Math.floor(b.h * 3) }).map((_, wi) => {
            const warm = Math.random() > 0.4
            return (
              <mesh key={wi} position={[(Math.random() - 0.5) * (b.w - 0.1), (wi * 0.28) - b.h / 2 + 0.2, 0.16]}>
                <boxGeometry args={[0.07, 0.1, 0.01]} />
                <meshStandardMaterial
                  color={warm ? '#ffb74d' : '#90caf9'}
                  emissive={warm ? '#ff9800' : '#4fc3f7'}
                  emissiveIntensity={1.4}
                />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

export function NightWindow() {
  // Window is in the back-left corner area of the room
  // Centered on the back wall (z = -2.95), slightly left-of-center
  const WW = 1.4   // window width
  const WH = 1.9   // window height
  const FT = 0.07  // frame thickness
  const WZ = -1.0  // horizontal center on back wall (local X in room space)
  const WY = 1.75  // vertical center

  return (
    <group position={[WZ, WY, -2.92]}>
      {/* ── Curtain Rod ── */}
      <mesh position={[0, WH / 2 + 0.14, 0.12]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.016, 0.016, WW + 0.9, 10]} />
        <meshStandardMaterial color="#8b6914" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Rod end finials */}
      {[-0.72, 0.72].map((dx, i) => (
        <mesh key={i} position={[dx, WH / 2 + 0.14, 0.12]}>
          <sphereGeometry args={[0.025, 10, 8]} />
          <meshStandardMaterial color="#c5a028" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* ── Curtains ── */}
      <group position={[0, 0.05, 0.09]}>
        <CurtainPanel side="left" />
        <CurtainPanel side="right" />
      </group>

      {/* ── Window Frame (outer border) ── */}
      {/* Top bar */}
      <mesh position={[0, WH / 2, 0]}>
        <boxGeometry args={[WW + FT * 2, FT, FT * 1.2]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Bottom bar */}
      <mesh position={[0, -WH / 2, 0]}>
        <boxGeometry args={[WW + FT * 2, FT, FT * 1.2]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Left post */}
      <mesh position={[-WW / 2 - FT / 2, 0, 0]}>
        <boxGeometry args={[FT, WH + FT, FT * 1.2]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Right post */}
      <mesh position={[WW / 2 + FT / 2, 0, 0]}>
        <boxGeometry args={[FT, WH + FT, FT * 1.2]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Centre vertical mullion */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[FT * 0.65, WH, FT * 0.65]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Centre horizontal transom */}
      <mesh position={[0, WH * 0.12, 0]}>
        <boxGeometry args={[WW, FT * 0.65, FT * 0.65]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.2} />
      </mesh>

      {/* ── Window Glass ── */}
      <WindowGlass w={WW} h={WH} />

      {/* ── Window Sill ── */}
      <mesh position={[0, -WH / 2 - 0.025, 0.08]} receiveShadow>
        <boxGeometry args={[WW + 0.22, 0.045, 0.22]} />
        <meshStandardMaterial color={sillColor} roughness={0.65} />
      </mesh>

      {/* ── Recessed wall reveal (depth around window) ── */}
      <mesh position={[0, 0, -0.09]}>
        <boxGeometry args={[WW + FT * 2 + 0.02, WH + FT * 2 + 0.02, 0.18]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>

      {/* ── City backdrop — rendered BEHIND the glass ── */}
      <group position={[0, 0, -0.22]}>
        <CityBackdrop />
      </group>
    </group>
  )
}
