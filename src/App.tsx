import { Suspense, useState } from 'react'
import './index.css'
import { SceneCanvas } from './components/canvas/SceneCanvas'
import { Navbar } from './components/ui/Navbar'
import { HeroOverlay } from './components/ui/HeroOverlay'
import { ProjectModal } from './components/ui/ProjectModal'
import { SkillsDrawer } from './components/ui/SkillsDrawer'
import { GitHubRepos } from './components/ui/GitHubRepos'
import { AgentTerminal } from './components/ui/AgentTerminal'
import { featuredProjects } from './data/portfolioData'
import type { Project } from './data/portfolioData'

function LoadingScreen() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050816',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '2px solid rgba(129,140,248,0.2)',
          borderTopColor: 'var(--color-accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span
        style={{
          fontSize: '0.8rem',
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
        }}
      >
        Initializing scene…
      </span>
    </div>
  )
}

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)

  const handleProjectClick = (id: string) => {
    const project = featuredProjects.find(p => p.id === id) ?? null
    setSelectedProject(project)
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#050816',
        overflow: 'hidden',
      }}
    >
      {/* ── 3D Canvas — base layer ── */}
      <Suspense fallback={<LoadingScreen />}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <SceneCanvas />
        </div>
      </Suspense>

      {/* ── UI overlays ── */}
      <Navbar />
      <HeroOverlay onProjectClick={handleProjectClick} />
      <GitHubRepos />

      {/* Skills tab trigger */}
      <button
        onClick={() => setSkillsOpen(true)}
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%) rotate(90deg)',
          transformOrigin: 'right center',
          zIndex: 30,
          padding: '0.4rem 1rem',
          background: 'rgba(13,17,32,0.8)',
          border: '1px solid rgba(129,140,248,0.25)',
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
          color: 'var(--color-accent)',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.08em',
          pointerEvents: 'auto',
          transition: 'background 0.2s',
          marginRight: '0',
          translate: '0 -50%',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,17,32,0.95)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,17,32,0.8)' }}
      >
        ⚡ Tech Stack
      </button>

      {/* Agent Terminal */}
      <AgentTerminal open={terminalOpen} onToggle={() => setTerminalOpen(o => !o)} />

      {/* Modals / Drawers */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <SkillsDrawer open={skillsOpen} onClose={() => setSkillsOpen(false)} />
    </div>
  )
}

export default App
