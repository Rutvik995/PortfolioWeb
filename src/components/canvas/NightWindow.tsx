import * as THREE from 'three'

// ────────────────────────────────────────────────────────────
// NightWindow — large window in the left side wall with
// curtains, moonlit glass, and city view beyond.
// ────────────────────────────────────────────────────────────

export function NightWindow() {
  const glassRef = { color: '#a8c8ff' } // just for reference

  // Window is centered on the left wall (x = -2.95), facing +X
  const WX = -2.94   // just inside left wall
  const WY = 1.6     // window vertical center
  const WZ = -0.5    // horizontal center on wall

  const W = 1.5  // window width
  const H = 2.0  // window height
  const T = 0.06 // frame thickness

  const frameMat = { color: '#2d2d2d', roughness: 0.5, metalness: 0.3 } as const
  const glassMat = {
    color: glassRef.color,
    transparent: true,
    opacity: 0.18,
    roughness: 0.05,
    metalness: 0.1,
  } as const
  const curtainMatL = { color: '#2d1b4e', roughness: 0.95 } as const
  const curtainMatR = { color: '#2d1b4e', roughness: 0.95 } as const

  return (
    <group>
      {/* Curtain rod */}
      <mesh position={[WX + 0.02, WY + H / 2 + 0.12, WZ]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, W + 0.6, 8]} />
        <meshStandardMaterial color="#8b6914" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Left curtain */}
      <mesh position={[WX + 0.02, WY, WZ - W / 2 - 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.04, H + 0.3, 0.38]} />
        <meshStandardMaterial {...curtainMatL} />
      </mesh>
      {/* Left curtain drape (slight forward fold) */}
      <mesh position={[WX + 0.06, WY, WZ - W / 2 - 0.02]} rotation={[0, 0.08, 0]}>
        <boxGeometry args={[0.04, H + 0.1, 0.22]} />
        <meshStandardMaterial {...curtainMatL} />
      </mesh>

      {/* Right curtain */}
      <mesh position={[WX + 0.02, WY, WZ + W / 2 + 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.04, H + 0.3, 0.38]} />
        <meshStandardMaterial {...curtainMatR} />
      </mesh>
      {/* Right curtain drape */}
      <mesh position={[WX + 0.06, WY, WZ + W / 2 + 0.02]} rotation={[0, -0.08, 0]}>
        <boxGeometry args={[0.04, H + 0.1, 0.22]} />
        <meshStandardMaterial {...curtainMatR} />
      </mesh>

      {/* Window frame — top bar */}
      <mesh position={[WX + 0.02, WY + H / 2, WZ]}>
        <boxGeometry args={[T, T, W + T * 2]} />
        <meshStandardMaterial {...frameMat} />
      </mesh>
      {/* Window frame — bottom bar */}
      <mesh position={[WX + 0.02, WY - H / 2, WZ]}>
        <boxGeometry args={[T, T, W + T * 2]} />
        <meshStandardMaterial {...frameMat} />
      </mesh>
      {/* Window frame — left post */}
      <mesh position={[WX + 0.02, WY, WZ - W / 2]}>
        <boxGeometry args={[T, H, T]} />
        <meshStandardMaterial {...frameMat} />
      </mesh>
      {/* Window frame — right post */}
      <mesh position={[WX + 0.02, WY, WZ + W / 2]}>
        <boxGeometry args={[T, H, T]} />
        <meshStandardMaterial {...frameMat} />
      </mesh>
      {/* Centre mullion (vertical divider) */}
      <mesh position={[WX + 0.02, WY, WZ]}>
        <boxGeometry args={[T * 0.6, H, T * 0.6]} />
        <meshStandardMaterial {...frameMat} />
      </mesh>
      {/* Centre mullion (horizontal divider) */}
      <mesh position={[WX + 0.02, WY + 0.1, WZ]}>
        <boxGeometry args={[T * 0.6, T * 0.6, W]} />
        <meshStandardMaterial {...frameMat} />
      </mesh>

      {/* Window glass panes (2 panes) */}
      <mesh position={[WX + 0.04, WY, WZ - W / 4]}>
        <planeGeometry args={[W / 2 - T, H - T]} />
        <meshPhysicalMaterial
          {...glassMat}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[WX + 0.04, WY, WZ + W / 4]}>
        <planeGeometry args={[W / 2 - T, H - T]} />
        <meshPhysicalMaterial
          {...glassMat}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Windowsill */}
      <mesh position={[WX + 0.1, WY - H / 2 - 0.03, WZ]} receiveShadow>
        <boxGeometry args={[0.18, 0.04, W + 0.2]} />
        <meshStandardMaterial color="#1a1528" roughness={0.7} />
      </mesh>
    </group>
  )
}
