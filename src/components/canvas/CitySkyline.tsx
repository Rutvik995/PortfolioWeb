import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ───────────────────────────────────────────────────────────
// City Skyline — rendered entirely outside the room window
// Uses InstancedMesh for building windows (single draw call)
// ───────────────────────────────────────────────────────────

function Moon() {
  const meshRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = 6.5 + Math.sin(clock.getElapsedTime() * 0.2) * 0.05
    }
  })
  return (
    <group>
      <mesh ref={meshRef} position={[-5, 6.5, -18]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color="#fffde7"
          emissive="#fff9c4"
          emissiveIntensity={0.8}
          roughness={0.9}
        />
      </mesh>
      {/* Moonlight halo — a soft point light at the moon */}
      <pointLight
        color="#6ea8fe"
        intensity={1.2}
        position={[-5, 6.5, -18]}
        distance={30}
        decay={2}
      />
    </group>
  )
}

interface BuildingData {
  x: number
  z: number
  w: number
  h: number
  d: number
}

function Buildings({ buildings }: { buildings: BuildingData[] }) {
  return (
    <>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2 - 0.5, b.z]} castShadow={false}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            color={new THREE.Color().setHSL(0.62, 0.15, 0.08 + Math.random() * 0.06)}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
    </>
  )
}

function BuildingWindows({ buildings }: { buildings: BuildingData[] }) {
  const { dummy, geometry, materials, instances } = useMemo(() => {
    const wins: Array<{ x: number; y: number; z: number; warm: boolean }> = []
    for (const b of buildings) {
      const cols = Math.floor(b.w / 0.22)
      const rows = Math.floor(b.h / 0.28)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() < 0.55) {
            wins.push({
              x: b.x - b.w / 2 + 0.11 + c * 0.22,
              y: 0.14 + r * 0.28,
              z: b.z + b.d / 2 + 0.01,
              warm: Math.random() < 0.6,
            })
          }
        }
      }
    }
    const warm = wins.filter((w) => w.warm)
    const cool = wins.filter((w) => !w.warm)
    const geo = new THREE.BoxGeometry(0.1, 0.14, 0.01)
    const matWarm = new THREE.MeshStandardMaterial({
      color: '#ffb74d',
      emissive: '#ff9800',
      emissiveIntensity: 1.2,
    })
    const matCool = new THREE.MeshStandardMaterial({
      color: '#90caf9',
      emissive: '#4fc3f7',
      emissiveIntensity: 1.0,
    })
    return { dummy: new THREE.Object3D(), geometry: geo, materials: { matWarm, matCool }, instances: { warm, cool } }
  }, [buildings])

  const warmRef = useRef<THREE.InstancedMesh>(null!)
  const coolRef = useRef<THREE.InstancedMesh>(null!)

  useMemo(() => {
    // Set warm window matrices
    setTimeout(() => {
      if (!warmRef.current) return
      instances.warm.forEach((w, i) => {
        dummy.position.set(w.x, w.y, w.z)
        dummy.updateMatrix()
        warmRef.current.setMatrixAt(i, dummy.matrix)
      })
      warmRef.current.instanceMatrix.needsUpdate = true

      if (!coolRef.current) return
      instances.cool.forEach((w, i) => {
        dummy.position.set(w.x, w.y, w.z)
        dummy.updateMatrix()
        coolRef.current.setMatrixAt(i, dummy.matrix)
      })
      coolRef.current.instanceMatrix.needsUpdate = true
    }, 0)
  }, [dummy, instances])

  return (
    <>
      <instancedMesh
        ref={warmRef}
        args={[geometry, materials.matWarm, instances.warm.length]}
        onUpdate={(self) => {
          instances.warm.forEach((w, i) => {
            dummy.position.set(w.x, w.y, w.z)
            dummy.updateMatrix()
            self.setMatrixAt(i, dummy.matrix)
          })
          self.instanceMatrix.needsUpdate = true
        }}
      />
      <instancedMesh
        ref={coolRef}
        args={[geometry, materials.matCool, instances.cool.length]}
        onUpdate={(self) => {
          instances.cool.forEach((w, i) => {
            dummy.position.set(w.x, w.y, w.z)
            dummy.updateMatrix()
            self.setMatrixAt(i, dummy.matrix)
          })
          self.instanceMatrix.needsUpdate = true
        }}
      />
    </>
  )
}

export function CitySkyline() {
  const buildings = useMemo<BuildingData[]>(() => {
    const rng = (min: number, max: number) => min + Math.random() * (max - min)
    const result: BuildingData[] = []
    // Three depth layers for parallax feel
    const layers = [
      { zRange: [-20, -18], count: 10, hRange: [3, 9], wRange: [0.8, 1.8] },
      { zRange: [-16, -13], count: 8, hRange: [2, 6], wRange: [0.6, 1.4] },
      { zRange: [-12, -10], count: 6, hRange: [1.5, 4], wRange: [0.5, 1.2] },
    ]
    layers.forEach(({ zRange, count, hRange, wRange }) => {
      for (let i = 0; i < count; i++) {
        result.push({
          x: rng(-8, 8),
          z: rng(zRange[0], zRange[1]),
          w: rng(wRange[0], wRange[1]),
          h: rng(hRange[0], hRange[1]),
          d: rng(0.6, 1.2),
        })
      }
    })
    return result
  }, [])

  return (
    <group>
      {/* Night sky backdrop */}
      <mesh position={[0, 2, -22]}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#020408" roughness={1} />
      </mesh>

      {/* Moon */}
      <Moon />

      {/* Buildings */}
      <Buildings buildings={buildings} />

      {/* Lit windows — single GPU draw call each */}
      <BuildingWindows buildings={buildings} />
    </group>
  )
}
