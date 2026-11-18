import { useEffect, useCallback } from 'react'
import type { Project } from '../../data/portfolioData'

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!project) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5,8,22,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(13,17,32,0.96)',
          border: '1px solid rgba(129,140,248,0.3)',
          borderRadius: '16px',
          padding: '2rem 2.4rem',
          maxWidth: '560px',
          width: '90vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 0 60px rgba(129,140,248,0.12)',
          animation: 'slideUp 0.25s ease',
          pointerEvents: 'auto',
        }}
      >
        {/* Category tag */}
        <span
          style={{
            display: 'inline-block',
            padding: '0.2rem 0.65rem',
            background: 'rgba(129,140,248,0.15)',
            border: '1px solid rgba(129,140,248,0.3)',
            borderRadius: '50px',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--color-accent)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          AI/ML · Engineering
        </span>

        {/* Title */}
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#fff',
            marginBottom: '0.75rem',
            lineHeight: 1.2,
          }}
        >
          {project.name}
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.7,
            marginBottom: '1.4rem',
          }}
        >
          {project.description}
        </p>

        {/* Tech tags */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
            marginBottom: '1.6rem',
          }}
        >
          {project.tech.map(t => (
            <span
              key={t}
              style={{
                padding: '0.25rem 0.6rem',
                background: 'rgba(0,242,254,0.08)',
                border: '1px solid rgba(0,242,254,0.2)',
                borderRadius: '50px',
                fontSize: '0.75rem',
                color: 'var(--color-cyan)',
                fontWeight: 500,
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.6rem 1.2rem',
                background: 'rgba(129,140,248,0.15)',
                border: '1px solid rgba(129,140,248,0.4)',
                borderRadius: '8px',
                color: 'var(--color-accent)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.28)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.15)' }}
            >
              View on GitHub ↗
            </a>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
