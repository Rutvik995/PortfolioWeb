import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLampStore } from './Lighting'

// ─────────────────────────────────────────────────────────────────────────────
// DeskSetup — Exact match to Image 5 Reference:
// - Warm walnut wooden desk (#7c4d2b) with dark 3-drawer cabinet on right
// - Center: Silver Apple Studio Display / iMac (#d1d5db chin & stand) with VS Code
// - Right: Angled secondary display with glowing cyan multi-agent network graph
// - Beside it: Open silver MacBook laptop
// - Left: Articulated brass/bronze desk lamp with rich warm glow (#ffb74d)
// - Cyan-backlit mechanical keyboard, wireless mouse, and ceramic coffee mug
// ─────────────────────────────────────────────────────────────────────────────

const WALNUT_WOOD    = '#7c4d2b' // Warm walnut from Image 5
const WALNUT_DARK    = '#5a351d'
const DRAWER_FRONT   = '#2c1c11'
const SILVER_ALU     = '#d1d5db' // Apple anodized aluminum
const BEZEL_BLACK    = '#0a0d14'
const KEYBOARD_BASE  = '#0f172a'
const CYAN_GLOW      = '#00f2fe'

// ── VS Code / Python IDE Canvas Texture ──────────────────────────────────────
const CODE_LINES = [
  '# TerraHive — Multi-Agent AI Orchestrator',
  'from langgraph.graph import StateGraph, END',
  'from pydantic import BaseModel, Field',
  '',
  'class AgentState(BaseModel):',
  '    goal: str = Field(description="User goal")',
  '    plan: list[str] = []',
  '    results: dict = {}',
  '    confidence: float = 0.99',
  '',
  'async def orchestrator_node(state: AgentState):',
  '    plan = await planner.decompose(state.goal)',
  '    return {"plan": plan}',
  '',
  'async def solar_worker_node(state: AgentState):',
  '    telemetry = await solar_db.query_inverters()',
  '    return {"results": telemetry}',
  '',
  'async def gatekeeper_node(state: AgentState):',
  '    verified = validator.check(state.results)',
  '    return {"verified": verified}',
  '',
  'graph = StateGraph(AgentState)',
  'graph.add_node("orchestrator", orchestrator_node)',
  'graph.add_node("worker", solar_worker_node)',
  'graph.add_node("gatekeeper", gatekeeper_node)',
  'graph.add_edge("orchestrator", "worker")',
  'graph.add_edge("worker", "gatekeeper")',
  '',
  '# Status: ONLINE // Model: Llama-3.3-70b',
  'await graph.ainvoke({"goal": "Deploy Agents"})',
]

function useCodeEditorTexture() {
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
    offsetRef.current = (offsetRef.current + dt * 26) % (CODE_LINES.length * LH)

    // Editor Background
    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, 1024, 640)

    // Top Tab Header
    ctx.fillStyle = '#161b22'
    ctx.fillRect(0, 0, 1024, 38)
    ctx.fillStyle = '#21262d'
    ctx.fillRect(16, 6, 240, 32)
    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 15px monospace'
    ctx.fillText('agent_orchestrator.py', 32, 28)

    // Line number gutter
    ctx.fillStyle = '#0f141c'
    ctx.fillRect(0, 38, 54, 602)

    const start = Math.floor(offsetRef.current / LH)
    const yo = offsetRef.current % LH
    const count = Math.ceil((640 - 38) / LH) + 1

    for (let i = 0; i < count; i++) {
      const li = (start + i) % CODE_LINES.length
      const y = 38 + i * LH - yo + LH
      const line = CODE_LINES[li]

      // Line number
      ctx.fillStyle = '#484f58'
      ctx.font = '13px monospace'
      ctx.fillText(String(li + 1), 16, y)

      // Syntax colors
      if (line.startsWith('#')) {
        ctx.fillStyle = '#3fb950' // Green comments
      } else if (/^(from|import|class|def|async|await|return)\b/.test(line.trimStart())) {
        ctx.fillStyle = '#d2a8ff' // Purple keywords
      } else if (/^(graph|state|plan|results|telemetry|verified)\b/.test(line.trimStart())) {
        ctx.fillStyle = '#79c0ff' // Light blue identifiers
      } else if (line.includes('=')) {
        ctx.fillStyle = '#e3b341' // Amber expressions
      } else {
        ctx.fillStyle = '#f0f6fc' // Crisp white text
      }

      ctx.font = '14px "Courier New", monospace'
      ctx.fillText(line, 68, y)
    }

    // Blinking cursor
    if (Math.floor(Date.now() / 480) % 2 === 0) {
      ctx.fillStyle = '#58a6ff'
      ctx.fillRect(68, ((start + 5) % CODE_LINES.length) * LH - yo + 48, 8, 16)
    }

    tex.needsUpdate = true
  })

  return texture
}

