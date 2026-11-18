import { useState, useEffect } from 'react'
import { personalInfo, kineticSubtitles, featuredProjects } from '../../data/portfolioData'

interface HeroOverlayProps {
  onProjectClick?: (id: string) => void
}

export function HeroOverlay({ onProjectClick }: HeroOverlayProps) {
  const [subtitleIndex, setSubtitleIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setSubtitleIndex(i => (i + 1) % kineticSubtitles.length)
        setVisible(true)
      }, 350)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '5%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        maxWidth: '420px',
        pointerEvents: 'none',
      }}
    >
      {/* Eyebrow */}
      <p
        style={{
          fontSize: '0.78rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--color-cyan)',
          marginBottom: '0.6rem',
          fontWeight: 600,
        }}
      >
        Hello, I'm
      </p>

      {/* Main name */}
      <h1
        style={{
          fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
          fontWeight: 800,
          lineHeight: 1.05,
          color: '#fff',
          marginBottom: '0.35rem',
          letterSpacing: '-0.01em',
        }}
      >
        {personalInfo.name}
      </h1>

      {/* Title line */}
      <p
        style={{
          fontSize: '0.95rem',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '1rem',
          letterSpacing: '0.01em',
        }}
      >
        {personalInfo.title}
      </p>

      {/* Kinetic subtitle */}
      <div
        style={{
          height: '1.8rem',
          marginBottom: '1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--color-accent)',
            flexShrink: 0,
            boxShadow: '0 0 8px var(--color-accent)',
          }}
        />
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-accent)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(6px)',
          }}
        >
          {kineticSubtitles[subtitleIndex]}
        </span>
      </div>

      {/* Bio */}
      <p
        style={{
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.65,
          marginBottom: '1.6rem',
          maxWidth: '340px',
        }}
      >
        Building production-grade AI agents that plan, reason, and execute.
        LangGraph · Multi-Agent Systems · Full-Stack AI.
      </p>

      {/* CTAs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={() => onProjectClick?.('terrahive')}
          style={{
            padding: '0.6rem 1.3rem',
            background: 'rgba(129,140,248,0.15)',
            border: '1px solid rgba(129,140,248,0.5)',
            borderRadius: '50px',
            color: 'var(--color-accent)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.28)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.15)' }}
        >
          View Projects →
        </button>
        <a
          href={personalInfo.github}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '0.6rem 1.3rem',
            background: 'rgba(0,242,254,0.08)',
            border: '1px solid rgba(0,242,254,0.3)',
            borderRadius: '50px',
            color: 'var(--color-cyan)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,242,254,0.18)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,242,254,0.08)' }}
        >
          GitHub ↗
        </a>
      </div>

      {/* Drag hint */}
      <p
        style={{
          marginTop: '1.8rem',
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.28)',
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        <span style={{ fontSize: '0.9rem' }}>⟳</span>
        Drag to rotate · Scroll to zoom
      </p>

      {/* Project quick-access pills */}
      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        {featuredProjects.map(p => (
          <button
            key={p.id}
            onClick={() => onProjectClick?.(p.id)}
            style={{
              padding: '0.3rem 0.7rem',
              background: 'rgba(13,17,32,0.5)',
              border: '1px solid rgba(129,140,248,0.15)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.65)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.2s, color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(129,140,248,0.15)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
            }}
          >
            <span style={{ color: 'var(--color-accent)', fontSize: '0.6rem' }}>▶</span>
            {p.name.split('—')[0].trim()}
          </button>
        ))}
      </div>
    </div>
  )
}
