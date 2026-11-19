'use client';

import dynamic from 'next/dynamic';

/**
 * InitialLoadingScreen
 * Minimal, centered dark spinner while the WebGL scene compiles
 */
function InitialLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#02050f] text-slate-100">
      <div className="relative w-14 h-14 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
        <div
          className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"
          style={{ animationDuration: '0.8s' }}
        />
      </div>
      <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
        Loading 3D Scene...
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
    <main className="w-screen h-screen overflow-hidden bg-[#02050f]">
      {/* ── 100% Pure Fullscreen 3D Scene (No HTML UI / overlays) ── */}
      <HeroScene enableControls={true} />
    </main>
  );
}