// ── Glowing Cyan Multi-Agent Node Graph Texture ──────────────────────────────
function useNodeGraphTexture() {
  const texRef = useRef<THREE.CanvasTexture | null>(null)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 360
    const tex = new THREE.CanvasTexture(canvas)
    texRef.current = tex
    return tex
  }, [])

  useFrame(({ clock }) => {
    const tex = texRef.current
    if (!tex) return
    const canvas = tex.image as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    const t = clock.getElapsedTime()

    // Dark slate background
    ctx.fillStyle = '#080d1a'
    ctx.fillRect(0, 0, 512, 360)

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)'
    ctx.lineWidth = 1
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 360); ctx.stroke()
    }
    for (let y = 0; y < 360; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke()
    }

    // Node definitions
    const nodes = [
      { id: 'O', label: 'ORCHESTRATOR', x: 256, y: 80,  r: 22, col: '#38bdf8' },
      { id: 'W1', label: 'PLANNER',     x: 120, y: 190, r: 18, col: '#00f2fe' },
      { id: 'W2', label: 'WORKER-1',    x: 256, y: 200, r: 18, col: '#00f2fe' },
      { id: 'W3', label: 'WORKER-2',    x: 390, y: 190, r: 18, col: '#00f2fe' },
      { id: 'S',  label: 'SYNTHESIS',   x: 180, y: 300, r: 17, col: '#34d399' },
      { id: 'G',  label: 'GATEKEEPER',  x: 330, y: 300, r: 17, col: '#a855f7' },
    ]

    const edges = [
      [0, 1], [0, 2], [0, 3],
      [1, 4], [2, 4], [2, 5], [3, 5],
    ]

    // Draw glowing cyan connecting lines
    edges.forEach(([from, to]) => {
      const n1 = nodes[from], n2 = nodes[to]
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.45)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(n1.x, n1.y)
      ctx.lineTo(n2.x, n2.y)
      ctx.stroke()

      // Traveling pulse packet along edge
      const pulseT = (t * 0.8 + from * 0.3) % 1
      const px = n1.x + (n2.x - n1.x) * pulseT
      const py = n1.y + (n2.y - n1.y) * pulseT
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(px, py, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw nodes
    nodes.forEach((n, idx) => {
      const pulse = Math.sin(t * 3 + idx) * 2

      // Outer glow ring
      ctx.fillStyle = n.col + '33'
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r + 6 + pulse, 0, Math.PI * 2)
      ctx.fill()

      // Node circle
      ctx.fillStyle = n.col
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      ctx.fill()

      // Label
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(n.label, n.x, n.y + n.r + 14)
    })

    // Header badge
    ctx.fillStyle = '#00f2fe'
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'left'
    ctx.fillText('MULTI-AGENT SWARM TOPOLOGY', 16, 24)

    tex.needsUpdate = true
  })

  return texture
}

