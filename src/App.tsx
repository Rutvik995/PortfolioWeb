import { Suspense } from 'react'
import './index.css'
import { SceneCanvas } from './components/canvas/SceneCanvas'

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
        background: '#060918',
        gap: '1rem',
      }}
    >
      <div style={{ width: '36px', height: '36px', border: '2px solid rgba(130,160,255,0.15)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', textTransform: 'uppercase' }}>
        Loading scene…
      </span>
    </div>
  )
}

function App() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#060918', overflow: 'hidden' }}>
      <Suspense fallback={<LoadingScreen />}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <SceneCanvas />
        </div>
      </Suspense>
    </div>
  )
}

export default App
