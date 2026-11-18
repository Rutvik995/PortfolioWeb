import { useState } from 'react'
import { personalInfo, navItems } from '../../data/portfolioData'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      style={{
        position: 'absolute',
        top: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.55rem 1.4rem',
        background: 'rgba(13,17,32,0.72)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(129,140,248,0.2)',
        borderRadius: '50px',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      {/* Monogram */}
      <span
        style={{
          fontWeight: 800,
          fontSize: '1rem',
          color: 'var(--color-accent)',
          letterSpacing: '0.05em',
          marginRight: '0.75rem',
        }}
      >
        {personalInfo.name.split(' ').map(w => w[0]).join('')}
      </span>

      {/* Nav links — desktop */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
        }}
      >
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '50px',
              fontSize: '0.82rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(129,140,248,0.15)'
              el.style.color = '#fff'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'transparent'
              el.style.color = 'rgba(255,255,255,0.75)'
            }}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Status dot */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          marginLeft: '0.75rem',
          fontSize: '0.78rem',
          color: '#34d399',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 6px #34d399',
            animation: 'pulse-dot 2s infinite',
            flexShrink: 0,
          }}
        />
        Available
      </span>

      {/* Hamburger (mobile) */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '1.2rem',
          marginLeft: '0.5rem',
        }}
        aria-label="Toggle menu"
      >
        ☰
      </button>
    </nav>
  )
}
