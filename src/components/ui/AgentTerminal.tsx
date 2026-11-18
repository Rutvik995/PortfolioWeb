import { useState, useEffect, useRef } from 'react'

const AGENT_LINES = [
  { label: 'ORCHESTRATOR', text: 'Initializing multi-agent pipeline...', color: '#818cf8' },
  { label: 'PLANNER', text: 'Decomposing goal into sub-tasks...', color: '#a5b4fc' },
  { label: 'WORKER-1', text: 'Analyzing solar telemetry data...', color: '#00f2fe' },
  { label: 'WORKER-2', text: 'Running LangGraph state machine...', color: '#00f2fe' },
  { label: 'WORKER-3', text: 'Querying PostgreSQL time-series store...', color: '#00f2fe' },
  { label: 'SYNTHESIS', text: 'Aggregating agent outputs (3 results)...', color: '#34d399' },
  { label: 'GATEKEEPER', text: 'Validating response against schema...', color: '#fb923c' },
  { label: 'OUTPUT', text: 'Pipeline complete. 3 agents · 1.4s execution.', color: '#34d399' },
  { label: 'SYSTEM', text: 'Ready for next goal. Awaiting input...', color: '#6b7280' },
]

interface AgentTerminalProps {
  open: boolean
  onToggle: () => void
}

export function AgentTerminal({ open, onToggle }: AgentTerminalProps) {
  const [displayedLines, setDisplayedLines] = useState<typeof AGENT_LINES>([])
  const [charIdx, setCharIdx] = useState(0)
  const [lineIdx, setLineIdx] = useState(0)
  const [charBuffer, setCharBuffer] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    intervalRef.current = setInterval(() => {
      const currentLine = AGENT_LINES[lineIdx]
      if (!currentLine) return

      const fullText = currentLine.text
      if (charIdx < fullText.length) {
        setCharBuffer(fullText.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      } else {
        setDisplayedLines(prev => [...prev, currentLine])
        const nextLine = (lineIdx + 1) % AGENT_LINES.length
        if (nextLine === 0) {
          setTimeout(() => {
            setDisplayedLines([])
            setLineIdx(0)
            setCharIdx(0)
            setCharBuffer('')
          }, 1200)
        } else {
          setLineIdx(nextLine)
          setCharIdx(0)
          setCharBuffer('')
        }
      }
    }, 28)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [open, lineIdx, charIdx])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayedLines, charBuffer])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        width: 'min(640px, 90vw)',
        pointerEvents: 'auto',
      }}
    >
      {/* Toggle tab */}
      <button
        onClick={onToggle}
        style={{
          display: 'block',
          width: '100%',
          padding: '0.3rem 1rem',
          background: 'rgba(13,17,32,0.85)',
          border: '1px solid rgba(0,242,254,0.2)',
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
          color: 'var(--color-cyan)',
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'background 0.2s',
          fontFamily: 'monospace',
        }}
      >
        {open ? '▼ Agent Trace' : '▲ Agent Trace'}
      </button>

      {/* Terminal body */}
      <div
        style={{
          height: open ? '180px' : '0',
          overflow: 'hidden',
          transition: 'height 0.3s cubic-bezier(0.4,0,0.2,1)',
          background: 'rgba(10,13,20,0.97)',
          border: '1px solid rgba(0,242,254,0.15)',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
        }}
      >
        <div
          style={{
            height: '100%',
            overflowY: 'auto',
            padding: '0.75rem 1rem',
            fontFamily: '"Courier New", "Cascadia Code", monospace',
            fontSize: '0.78rem',
            lineHeight: 1.6,
          }}
        >
          {displayedLines.map((line, i) => (
            <div key={i} style={{ color: 'rgba(255,255,255,0.7)' }}>
              <span style={{ color: line.color, fontWeight: 700 }}>
                [{line.label}]
              </span>{' '}
              {line.text}
            </div>
          ))}

          {/* Currently typing line */}
          {lineIdx < AGENT_LINES.length && charBuffer && (
            <div style={{ color: 'rgba(255,255,255,0.7)' }}>
              <span
                style={{
                  color: AGENT_LINES[lineIdx].color,
                  fontWeight: 700,
                }}
              >
                [{AGENT_LINES[lineIdx].label}]
              </span>{' '}
              {charBuffer}
              <span
                style={{
                  display: 'inline-block',
                  width: '7px',
                  height: '13px',
                  background: 'var(--color-cyan)',
                  marginLeft: '2px',
                  verticalAlign: 'middle',
                  animation: 'blink 0.8s step-end infinite',
                }}
              />
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  )
}
