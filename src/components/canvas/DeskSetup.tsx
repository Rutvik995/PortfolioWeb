import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLampStore } from './Lighting'

// ─────────────────────────────────────────────────────────────────────────────
// DeskSetup — Sleek Apple Studio Display, Mechanical Keyboard, Wireless Mouse,
// Coffee Mug with Steam, Pixel Phone, and Clickable Articulated Desk Lamp.
// ─────────────────────────────────────────────────────────────────────────────

const CODE_LINES = [
  '# TerraHive — Multi-Agent AI Orchestrator',
  'from langgraph.graph import StateGraph, END',
  'from pydantic import BaseModel, Field',
  '',
  'class AgentState(BaseModel):',
  '    goal: str = Field(description="User goal")',
  '    plan: list[str] = []',
  '    results: dict = {}',
  '    confidence: float = 0.98',
  '',
  'async def orchestrator_node(state: AgentState):',
  '    plan = await planner.decompose(state.goal)',
  '    return {"plan": plan}',
  '',
  'async def worker_node(state: AgentState):',
  '    telemetry = await solar_db.query_inverters()',
  '    return {"results": telemetry}',
  '',
  'async def gatekeeper_node(state: AgentState):',
  '    verified = validator.assert_quality(state.results)',
  '    return {"verified": verified}',
  '',
  'graph = StateGraph(AgentState)',
  'graph.add_node("orchestrator", orchestrator_node)',
  'graph.add_node("worker", worker_node)',
  'graph.add_node("gatekeeper", gatekeeper_node)',
  'graph.add_edge("orchestrator", "worker")',
  'graph.add_edge("worker", "gatekeeper")',
  '',
  '# [INGESTION] → [PLANNER] → [WORKERS 1..4] → [SYNTHESIS]',
  '# Status: ONLINE // Model: Llama-3.3-70b-versatile',
  'await graph.ainvoke({"goal": "Optimize Solar Generation"})',
]

function ScrollingScreen() {
  const texRef = useRef<THREE.CanvasTexture | null>(null)
  const offsetRef = useRef(0)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 640
    const tex = new THREE.CanvasTexture(canvas)
    texRef.current = tex
    return tex
  }, [])

  useFrame((_, dt) => {
    const tex = texRef.current
    if (!tex) return
    const canvas = tex.image as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    const LH = 26
    offsetRef.current = (offsetRef.current + dt * 28) % (CODE_LINES.length * LH)

    // IDE Background
    ctx.fillStyle = '#0b0f19'
    ctx.fillRect(0, 0, 1024, 640)

    // Top editor tabs bar
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, 1024, 38)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(16, 6, 240, 32)
    ctx.fillStyle = '#00f2fe'
    ctx.font = 'bold 15px "Segoe UI", monospace'
    ctx.fillText('agent_orchestrator.py', 32, 28)

    // Editor line numbers gutter
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 38, 54, 602)

    const start = Math.floor(offsetRef.current / LH)
    const yo = offsetRef.current % LH
    const count = Math.ceil((640 - 38) / LH) + 1

    for (let i = 0; i < count; i++) {
      const li = (start + i) % CODE_LINES.length
      const y = 38 + i * LH - yo + LH
      const line = CODE_LINES[li]

      // Line number
      ctx.fillStyle = '#475569'
      ctx.font = '13px monospace'
      ctx.fillText(String(li + 1), 16, y)

      // Syntax highlighting
      if (line.startsWith('#')) {
        ctx.fillStyle = '#10b981' // Green comments
      } else if (/^(from|import|class|def|async|await|return)/.test(line.trimStart())) {
        ctx.fillStyle = '#c084fc' // Purple keywords
      } else if (/^(graph|state|plan|results|telemetry|verified)\b/.test(line.trimStart())) {
        ctx.fillStyle = '#38bdf8' // Cyan identifiers
      } else if (line.includes('=')) {
        ctx.fillStyle = '#fbbf24' // Yellow expressions
      } else {
        ctx.fillStyle = '#e2e8f0' // Crisp white text
      }

      ctx.font = '14px "Courier New", monospace'
      ctx.fillText(line, 68, y)
    }

    // Node graph telemetry box on bottom-right of screen
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)'
    ctx.strokeStyle = '#00f2fe'
    ctx.lineWidth = 1.5
    ctx.strokeRect(620, 480, 380, 140)
    ctx.fillRect(620, 480, 380, 140)

    ctx.fillStyle = '#00f2fe'
    ctx.font = 'bold 14px monospace'
    ctx.fillText('MULTI-AGENT STATE GRAPH: ACTIVE', 636, 508)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px monospace'
    ctx.fillText('Nodes: 4 | Status: 200 OK | Latency: 1.2s', 636, 532)
    ctx.fillStyle = '#34d399'
    ctx.fillText('● [Orchestrator] → [Worker] → [Gatekeeper]', 636, 560)
    ctx.fillText('Output: 99.4% Generation Accuracy', 636, 588)

    // Blinking cursor
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = '#00f2fe'
      ctx.fillRect(68, ((start + 6) % CODE_LINES.length) * LH - yo + 48, 8, 16)
    }

    tex.needsUpdate = true
  })

  return (
    <mesh position={[0, 1.46, -0.27]}>
      <planeGeometry args={[1.36, 0.78]} />
      <meshStandardMaterial
        map={texture}
        emissive="#00f2fe"
        emissiveIntensity={0.22}
        roughness={0.1}
      />
    </mesh>
  )
}

