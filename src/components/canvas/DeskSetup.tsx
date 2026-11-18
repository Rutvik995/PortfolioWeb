import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLampStore } from './Lighting'

// ─────────────────────────────────────────────────────────────────────────────
// DeskSetup — Mac Studio Display + MacBook stand, keyboard, mouse, props
// ─────────────────────────────────────────────────────────────────────────────

const CODE_LINES = [
  '# TerraHive — Multi-Agent Orchestrator',
  'from langgraph.graph import StateGraph, END',
  'from pydantic import BaseModel',
  '',
  'class AgentState(BaseModel):',
  '    goal: str',
  '    plan: list[str] = []',
  '    results: dict = {}',
  '',
  'def orchestrator(state: AgentState):',
  '    plan = planner.plan(state.goal)',
  '    return {"plan": plan}',
  '',
  'def worker(state: AgentState):',
  '    result = executor.run(state.plan)',
  '    return {"results": result}',
  '',
  'graph = StateGraph(AgentState)',
  'graph.add_node("orchestrator", orchestrator)',
  'graph.add_node("worker", worker)',
  'graph.add_edge("orchestrator", "worker")',
  '',
  '# ── Node graph ──────────────────────',
  '# [Ingestion] → [Planner]',
  '#     ↓              ↓',
  '# [Worker-1]   [Worker-2]',
  '#     ↓              ↓',
  '#   [Synthesis] → [Gatekeeper]',
  '#                     ↓',
  '#                 [Output]',
  '',
  'await graph.ainvoke({"goal": goal})',
]

function ScrollingScreen() {
  const texRef = useRef<THREE.CanvasTexture | null>(null)
  const offsetRef = useRef(0)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 320
    const tex = new THREE.CanvasTexture(canvas)
    texRef.current = tex
    return tex
  }, [])

  useFrame((_, dt) => {
    const tex = texRef.current
    if (!tex) return
    const canvas = tex.image as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    const LH = 17
    offsetRef.current = (offsetRef.current + dt * 22) % (CODE_LINES.length * LH)

    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, 512, 320)

    const start = Math.floor(offsetRef.current / LH)
    const yo = offsetRef.current % LH
    const count = Math.ceil(320 / LH) + 1

    for (let i = 0; i < count; i++) {
      const li = (start + i) % CODE_LINES.length
      const y = i * LH - yo + LH
      const line = CODE_LINES[li]
      if (line.startsWith('#')) ctx.fillStyle = '#6a9955'
      else if (/^(from|import|class|def|async|await|return)/.test(line.trimStart())) ctx.fillStyle = '#c792ea'
      else if (/^graph|state\.|=/.test(line.trimStart())) ctx.fillStyle = '#89ddff'
      else if (line.startsWith('  ') || line.startsWith('\t')) ctx.fillStyle = '#a6e3a1'
      else ctx.fillStyle = '#cdd6f4'
      ctx.font = '11px "Courier New", monospace'
      ctx.fillText(line, 10, y)
    }

    // Blinking cursor
    if (Math.floor(Date.now() / 530) % 2 === 0) {
      ctx.fillStyle = '#00f2fe'
      ctx.fillRect(10, CODE_LINES.length * LH - offsetRef.current % LH, 7, 13)
    }
    tex.needsUpdate = true
  })

  return (
    <mesh position={[0, 1.615, -0.405]}>
      <planeGeometry args={[1.72, 0.97]} />
      <meshStandardMaterial map={texture} emissive="#2a4a6a" emissiveIntensity={0.18} roughness={0.1} />
    </mesh>
  )
}

function SteamParticle({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  const phase = index * 0.7
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.6 + phase) % 1
    if (ref.current) {
      ref.current.position.y = 0.08 + t * 0.22
      ref.current.position.x = Math.sin(t * 3 + phase) * 0.015
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.opacity = t < 0.3 ? t / 0.3 * 0.4 : (1 - t) * 0.4
    }
  })
  return (
    <mesh ref={ref} position={[0, 0.08, 0]}>
      <planeGeometry args={[0.025, 0.025]} />
      <meshStandardMaterial color="#c5d5e5" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

function CoffeeMug() {
  return (
    <group position={[-1.05, 0.825, 0.12]}>
      {/* Mug body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.055, 0.048, 0.12, 20]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.5} />
      </mesh>
      {/* Mug handle */}
      <mesh position={[0.065, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.028, 0.009, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.5} />
      </mesh>
      {/* Coffee surface */}
      <mesh position={[0, 0.062, 0]}>
        <circleGeometry args={[0.047, 20]} />
        <meshStandardMaterial color="#2c1a0e" roughness={0.6} />
      </mesh>
      {/* Steam */}
      {[0, 1, 2].map((i) => <SteamParticle key={i} index={i} />)}
    </group>
  )
}

function DeskLamp({ onClick }: { onClick: () => void }) {
  const lampOn = useLampStore((s) => s.lampOn)
  return (
    <group
      position={[1.3, 0.79, -0.35]}
      onClick={onClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      {/* Base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.025, 20]} />
        <meshStandardMaterial color="#c0a060" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Arm lower */}
      <mesh position={[0, 0.22, 0]} rotation={[0.18, 0, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.42, 8]} />
        <meshStandardMaterial color="#b89040" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Arm elbow joint */}
      <mesh position={[-0.04, 0.44, 0.04]}>
        <sphereGeometry args={[0.022, 10, 8]} />
        <meshStandardMaterial color="#c09848" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Arm upper */}
      <mesh position={[-0.12, 0.6, 0.12]} rotation={[-0.4, 0, -0.15]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.36, 8]} />
        <meshStandardMaterial color="#b89040" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Lamp shade */}
      <group position={[-0.22, 0.76, 0.22]}>
        <mesh rotation={[Math.PI * 0.6, 0, 0.3]} castShadow>
          <coneGeometry args={[0.11, 0.14, 20, 1, true]} />
          <meshStandardMaterial
            color="#ffe8b0"
            emissive="#ffb74d"
            emissiveIntensity={lampOn ? 2.0 : 0.3}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Bulb glow */}
        <mesh position={[0, -0.03, 0]}>
          <sphereGeometry args={[0.025, 10, 8]} />
          <meshStandardMaterial
            color="#fff8e1"
            emissive="#ffcc80"
            emissiveIntensity={lampOn ? 3.0 : 0.3}
          />
        </mesh>
      </group>
    </group>
  )
}

