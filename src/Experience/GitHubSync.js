import { portfolioData } from '../data/portfolio.js'
import screenSync from './ScreenSync.js'

const GITHUB_USERNAME = 'Rutvik995'
const CACHE_KEY = 'rutvik_github_daily_sync_v1'
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const EXCLUDED_REPOS = new Set(['Rutvik995'])

function humanizeTitle(name) {
    return (name || '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildLiveFallbackProject(repo) {
    const title = humanizeTitle(repo.name)
    const tabName = repo.language === 'Kotlin'
        ? 'MainActivity.kt'
        : repo.language === 'JavaScript'
            ? 'index.js'
            : 'app.py'
    const stack = []
    if (repo.language) stack.push(repo.language)
    if (Array.isArray(repo.topics)) {
        repo.topics.forEach((t) => {
            if (!stack.includes(t)) stack.push(t)
        })
    }
    if (stack.length === 0) stack.push('GitHub')

    return {
        id: (repo.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        repoName: repo.name,
        shortTitle: title.length > 20 ? `${title.slice(0, 18).trim()}…` : title,
        title,
        tabName,
        description: repo.description || `Public ${repo.language || 'software'} repository on GitHub.`,
        stack: stack.slice(0, 6),
        githubUrl: repo.html_url,
        liveUrl: repo.homepage && repo.homepage.trim() ? repo.homepage.trim() : repo.html_url,
        monitorSnippet: `# ${repo.name} (Synced Public GitHub Repo)\n# ${repo.html_url}\nprint("Loaded ${repo.name}")`
    }
}

function applyPublicRepoList(liveRepos) {
    if (!Array.isArray(liveRepos)) return false

    const validPublic = liveRepos.filter(
        (r) => r && !r.private && !EXCLUDED_REPOS.has(r.name) && (r.size || 0) > 0
    )

    // Index existing curated daily snapshot by repoName / githubUrl
    const existingByRepo = new Map()
    ;(portfolioData.projects || []).forEach((p) => {
        const key = p.repoName || (p.githubUrl ? p.githubUrl.split('/').pop() : p.id)
        if (key) existingByRepo.set(key, p)
    })

    // Only keep projects that are STILL public right now, preserving curated order & adding new ones
    const liveNameSet = new Set(validPublic.map((r) => r.name))
    const nextProjects = []

    // 1. Keep currently public curated projects in their curated order
    ;(portfolioData.projects || []).forEach((p) => {
        const key = p.repoName || (p.githubUrl ? p.githubUrl.split('/').pop() : '')
        if (liveNameSet.has(key)) {
            const liveMeta = validPublic.find((r) => r.name === key)
            nextProjects.push({
                ...p,
                githubUrl: liveMeta?.html_url || p.githubUrl,
                liveUrl: liveMeta?.homepage && liveMeta.homepage.trim() ? liveMeta.homepage.trim() : (liveMeta?.html_url || p.liveUrl)
            })
        }
    })

    // 2. Append any newly made public repos not yet in the static daily build snapshot
    validPublic.forEach((repo) => {
        if (!existingByRepo.has(repo.name)) {
            nextProjects.push(buildLiveFallbackProject(repo))
        }
    })

    const prevSig = JSON.stringify((portfolioData.projects || []).map((p) => p.repoName || p.id))
    const nextSig = JSON.stringify(nextProjects.map((p) => p.repoName || p.id))

    if (prevSig !== nextSig) {
        portfolioData.projects = nextProjects
        screenSync.emit('projects:updated', portfolioData.projects)
        return true
    }
    return false
}

/**
 * Reconciles portfolioData.projects against live public GitHub repos at most once every 24 hours
 * per browser (acting alongside the daily GitHub Actions workflow).
 */
export async function syncPublicReposDaily() {
    try {
        const rawCache = localStorage.getItem(CACHE_KEY)
        if (rawCache) {
            const parsed = JSON.parse(rawCache)
            if (parsed && Array.isArray(parsed.repos) && Date.now() - parsed.syncedAt < ONE_DAY_MS) {
                applyPublicRepoList(parsed.repos)
                return
            }
        }
    } catch {
        // Ignore storage read errors
    }

    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`, {
            headers: { Accept: 'application/vnd.github+json' }
        })
        if (!res.ok) return
        const repos = await res.json()
        if (!Array.isArray(repos)) return

        const compact = repos.map((r) => ({
            name: r.name,
            private: r.private,
            size: r.size,
            description: r.description,
            language: r.language,
            topics: r.topics || [],
            html_url: r.html_url,
            homepage: r.homepage
        }))

        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ syncedAt: Date.now(), repos: compact }))
        } catch {
            // Ignore quota errors
        }

        applyPublicRepoList(compact)
    } catch {
        // Network offline or rate-limited — keep daily snapshot silently
    }
}