export function DeskSetup() {
  const toggleLamp = useLampStore((s) => s.toggleLamp)
  const lampOn = useLampStore((s) => s.lampOn)
  const codeTexture = useCodeEditorTexture()
  const nodeTexture = useNodeGraphTexture()

  return (
    // Desk runs parallel to Back-Left Wall (along Z axis)
    <group position={[-1.25, 0, 0.05]} rotation={[0, Math.PI / 2, 0]}>

      {/* ── WARM WALNUT DESK SURFACE (#7c4d2b from Image 5) ── */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.065, 0.88]} />
        <meshStandardMaterial color={WALNUT_WOOD} roughness={0.4} metalness={0.15} />
      </mesh>
      {/* Front edge wood bevel */}
      <mesh position={[0, 0.71, 0.44]}>
        <boxGeometry args={[1.9, 0.015, 0.012]} />
        <meshStandardMaterial color={WALNUT_DARK} roughness={0.5} />
      </mesh>

      {/* Left side wooden desk leg frame */}
      <mesh position={[-0.88, 0.37, 0]} castShadow>
        <boxGeometry args={[0.06, 0.74, 0.82]} />
        <meshStandardMaterial color={WALNUT_DARK} roughness={0.45} />
      </mesh>

      {/* ── DARK 3-DRAWER CABINET ON THE RIGHT SIDE (Image 5) ── */}
      <group position={[0.66, 0.37, 0]}>
        {/* Cabinet box body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.44, 0.72, 0.82]} />
          <meshStandardMaterial color={DRAWER_FRONT} roughness={0.5} />
        </mesh>
        {/* 3 Drawer front panels */}
        {[-0.23, 0.0, 0.23].map((dy, i) => (
          <group key={i} position={[0, dy, 0.415]}>
            <mesh castShadow>
              <boxGeometry args={[0.4, 0.2, 0.015]} />
              <meshStandardMaterial color="#3a2215" roughness={0.4} />
            </mesh>
            {/* Horizontal brass pull handle */}
            <mesh position={[0, 0, 0.015]}>
              <boxGeometry args={[0.12, 0.014, 0.014]} />
              <meshStandardMaterial color="#d4af37" metalness={0.75} roughness={0.25} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── DESK MAT (Under Keyboard & Mouse) ── */}
      <mesh position={[-0.15, 0.774, 0.06]}>
        <boxGeometry args={[1.1, 0.003, 0.58]} />
        <meshStandardMaterial color="#0f172a" roughness={0.85} />
      </mesh>

      {/* ── PRIMARY DISPLAY: APPLE STUDIO DISPLAY / iMAC (Center) ── */}
      <group position={[-0.12, 0, -0.18]}>
        {/* Silver aluminum chin & rear enclosure */}
        <mesh position={[0, 1.48, -0.02]} castShadow>
          <boxGeometry args={[1.28, 0.78, 0.035]} />
          <meshStandardMaterial color={SILVER_ALU} metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Slim black bezel frame */}
        <mesh position={[0, 1.48, -0.002]}>
          <boxGeometry args={[1.25, 0.75, 0.008]} />
          <meshStandardMaterial color={BEZEL_BLACK} roughness={0.1} />
        </mesh>
        {/* Aluminum bottom chin bar */}
        <mesh position={[0, 1.14, 0.004]}>
          <boxGeometry args={[1.25, 0.06, 0.008]} />
          <meshStandardMaterial color={SILVER_ALU} metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Crisp VS Code / Python IDE screen */}
        <mesh position={[0, 1.51, 0.003]}>
          <planeGeometry args={[1.22, 0.67]} />
          <meshStandardMaterial
            map={codeTexture}
            emissive="#38bdf8"
            emissiveIntensity={0.25}
            roughness={0.1}
          />
        </mesh>
        {/* Aluminum Studio Display stand neck */}
        <mesh position={[0, 1.05, -0.04]} castShadow>
          <boxGeometry args={[0.075, 0.52, 0.05]} />
          <meshStandardMaterial color={SILVER_ALU} metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Base foot plate */}
        <mesh position={[0, 0.775, 0.02]} castShadow>
          <boxGeometry args={[0.26, 0.012, 0.18]} />
          <meshStandardMaterial color={SILVER_ALU} metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* ── SECONDARY DISPLAY: ANGLED CYAN NODE NETWORK GRAPH (Right) ── */}
      <group position={[0.62, 0, -0.12]} rotation={[0, -0.38, 0]}>
        <mesh position={[0, 1.44, 0]} castShadow>
          <boxGeometry args={[0.82, 0.54, 0.03]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 1.44, 0.018]}>
          <planeGeometry args={[0.78, 0.5]} />
          <meshStandardMaterial
            map={nodeTexture}
            emissive="#00f2fe"
            emissiveIntensity={0.35}
            roughness={0.1}
          />
        </mesh>
        {/* Monitor stand */}
        <mesh position={[0, 1.02, -0.02]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.46, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.775, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.01, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
      </group>

      {/* ── OPEN SILVER MACBOOK LAPTOP (Beside Secondary Monitor) ── */}
      <group position={[0.54, 0.775, 0.18]} rotation={[0, -0.22, 0]}>
        {/* MacBook lower base */}
        <mesh position={[0, 0.007, 0]} castShadow>
          <boxGeometry args={[0.34, 0.014, 0.24]} />
          <meshStandardMaterial color={SILVER_ALU} metalness={0.85} roughness={0.25} />
        </mesh>
        {/* MacBook open display lid */}
        <mesh position={[0, 0.12, -0.11]} rotation={[-0.32, 0, 0]} castShadow>
          <boxGeometry args={[0.34, 0.22, 0.01]} />
          <meshStandardMaterial color={SILVER_ALU} metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Laptop screen glow */}
        <mesh position={[0, 0.12, -0.104]} rotation={[-0.32, 0, 0]}>
          <planeGeometry args={[0.32, 0.2]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.4}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* ── ARTICULATED BRUSHED BRASS/BRONZE DESK LAMP (Left) ── */}
      <group
        position={[-0.72, 0.774, 0.12]}
        onClick={toggleLamp}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        {/* Weighted brass base */}
        <mesh castShadow>
          <cylinderGeometry args={[0.075, 0.088, 0.022, 20]} />
          <meshStandardMaterial color="#c59f27" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Lower arm */}
        <mesh position={[0.02, 0.2, 0]} rotation={[0.18, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.009, 0.009, 0.42, 8]} />
          <meshStandardMaterial color="#b89020" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Articulated joint */}
        <mesh position={[0.05, 0.4, 0.04]}>
          <sphereGeometry args={[0.018, 10, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} />
        </mesh>
        {/* Upper arm angling across desk */}
        <mesh position={[0.15, 0.54, 0.08]} rotation={[-0.35, 0, 0.28]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.36, 8]} />
          <meshStandardMaterial color="#b89020" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Glowing cone lamp shade (Rich golden light #ffb74d) */}
        <group position={[0.26, 0.68, 0.12]}>
          <mesh rotation={[Math.PI * 0.58, 0, -0.32]} castShadow>
            <coneGeometry args={[0.1, 0.14, 20, 1, true]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#ffb74d"
              emissiveIntensity={lampOn ? 2.8 : 0.2}
              roughness={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Bulb */}
          <mesh position={[0, -0.025, 0]}>
            <sphereGeometry args={[0.026, 12, 10]} />
            <meshStandardMaterial
              color="#fffbeb"
              emissive="#ffae42"
              emissiveIntensity={lampOn ? 3.6 : 0.2}
            />
          </mesh>
        </group>
      </group>

      {/* ── MECHANICAL KEYBOARD (Cyan Backlit) ── */}
      <group position={[-0.12, 0.78, 0.14]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.56, 0.02, 0.19]} />
          <meshStandardMaterial color={KEYBOARD_BASE} roughness={0.4} />
        </mesh>
        {/* Glowing cyan underglow strip */}
        <mesh position={[0, 0.011, 0]}>
          <boxGeometry args={[0.53, 0.008, 0.165]} />
          <meshStandardMaterial
            color={CYAN_GLOW}
            emissive={CYAN_GLOW}
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* ── WIRELESS ERGONOMIC MOUSE ── */}
      <mesh position={[0.26, 0.78, 0.15]} castShadow>
        <capsuleGeometry args={[0.022, 0.05, 8, 12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* ── CERAMIC COFFEE MUG (White with Coffee Surface) ── */}
      <group position={[-0.52, 0.795, 0.16]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.046, 0.04, 0.095, 18]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} />
        </mesh>
        <mesh position={[0.054, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.024, 0.007, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.044, 0]}>
          <circleGeometry args={[0.04, 18]} />
          <meshStandardMaterial color="#2d170b" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}