function SteamParticle({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  const phase = index * 0.7
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.55 + phase) % 1
    if (ref.current) {
      ref.current.position.y = 0.08 + t * 0.24
      ref.current.position.x = Math.sin(t * 3.5 + phase) * 0.018
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.opacity = t < 0.25 ? (t / 0.25) * 0.35 : (1 - t) * 0.35
    }
  })
  return (
    <mesh ref={ref} position={[0, 0.08, 0]}>
      <planeGeometry args={[0.03, 0.03]} />
      <meshStandardMaterial color="#dbeafe" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

function CoffeeMug() {
  return (
    <group position={[-0.52, 0.79, 0.04]}>
      {/* Mug body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.044, 0.11, 20]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      {/* Mug handle */}
      <mesh position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.026, 0.008, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      {/* Coffee liquid surface */}
      <mesh position={[0, 0.052, 0]}>
        <circleGeometry args={[0.044, 20]} />
        <meshStandardMaterial color="#2d170b" roughness={0.5} />
      </mesh>
      {/* Animated steam particles */}
      {[0, 1, 2].map((i) => <SteamParticle key={i} index={i} />)}
    </group>
  )
}

function DeskLamp({ onClick }: { onClick: () => void }) {
  const lampOn = useLampStore((s) => s.lampOn)
  return (
    <group
      position={[0.62, 0.76, -0.18]}
      onClick={onClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      {/* Heavy brass/aluminum base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.095, 0.024, 20]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Lower articulated arm */}
      <mesh position={[-0.04, 0.22, 0.04]} rotation={[0.2, 0, 0.1]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.44, 8]} />
        <meshStandardMaterial color="#c59f27" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Elbow joint */}
      <mesh position={[-0.08, 0.44, 0.08]}>
        <sphereGeometry args={[0.02, 10, 8]} />
        <meshStandardMaterial color="#d4af37" roughness={0.25} metalness={0.75} />
      </mesh>
      {/* Upper arm reaching over desk */}
      <mesh position={[-0.18, 0.58, 0.16]} rotation={[-0.38, 0, -0.22]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.38, 8]} />
        <meshStandardMaterial color="#c59f27" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Lamp shade */}
      <group position={[-0.28, 0.72, 0.24]}>
        <mesh rotation={[Math.PI * 0.62, 0, 0.28]} castShadow>
          <coneGeometry args={[0.11, 0.15, 24, 1, true]} />
          <meshStandardMaterial
            color="#fef3c7"
            emissive="#ffb74d"
            emissiveIntensity={lampOn ? 2.5 : 0.2}
            roughness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Glowing bulb */}
        <mesh position={[0, -0.03, 0]}>
          <sphereGeometry args={[0.028, 12, 10]} />
          <meshStandardMaterial
            color="#fffbeb"
            emissive="#ffae42"
            emissiveIntensity={lampOn ? 3.5 : 0.2}
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
      <mesh position={[0, 0.73, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.065, 0.9]} />
        <meshStandardMaterial color="#181a24" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Desk edge bevel */}
      <mesh position={[0, 0.705, 0.45]}>
        <boxGeometry args={[1.8, 0.015, 0.015]} />
        <meshStandardMaterial color="#10121a" roughness={0.5} />
      </mesh>

      {/* Modern steel desk frame legs */}
      {([-0.82, 0.82] as number[]).map((x) => (
        <group key={x}>
          <mesh position={[x, 0.365, 0]} castShadow>
            <boxGeometry args={[0.055, 0.73, 0.82]} />
            <meshStandardMaterial color="#0f1118" roughness={0.5} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* ── LARGE DESK MAT ── */}
      <mesh position={[0, 0.764, 0.08]}>
        <boxGeometry args={[1.3, 0.003, 0.62]} />
        <meshStandardMaterial color="#0b0e17" roughness={0.85} />
      </mesh>

      {/* ── APPLE STUDIO DISPLAY MONITOR ── */}
      {/* Monitor housing */}
      <mesh position={[0, 1.46, -0.29]} castShadow>
        <boxGeometry args={[1.42, 0.84, 0.04]} />
        <meshStandardMaterial color="#1e222d" roughness={0.25} metalness={0.7} />
      </mesh>
      {/* Slim front bezel */}
      <mesh position={[0, 1.46, -0.272]}>
        <boxGeometry args={[1.38, 0.8, 0.01]} />
        <meshStandardMaterial color="#090a0f" roughness={0.1} metalness={0.5} />
      </mesh>
      {/* Live animated scrolling code screen */}
      <ScrollingScreen />

      {/* Stand neck */}
      <mesh position={[0, 1.02, -0.29]} castShadow>
        <boxGeometry args={[0.08, 0.52, 0.06]} />
        <meshStandardMaterial color="#1e222d" roughness={0.25} metalness={0.7} />
      </mesh>
      {/* Stand foot base */}
      <mesh position={[0, 0.765, -0.22]} castShadow>
        <boxGeometry args={[0.32, 0.014, 0.18]} />
        <meshStandardMaterial color="#1e222d" roughness={0.25} metalness={0.7} />
      </mesh>

      {/* Monitor screen glow casting real light on keyboard & hands */}
      <pointLight
        color="#38bdf8"
        intensity={1.4}
        position={[0, 1.35, -0.1]}
        distance={2.8}
        decay={2}
        castShadow={false}
      />

      {/* ── MECHANICAL KEYBOARD ── */}
      <mesh position={[0, 0.772, 0.14]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.02, 0.22]} />
        <meshStandardMaterial color="#0a0c12" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Key rows with subtle backlighting */}
      {[0, 1, 2, 3].map((row) => (
        <mesh key={row} position={[0, 0.784, 0.06 + row * 0.045]} castShadow>
          <boxGeometry args={[0.59, 0.012, 0.032]} />
          <meshStandardMaterial color="#171b26" roughness={0.5} />
        </mesh>
      ))}

      {/* ── WIRELESS ERGONOMIC MOUSE ── */}
      <mesh position={[0.42, 0.772, 0.15]} castShadow>
        <boxGeometry args={[0.075, 0.024, 0.12]} />
        <meshStandardMaterial color="#0c0e16" roughness={0.35} metalness={0.4} />
      </mesh>

      {/* ── PIXEL SMARTPHONE (with horizontal camera bar, from Photo 4) ── */}
      <group position={[-0.55, 0.766, -0.14]} rotation={[0, 0.15, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.076, 0.01, 0.155]} />
          <meshStandardMaterial color="#181a20" roughness={0.2} metalness={0.6} />
        </mesh>
        {/* Pixel signature camera bar */}
        <mesh position={[0, 0.007, -0.035]}>
          <boxGeometry args={[0.078, 0.006, 0.028]} />
          <meshStandardMaterial color="#090a0f" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* ── COFFEE MUG WITH STEAM ── */}
      <CoffeeMug />

      {/* ── ARTICULATED DESK LAMP ── */}
      <DeskLamp onClick={toggleLamp} />
      {/* Lamp point light */}
      <pointLight
        color="#ffae42"
        intensity={lampOn ? 4.8 : 0.4}
        position={[0.34, 1.48, 0.06]}
        distance={5.5}
        decay={1.6}
        castShadow={false}
      />
    </group>
  )
}
