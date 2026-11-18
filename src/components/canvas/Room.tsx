import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLampStore } from './Lighting'
import { NightWindow } from './NightWindow'
import { CitySkyline } from './CitySkyline'
import { DeskSetup } from './DeskSetup'

// ─────────────────────────────────────────────────────────────────────────────
// Scrolling IDE code on the monitor screen
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
  '    validated: bool = False',
  '',
  'def orchestrator_node(state: AgentState):',
  '    plan = planner.plan(state.goal)',
  '    return {"plan": plan}',
  '',
  'def worker_node(state: AgentState):',
  '    result = executor.run(state.plan)',
  '    return {"results": result}',
  '',
  'def gatekeeper_node(state: AgentState):',
  '    ok = validator.check(state.results)',
  '    return {"validated": ok}',
  '',
  'graph = StateGraph(AgentState)',
  'graph.add_node("orchestrator", orchestrator_node)',
  'graph.add_node("worker", worker_node)',
  'graph.add_node("gatekeeper", gatekeeper_node)',
  'graph.add_edge("orchestrator", "worker")',
  'graph.add_edge("worker", "gatekeeper")',
  '',
  '# Solar telemetry pipeline',
  'async def analyze_plant(plant_id: str):',
  '    data = await db.fetch_telemetry(plant_id)',
  '    forecast = model.predict(data)',
  '    return {"forecast": forecast, "anomalies": []}',
]

