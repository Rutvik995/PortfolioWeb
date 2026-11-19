'use client';

import dynamic from 'next/dynamic';

/**
 * InitialLoadingScreen
 * Minimal centered spinner while WebGL shaders and GLTF models load
 */
function InitialLoadingScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#02050f',
        color: '#f8fafc',
        zIndex: 50,
      }}
    >
      <div style={{ position: 'relative', width: '48px', height: '48px', marginBottom: '16px' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '9999px',
            border: '2px solid #1e293b',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '9999px',
            border: '2px solid #38bdf8',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
      <div
        style={{
          fontSize: '11px',
          fontFamily: 'monospace',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#94a3b8',
        }}
      >
        Loading 3D Workstation...
      </div>
    </div>
  );
}

// Lazy-load 3D canvas (ssr: false)
const HeroScene = dynamic(
  () => import('@/components/canvas/HeroScene').then((mod) => mod.HeroScene),
  {
    ssr: false,
    loading: () => <InitialLoadingScreen />,
  }
);

export default function Home() {
  return (
    <main
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#02050f',
      }}
    >
      {/* ── 100% Pure Fullscreen 3D Scene ── */}
      <HeroScene enableControls={true} />
    </main>
  );
}
