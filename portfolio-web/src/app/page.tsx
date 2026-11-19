'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { HeroUI } from '@/components/ui/HeroUI';

/**
 * InitialLoadingScreen
 * Displayed while Next.js dynamically loads the WebGL bundle
 */
function InitialLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#02050f] text-slate-100">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
        <div
          className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"
          style={{ animationDuration: '0.8s' }}
        />
      </div>
      <div className="text-sm font-semibold tracking-wider text-slate-200">
        INITIALIZING 3D WORKSPACE
      </div>
      <div className="mt-1 text-xs font-mono text-slate-400">
        Loading WebGL Shaders & PBR Scene...
      </div>
    </div>
  );
}

// Lazy-load 3D canvas (ssr: false) with loading fallback
const HeroScene = dynamic(
  () => import('@/components/canvas/HeroScene').then((mod) => mod.HeroScene),
  {
    ssr: false,
    loading: () => <InitialLoadingScreen />,
  }
);

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Track window scroll for scroll-driven camera zoom
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / scrollHeight));
        setScrollProgress(progress);

        // Auto trigger section modal when scrolled deeply into monitor
        if (progress > 0.85 && !activeSection) {
          setActiveSection('projects');
        }
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeSection]);

  return (
    <main className="relative min-h-[220vh] bg-[#02050f] text-slate-100">
      {/* ── Fixed Fullscreen 3D Scene Container ── */}
      <div className="fixed inset-0 z-0 w-screen h-screen">
        <HeroScene
          scrollProgress={scrollProgress}
          onObjectClick={(sectionId) => setActiveSection(sectionId)}
          enableControls={!isMobile}
        />
      </div>

      {/* ── Surrounding UI Layer (Navbar, Hotspots, Modals) ── */}
      <HeroUI
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        scrollProgress={scrollProgress}
      />

      {/* ── Virtual Scroll Spacing ── */}
      <div className="relative z-10 pointer-events-none h-[220vh]" />
    </main>
  );
}