function ScrollingCode({ texture }: { texture: THREE.CanvasTexture }) {
  const offsetRef = useRef(0)

  useFrame((_, delta) => {
    const lineH = 16
    offsetRef.current = (offsetRef.current + delta * 20) % (CODE_LINES.length * lineH)
    const canvas = texture.image as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, 512, 320)

    const lineCount = Math.ceil(320 / lineH) + 1
    const startLine = Math.floor(offsetRef.current / lineH)
    const yOffset = offsetRef.current % lineH

    for (let i = 0; i < lineCount; i++) {
      const lineIdx = (startLine + i) % CODE_LINES.length
      const y = i * lineH - yOffset + lineH
      const line = CODE_LINES[lineIdx]

      if (line.startsWith('#')) ctx.fillStyle = '#6a9955'
      else if (/^(from|import|class|def|async|return|await)/.test(line.trimStart())) ctx.fillStyle = '#c792ea'
      else if (line.includes('=') && !line.startsWith(' ')) ctx.fillStyle = '#89ddff'
      else if (line.startsWith('    ')) ctx.fillStyle = '#a6e3a1'
      else ctx.fillStyle = '#cdd6f4'

      ctx.font = '11px "Courier New", monospace'
      ctx.fillText(line, 8, y)
    }

    // Blinking cursor
    const cursorOn = Math.floor(Date.now() / 500) % 2 === 0
    if (cursorOn) {
      ctx.fillStyle = '#00f2fe'
      ctx.fillRect(8, CODE_LINES.length * lineH - offsetRef.current % lineH + 2, 6, 11)
    }
    texture.needsUpdate = true
  })

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Room — walls, floor, ceiling, all furniture
// ─────────────────────────────────────────────────────────────────────────────
export function Room() {
  const lampOn = useLampStore((s) => s.lampOn)

  const codeTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 320
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Bookshelf books
  const books = useMemo(() => {
    const colors = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#e67e22', '#1abc9c', '#e74c3c', '#3498db']
    return Array.from({ length: 8 }, (_, i) => ({
      x: -2.5 + i * 0.22,
      color: colors[i % colors.length],
      h: 0.26 + Math.random() * 0.08,
      w: 0.14 + Math.random() * 0.04,
    }))
  }, [])

  return (
    <group>
      {/* ── Animate code on screen ── */}
      <ScrollingCode texture={codeTexture} />

      {/* ── FLOOR ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 6]} />
        <meshStandardMaterial color="#1a1206" roughness={0.9} />
      </mesh>
      {/* Wood grain planks (decorative strips) */}
      {[-1.2, -0.4, 0.4, 1.2].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, z]} receiveShadow>
          <planeGeometry args={[7, 0.6]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#1f1509' : '#231a0c'} roughness={0.95} />
        </mesh>
      ))}

      {/* ── BACK WALL ── */}
      <mesh position={[0, 2, -3]} receiveShadow>
        <boxGeometry args={[7, 4, 0.08]} />
        <meshStandardMaterial color="#16122a" roughness={0.95} />
      </mesh>

      {/* ── LEFT WALL (window wall) ── */}
      <mesh position={[-3, 2, 0]} receiveShadow>
        <boxGeometry args={[0.08, 4, 6]} />
        <meshStandardMaterial color="#13102a" roughness={0.95} />
      </mesh>

      {/* ── CEILING ── */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[7, 0.08, 6]} />
        <meshStandardMaterial color="#0e0c1a" roughness={1} />
      </mesh>

      {/* ── DESK + PROPS ── */}
      <DeskSetup />

      {/* Monitor screen (emissive with scrolling code) */}
      <mesh position={[0, 1.555, -0.37]}>
        <planeGeometry args={[1.65, 0.88]} />
        <meshStandardMaterial
          map={codeTexture}
          emissive="#4fc3f7"
          emissiveIntensity={lampOn ? 0.08 : 0.15}
          roughness={0.1}
        />
      </mesh>

      {/* ── DESK LAMP POINT LIGHT ── */}
      <pointLight
        color="#ffb74d"
        intensity={lampOn ? 1.4 : 0}
        position={[1.1, 1.4, -0.2]}
        distance={3.5}
        decay={2}
        castShadow={false}
      />

      {/* ── BOOKSHELF on back wall ── */}
      {/* Shelf board */}
      <mesh position={[-1.8, 1.9, -2.94]} castShadow>
        <boxGeometry args={[2.0, 0.04, 0.22]} />
        <meshStandardMaterial color="#2c1f14" roughness={0.7} />
      </mesh>
      {/* Books */}
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, 1.94 + b.h / 2, -2.9]} castShadow>
          <boxGeometry args={[b.w, b.h, 0.17]} />
          <meshStandardMaterial color={b.color} roughness={0.8} />
        </mesh>
      ))}

      {/* ── SMALL SERVER / ROUTER on shelf ── */}
      <ServerBox position={[-2.5, 2.08, -2.9]} />

      {/* ── WINDOW + CURTAINS ── */}
      <NightWindow />

      {/* ── CITY SKYLINE (visible through window) ── */}
      <CitySkyline />

      {/* ── RUG on floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0.5]}>
        <planeGeometry args={[2.4, 1.6]} />
        <meshStandardMaterial color="#1a0d2e" roughness={0.98} />
      </mesh>

      {/* ── POSTER / ART on back wall ── */}
      <mesh position={[1.8, 2.5, -2.93]}>
        <planeGeometry args={[0.8, 0.5]} />
        <meshStandardMaterial color="#0d1117" emissive="#1a1f35" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Server box with blinking LEDs
// ─────────────────────────────────────────────────────────────────────────────
function ServerBox({ position }: { position: [number, number, number] }) {
  const led1 = useRef<THREE.Mesh>(null!)
  const led2 = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const blink1 = Math.sin(t * 3.0) > 0 ? 1.5 : 0
    const blink2 = Math.sin(t * 2.2 + 1) > 0.3 ? 1.5 : 0
    if (led1.current) (led1.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blink1
    if (led2.current) (led2.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blink2
  })

  return (
    <group position={position}>
      {/* Box body */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.1, 0.18]} />
        <meshStandardMaterial color="#0d1117" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Ventilation grille lines */}
      {[0, 0.05, 0.1].map((dx, i) => (
        <mesh key={i} position={[dx - 0.08, 0, 0.09]}>
          <boxGeometry args={[0.01, 0.07, 0.001]} />
          <meshStandardMaterial color="#1a2035" />
        </mesh>
      ))}
      {/* LED 1 — green */}
      <mesh ref={led1} position={[0.12, 0.02, 0.09]}>
        <boxGeometry args={[0.02, 0.02, 0.001]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={1.5} />
      </mesh>
      {/* LED 2 — orange */}
      <mesh ref={led2} position={[0.09, 0.02, 0.09]}>
        <boxGeometry args={[0.02, 0.02, 0.001]} />
        <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={0} />
      </mesh>
    </group>
  )
}
