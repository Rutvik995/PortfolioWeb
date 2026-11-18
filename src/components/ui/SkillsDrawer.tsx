import { techStackCategories } from '../../data/portfolioData'

interface SkillsDrawerProps {
  open: boolean
  onClose: () => void
}

const CAT_COLORS: Record<string, string> = {
  'AI/ML': '#818cf8',
  'Backend': '#34d399',
  'Frontend': '#00f2fe',
  'Tools': '#fb923c',
}

export function SkillsDrawer({ open, onClose }: SkillsDrawerProps) {
  return (
    <>
      {/* Slide-in panel */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '300px',
          zIndex: 60,
          background: 'rgba(10,13,28,0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderLeft: '1px solid rgba(129,140,248,0.2)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflowY: 'auto',
          padding: '2rem 1.5rem',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.6rem',
          }}
        >
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.02em',
            }}
          >
            Tech Stack ⚡
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '1.2rem',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0.2rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            ×
          </button>
        </div>

        {/* Categories */}
        {techStackCategories.map(cat => (
          <div key={cat.name} style={{ marginBottom: '1.4rem' }}>
            <h3
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: CAT_COLORS[cat.name] ?? 'rgba(255,255,255,0.4)',
                marginBottom: '0.6rem',
              }}
            >
              {cat.name}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {cat.skills.map(skill => (
                <span
                  key={skill}
                  style={{
                    padding: '0.28rem 0.7rem',
                    background: 'rgba(129,140,248,0.08)',
                    border: `1px solid ${CAT_COLORS[cat.name] ?? 'rgba(129,140,248,0.2)'}28`,
                    borderRadius: '50px',
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.75)',
                    fontWeight: 500,
                    transition: 'background 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.18)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.08)' }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </aside>

      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 59,
            background: 'rgba(0,0,0,0.3)',
          }}
        />
      )}
    </>
  )
}