export function DeskSetup() {
  const toggleLamp = useLampStore((s) => s.toggleLamp)
  const lampOn = useLampStore((s) => s.lampOn)

  return (
    <group>
      {/* ── DESK SURFACE ── */}
      <mesh position={[0, 0.79, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.07, 1.65]} />
        <meshStandardMaterial color="#1c1a2e" roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Desk legs */}
      {([-1.68, 1.68] as number[]).map((x) =>
        ([-0.7, 0.7] as number[]).map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.4, z]} castShadow>
            <boxGeometry args={[0.07, 0.8, 0.07]} />
            <meshStandardMaterial color="#111118" roughness={0.5} metalness={0.4} />
          </mesh>
        ))
      )}

      {/* ── DESK MAT ── */}
      <mesh position={[0.1, 0.826, 0.15]}>
        <boxGeometry args={[1.5, 0.004, 0.75]} />
        <meshStandardMaterial color="#0d1117" roughness={0.9} />
      </mesh>

      {/* ── MONITOR (Studio Display style — tall, slim bezel) ── */}
      {/* Back housing */}
      <mesh position={[0, 1.68, -0.52]} castShadow>
        <boxGeometry args={[1.9, 1.08, 0.055]} />
        <meshStandardMaterial color="#1a1a1f" roughness={0.2} metalness={0.7} />
      </mesh>
      {/* Slim bezel face */}
      <mesh position={[0, 1.68, -0.49]}>
        <boxGeometry args={[1.84, 1.02, 0.015]} />
        <meshStandardMaterial color="#0d0d0f" roughness={0.1} metalness={0.5} />
      </mesh>
      {/* Scrolling code screen */}
      <ScrollingScreen />
      {/* Monitor stand neck */}
      <mesh position={[0, 1.08, -0.52]} castShadow>
        <boxGeometry args={[0.09, 0.56, 0.08]} />
        <meshStandardMaterial color="#1a1a1f" roughness={0.2} metalness={0.7} />
      </mesh>
      {/* Stand base */}
      <mesh position={[0, 0.826, -0.42]} castShadow>
        <boxGeometry args={[0.38, 0.016, 0.22]} />
        <meshStandardMaterial color="#1a1a1f" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* MacBook (closed, to the right as secondary device) */}
      <mesh position={[0.85, 0.838, 0.1]} castShadow>
        <boxGeometry args={[0.52, 0.016, 0.34]} />
        <meshStandardMaterial color="#2a2a2f" roughness={0.2} metalness={0.75} />
      </mesh>
      {/* MacBook lid (slightly open) */}
      <mesh position={[0.85, 0.916, -0.08]} rotation={[-0.28, 0, 0]} castShadow>
        <boxGeometry args={[0.52, 0.012, 0.34]} />
        <meshStandardMaterial color="#252528" roughness={0.2} metalness={0.75} />
      </mesh>

      {/* ── MECHANICAL KEYBOARD ── */}
      <mesh position={[0.08, 0.83, 0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.88, 0.022, 0.32]} />
        <meshStandardMaterial color="#0d0e14" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Key rows (3 decorative strips) */}
      {[0, 1, 2, 3].map((row) => (
        <mesh key={row} position={[0.08, 0.843, 0.14 + row * 0.045]} castShadow>
          <boxGeometry args={[0.84, 0.014, 0.034]} />
          <meshStandardMaterial color="#161620" roughness={0.5} />
        </mesh>
      ))}

      {/* ── WIRELESS MOUSE ── */}
      <mesh position={[0.65, 0.828, 0.24]} castShadow>
        <boxGeometry args={[0.09, 0.022, 0.15]} />
        <meshStandardMaterial color="#0d0e14" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* ── SMARTPHONE (face down, top corner of desk) ── */}
      <mesh position={[-1.3, 0.826, -0.1]} rotation={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.088, 0.012, 0.19]} />
        <meshStandardMaterial color="#111115" roughness={0.2} metalness={0.6} />
      </mesh>

      {/* ── COFFEE MUG ── */}
      <CoffeeMug />

      {/* ── NOTEBOOK / SKETCHPAD ── */}
      <mesh position={[-0.85, 0.826, 0.3]} rotation={[0, -0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.012, 0.19]} />
        <meshStandardMaterial color="#f5ecd7" roughness={0.9} />
      </mesh>
      {/* Notebook lines */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.85, 0.834, 0.24 + i * 0.04]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[0.22, 0.001, 0.003]} />
          <meshStandardMaterial color="#c5b8a0" />
        </mesh>
      ))}

      {/* ── DESK LAMP ── */}
      <DeskLamp onClick={toggleLamp} />
      {/* Lamp point light (at shade position) */}
      <pointLight
        color="#ffae42"
        intensity={lampOn ? 3.5 : 0}
        position={[1.08, 1.56, -0.06]}
        distance={6}
        decay={1.8}
        castShadow={false}
      />
    </group>
  )
}
