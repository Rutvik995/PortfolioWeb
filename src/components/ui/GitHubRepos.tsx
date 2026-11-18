import { useState, useEffect } from 'react'
import { fallbackRepos } from '../../data/portfolioData'

interface GitHubRepo {
  id: number
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  html_url: string
}

const LANG_COLORS: Record<string, string> = {
  Python: '#3572A5',
  TypeScript: '#2b7489',
  JavaScript: '#f1e05a',
  'Jupyter Notebook': '#DA5B0B',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Kotlin: '#F18E33',
  Java: '#b07219',
}

export function GitHubRepos() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://api.github.com/users/Rutvik995/repos?sort=updated&per_page=8')
      .then(r => r.json())
      .then((data: GitHubRepo[]) => {
        if (Array.isArray(data)) setRepos(data)
        else setRepos(fallbackRepos)
      })
      .catch(() => setRepos(fallbackRepos))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section
      style={{
        position: 'absolute',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 20,
        width: '320px',
        maxHeight: '52vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        pointerEvents: 'auto',
      }}
    >
      <h3
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '0.6rem',
          paddingLeft: '0.5rem',
        }}
      >
        Live GitHub Repositories
      </h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          overflowY: 'auto',
          maxHeight: '44vh',
          paddingRight: '0.25rem',
        }}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: '64px',
                  borderRadius: '10px',
                  background: 'rgba(13,17,32,0.6)',
                  animation: 'shimmer 1.5s infinite',
                  border: '1px solid rgba(129,140,248,0.08)',
                }}
              />
            ))
          : repos.map(repo => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '0.65rem 0.8rem',
                  background: 'rgba(13,17,32,0.68)',
                  border: '1px solid rgba(129,140,248,0.1)',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transition: 'border-color 0.2s, background 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.borderColor = 'rgba(129,140,248,0.35)'
                  el.style.background = 'rgba(13,17,32,0.88)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.borderColor = 'rgba(129,140,248,0.1)'
                  el.style.background = 'rgba(13,17,32,0.68)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--color-accent)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px',
                    }}
                  >
                    {repo.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                    ★ {repo.stargazers_count}
                  </span>
                </div>
                {repo.description && (
                  <p
                    style={{
                      fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.45)',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      marginBottom: '0.3rem',
                    }}
                  >
                    {repo.description}
                  </p>
                )}
                {repo.language && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: LANG_COLORS[repo.language] ?? '#8b8b8b',
                        flexShrink: 0,
                      }}
                    />
                    {repo.language}
                  </span>
                )}
              </a>
            ))}
      </div>
    </section>
  )
}
