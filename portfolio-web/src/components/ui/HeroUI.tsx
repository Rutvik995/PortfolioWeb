'use client';

import { useState } from 'react';
import { portfolioConfig } from '@/config/portfolio.config';
import {
  Code2,
  Terminal,
  Cpu,
  Mail,
  ExternalLink,
  X,
  Compass,
} from 'lucide-react';

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

interface HeroUIProps {
  activeSection: string | null;
  setActiveSection: (sec: string | null) => void;
  scrollProgress: number;
}

export function HeroUI({
  activeSection,
  setActiveSection,
  scrollProgress,
}: HeroUIProps) {
  const [showHotspots, setShowHotspots] = useState(true);

  const selectedData = portfolioConfig.sections.find((s) => s.id === activeSection);

  return (
    <>
      {/* ── Top Navigation Bar ── */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-5 md:px-12 backdrop-blur-md bg-slate-950/40 border-b border-slate-800/40 transition-all">
        {/* Brand / Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
            R
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-slate-100">
              {portfolioConfig.developer.name}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {portfolioConfig.developer.role}
            </p>
          </div>
        </div>

        {/* Live Availability Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {portfolioConfig.developer.status}
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 md:gap-4">
          {portfolioConfig.sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSection === sec.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {sec.title}
            </button>
          ))}
        </nav>
      </header>

      {/* ── 3D Scene Interactive Hotspots Overlay ── */}
      {showHotspots && scrollProgress < 0.2 && !activeSection && (
        <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-end p-6 md:p-12">
          {/* Floating Feature Pills */}
          <div className="flex flex-wrap items-center gap-3 pointer-events-auto">
            <button
              onClick={() => setActiveSection('projects')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-md shadow-xl transition-transform hover:scale-105"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>[Main Monitor: Featured Projects]</span>
            </button>

            <button
              onClick={() => setActiveSection('about')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 text-slate-300 text-xs font-mono backdrop-blur-md shadow-xl transition-transform hover:scale-105"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>[Neural Monitor: About Stack]</span>
            </button>

            <button
              onClick={() => setActiveSection('contact')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 text-slate-300 text-xs font-mono backdrop-blur-md shadow-xl transition-transform hover:scale-105"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>[Laptop: Connect & Inquire]</span>
            </button>

            <button
              onClick={() => setShowHotspots(false)}
              className="px-2.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 text-xs border border-slate-800 transition-colors"
              title="Dismiss hotspot hints"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Scroll Prompt */}
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Drag to inspect room • Scroll down to enter terminal</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-slate-400">
              <a
                href={portfolioConfig.developer.socials.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href={portfolioConfig.developer.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href={portfolioConfig.developer.socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Active Section Modal Overlay ── */}
      {selectedData && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-8 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-cyan-950/50">
            {/* Close Button */}
            <button
              onClick={() => setActiveSection(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="mb-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
              {selectedData.subtitle}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">
              {selectedData.title}
            </h2>

            <p className="text-slate-300 leading-relaxed text-sm md:text-base mb-6">
              {selectedData.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {selectedData.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-800/80 text-cyan-300 border border-slate-700/60"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {selectedData.id === 'contact' ? (
                <a
                  href={portfolioConfig.developer.socials.email}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-transform hover:scale-105 shadow-lg shadow-cyan-500/20"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Direct Email</span>
                </a>
              ) : (
                <a
                  href={portfolioConfig.developer.socials.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-transform hover:scale-105 shadow-lg shadow-cyan-500/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Repository</span>
                </a>
              )}

              <button
                onClick={() => setActiveSection(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                Back to 3D Scene
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
