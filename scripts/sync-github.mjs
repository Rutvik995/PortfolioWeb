import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const OUT_FILE = path.join(ROOT_DIR, 'src', 'data', 'githubProjects.json')
const GITHUB_USER = process.env.GITHUB_USERNAME || 'Rutvik995'

// Profile/empty repos that should not be listed as standalone projects
const EXCLUDED_REPOS = new Set(['Rutvik995'])

// Display ordering for known flagship repos (any newly published public repo still shows cleanly!)
const PRIORITY_ORDER = {
    'Solar-Power-Plant-Analysis': 1,
    'DataAnalysis_Multi-Agentic-System': 2,
    'Travel_AI_Agent': 3,
    'Plant-Leaf-Disease-Detection': 4,
    'STOCK-ALGO': 5,
    'Aquaserve': 6,
    'Power-BI-Dashboards': 7,
    'AI-PROGRAMS': 8,
    'PortfolioWeb': 9
}

// Curated presentation metadata applied ONLY when the repository is returned as PUBLIC by GitHub API.
// If a repo is turned Private on GitHub, this script ignores it completely and never writes it to JSON.
const CURATED_META = {
    'Solar-Power-Plant-Analysis': {
        id: 'solar-power-analysis',
        shortTitle: 'Solar Power AI',
        title: 'Solar Power Plant Analysis Platform',
        tabName: 'graph.py',
        description:
            'Enterprise operational intelligence and conversational analytics platform for commercial solar PV facilities, pairing a React 18 dashboard with a deterministic LangGraph multi-agent copilot, FastAPI backend, PostgreSQL store, and 276 passing tests.',
        stack: ['Python', 'LangGraph', 'FastAPI', 'PostgreSQL', 'React 18', 'TailwindCSS'],
        monitorSnippet: `from langgraph.graph import StateGraph, END
from backend.schemas import AgentState
from backend.agents.supervisor import supervisor_node

# Solar PV multi-agent StateGraph
g = StateGraph(AgentState)
g.add_node("supervisor", supervisor_node)
g.add_node("sql_orchestrator", sql_orchestrator_node)
g.add_node("diagnostic_agent", diagnostic_agent_node)
g.add_node("predictive_agent", predictive_agent_node)
g.add_node("synthesis_agent", synthesis_agent_node)

g.set_entry_point("supervisor")
g.add_edge("synthesis_agent", END)
solar_graph = g.compile()`
    },
    'DataAnalysis_Multi-Agentic-System': {
        id: 'data-analysis-agent',
        shortTitle: 'DataAnalysis Agent',
        title: 'Multi-Agent Data Analysis & Visualization System',
        tabName: 'app.py',
        description:
            'Autonomous multi-agent SQL and visualization pipeline built with PydanticAI, LangChain, DeepAgents, and PostgreSQL (asyncpg). Converts natural-language requests into validated SQL queries, generates interactive Plotly charts, and asks clarifying follow-up questions when requirements are ambiguous.',
        stack: ['Python', 'PydanticAI', 'LangChain', 'DeepAgents', 'PostgreSQL', 'Plotly'],
        monitorSnippet: `from pydantic_ai import Agent
from langchain_core.tools import tool
from deepagents import create_deep_agent

# Text-to-SQL & Plotly Clarification Workflow
@tool
async def fetch_data_via_sql(requirement: str) -> str:
    result = await sql_agent.run(requirement)
    return result.output

@tool
async def clarify_with_user(question: str) -> str:
    result = await embodiment_agent.run(question)
    return result.output

manager = create_deep_agent(model=manager_llm,
    tools=[fetch_data_via_sql, clarify_with_user])`
    },
    'Travel_AI_Agent': {
        id: 'travel-ai-agent',
        shortTitle: 'Travel AI Agent',
        title: 'ARVEX — Multi-Agent AI Travel Planner',
        tabName: 'travel_agent.py',
        description:
            'Multi-agent AI travel planning assistant powered by LangGraph and CrewAI with Serper live web search tools, OpenRouter LLM routing, persistent thread memory, and a dark glassmorphism Flask chat interface for customized day-by-day itineraries.',
        stack: ['Python', 'LangGraph', 'CrewAI', 'Flask', 'OpenRouter', 'Serper API'],
        monitorSnippet: `from flask import Flask, request, jsonify
from langgraph.graph import StateGraph, END
from crewai import Crew, Agent, Task

# ARVEX LangGraph + CrewAI Travel Planner
@flask_app.route("/chat", methods=["POST"])
def plan_itinerary():
    user_msg = request.json.get("message", "")
    config = {"configurable": {"thread_id": thread_id}}
    res = graph.invoke({"messages": [user_msg]}, config)
    reply = res["messages"][-1].content
    return jsonify({"reply": reply.strip()})`
    },
    'Plant-Leaf-Disease-Detection': {
        id: 'plant-disease-detection',
        shortTitle: 'Plant Disease AI',
        title: 'Plant Leaf Disease Detection System',
        tabName: 'plant_app.py',
        description:
            'Real-time AI web application diagnosing crop leaf diseases across 39 PlantVillage categories using a MobileNetV2 CNN (97.42% test accuracy) served via Flask, returning top-5 probabilities with organic and chemical treatment advice.',
        stack: ['Python', 'TensorFlow', 'Keras', 'MobileNetV2', 'Flask', 'NumPy'],
        monitorSnippet: `import tensorflow as tf
import numpy as np
from plant_data import PLANT_CLASSES

# MobileNetV2 39-Class Inference (97.42% Acc)
model = tf.keras.models.load_model("plant_model.keras")

def predict_leaf_disease(img_tensor):
    preds = model.predict(img_tensor)[0]
    top_idx = int(np.argmax(preds))
    confidence = float(preds[top_idx]) * 100.0
    return {"disease": PLANT_CLASSES[top_idx],
            "confidence": round(confidence, 2)}`
    },
    'STOCK-ALGO': {
        id: 'stock-algo',
        shortTitle: 'STOCK-ALGO',
        title: 'STOCK-ALGO — Market Strategy & Backtesting',
        tabName: 'stock_algo.py',
        description:
            'Algorithmic trading and NIFTY 100 strategy backtesting platform built with Python, Pandas, TensorFlow, Scikit-Learn, and Plotly/Dash, computing SMA/EMA, RSI, MACD, Bollinger Bands, Sharpe Ratio, and cumulative returns.',
        stack: ['Python', 'Pandas', 'TensorFlow', 'Scikit-Learn', 'Plotly', 'Dash'],
        monitorSnippet: `import yfinance as yf
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf

# NIFTY 100 Technical Indicators & Backtest
df = yf.download("RELIANCE.NS", period="1y")
df["SMA_20"] = df["Close"].rolling(20).mean()
df["EMA_50"] = df["Close"].ewm(span=50).mean()
signal = (df["SMA_20"] > df["EMA_50"]).astype(int)
returns = df["Close"].pct_change() * signal.shift(1)
sharpe = (returns.mean() / returns.std()) * (252 ** 0.5)`
    },
    'Aquaserve': {
        id: 'aquaserve',
        shortTitle: 'Aquaserve Android',
        title: 'Aquaserve — Water Delivery Android App',
        tabName: 'AquaserveApp.kt',
        description:
            'Native Android application built with Kotlin and Jetpack Compose paired with a Node.js backend for three-panel multi-tenant water delivery logistics, live order status tracking, and payment history.',
        stack: ['Kotlin', 'Android SDK', 'Jetpack Compose', 'Node.js', 'REST APIs', 'Gradle'],
        monitorSnippet: `// Aquaserve Native Android Logistics Client
class DeliveryOrderRepository(
    private val api: AquaserveApiService
) {
    suspend fun placeOrder(request: OrderRequest): Result {
        val response = api.createDeliveryOrder(request)
        return response.toDomainState()
    }

    suspend fun trackActiveOrders(userId: String) =
        api.fetchLiveTrackingFeed(userId)
}`
    },
    'Power-BI-Dashboards': {
        id: 'power-bi-dashboards',
        shortTitle: 'Power BI BI',
        title: 'Power BI Dashboards & KPI Analytics',
        tabName: 'analytics.dax',
        description:
            'Collection of interactive Power BI and DAX business intelligence workbooks including Aquaserve Dashboard, Nike Sales Dashboard, and executive KPI performance reporting.',
        stack: ['Power BI', 'DAX', 'KPI Tracking', 'Sales Analytics', 'Data Visualization'],
        monitorSnippet: `-- Power BI DAX Executive Sales & KPI Model
Total Revenue = SUM(Sales[NetAmount])

YoY Growth % =
    VAR PrevYear = CALCULATE([Total Revenue],
        SAMEPERIODLASTYEAR(Calendar[Date]))
    RETURN
        DIVIDE([Total Revenue] - PrevYear, PrevYear, 0)

Avg Order Value =
    DIVIDE([Total Revenue], DISTINCTCOUNT(Sales[OrderId]))`
    },
    'AI-PROGRAMS': {
        id: 'ai-programs',
        shortTitle: 'AI Programs',
        title: 'AI-PROGRAMS — Classical Search & Expert Systems',
        tabName: '8_puzzle.py',
        description:
            'Python implementations of classic Artificial Intelligence algorithms covering 8-Puzzle heuristic search, N-Queens backtracking, Travelling Salesperson optimization, Water Jug search, game AI, and rule-based expert systems.',
        stack: ['Python', 'Heuristic Search', 'Backtracking', 'Game AI', 'Expert Systems'],
        monitorSnippet: `# Classical State-Space Search & Heuristics
def solve_8_puzzle(start, goal):
    frontier = [(manhattan(start, goal), 0, start)]
    visited = set()
    while frontier:
        _, cost, state = heapq.heappop(frontier)
        if state == goal:
            return cost
        visited.add(state)
        for nxt in expand_moves(state):
            if nxt not in visited:
                heapq.heappush(frontier, (cost + 1, nxt))`
    },
    'PortfolioWeb': {
        id: 'portfolio-web',
        shortTitle: '3D Portfolio',
        title: 'PortfolioWeb — Interactive 3D Developer Room',
        tabName: 'Experience.js',
        description:
            'Interactive 3D WebGL developer room built with Three.js, custom GLSL baked lighting shaders, live raycast screen synchronization, Smart TV music visualizer, and an interactive in-room 3D MacBook AI assistant.',
        stack: ['Three.js', 'WebGL', 'GLSL', 'GSAP', 'JavaScript', 'Groq AI'],
        monitorSnippet: `import * as THREE from "three"
import Experience from "./Experience.js"

// Interactive 3D WebGL Room & Raycast Sync
const scene = new THREE.Scene()
const raycaster = new THREE.Raycaster()
raycaster.setFromCamera(mouse, camera.instance)
const hits = raycaster.intersectObjects(screens)
if (hits.length > 0) {
    screenSync.emit("focus:display", hits[0].uv)
}`
    }
}

const KNOWN_TECH = [
    'LangGraph', 'LangChain', 'CrewAI', 'PydanticAI', 'FastAPI', 'Flask', 'Django',
    'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'TensorFlow', 'PyTorch', 'Keras',
    'Scikit-Learn', 'Pandas', 'NumPy', 'Plotly', 'React', 'Next.js', 'TypeScript',
    'TailwindCSS', 'Three.js', 'Kotlin', 'Android', 'Node.js', 'Power BI', 'DAX'
]

function githubGet(apiPath) {
    const url = apiPath.startsWith('http') ? apiPath : `https://api.github.com${apiPath}`
    const headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'PortfolioWeb-Daily-Sync'
    }
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
    }
    return new Promise((resolve, reject) => {
        https
            .get(url, { headers }, (res) => {
                let body = ''
                res.on('data', (chunk) => {
                    body += chunk
                })
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(body) })
                    } catch {
                        resolve({ status: res.statusCode, data: null })
                    }
                })
            })
            .on('error', reject)
    })
}

function cleanReadmeParagraph(markdown) {
    if (!markdown) return ''
    const lines = markdown
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, ' ')
        .split('\n')

    const candidates = []
    let current = []
    for (const raw of lines) {
        const line = raw.trim()
        if (!line) {
            if (current.length) {
                candidates.push(current.join(' '))
                current = []
            }
            continue
        }
        if (
            line.startsWith('#') ||
            line.startsWith('![') ||
            line.startsWith('[![') ||
            line.startsWith('```') ||
            line.startsWith('---') ||
            line.startsWith('|') ||
            /^[-*]\s+/.test(line)
        ) {
            continue
        }
        current.push(
            line
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/[*_`~]/g, '')
                .replace(/\s+/g, ' ')
        )
    }
    if (current.length) candidates.push(current.join(' '))
    const best = candidates.find((c) => c.length > 35) || candidates[0] || ''
    return best.slice(0, 260)
}

function formatSnippetForMonitor(rawCode, repoName) {
    const lines = (rawCode || '')
        .split('\n')
        .map((l) => l.replace(/\t/g, '    ').replace(/\s+$/, ''))
        .filter((l, idx) => idx < 30 && !(idx === 0 && !l))
        .slice(0, 12)
        .map((l) => (l.length > 54 ? l.slice(0, 51) + '...' : l))

    if (lines.length === 0) {
        return `# ${repoName} (Public GitHub Repository)\nprint("Synced from github.com/${GITHUB_USER}/${repoName}")`
    }
    return lines.join('\n')
}

function humanizeRepoTitle(name) {
    return name
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

async function buildAutoProject(repo) {
    let readmeText = ''
    try {
        const rd = await githubGet(`/repos/${GITHUB_USER}/${repo.name}/readme`)
        if (rd.status === 200 && rd.data?.content) {
            readmeText = Buffer.from(rd.data.content, 'base64').toString('utf8')
        }
    } catch {
        // Ignore readme errors
    }

    let tabName = repo.language === 'Kotlin' ? 'MainActivity.kt' : repo.language === 'JavaScript' ? 'index.js' : 'app.py'
    let monitorSnippet = ''

    try {
        const tree = await githubGet(`/repos/${GITHUB_USER}/${repo.name}/contents`)
        if (tree.status === 200 && Array.isArray(tree.data)) {
            const preferred = ['graph.py', 'app.py', 'main.py', 'run.py', 'server.py', 'index.ts', 'index.js', 'MainActivity.kt']
            const files = tree.data.filter((f) => f.type === 'file')
            const chosen =
                preferred.map((p) => files.find((f) => f.name === p)).find(Boolean) ||
                files.find((f) => /\.(py|kt|ts|js|dax)$/i.test(f.name))

            if (chosen) {
                tabName = chosen.name
                const fileRes = await githubGet(`/repos/${GITHUB_USER}/${repo.name}/contents/${encodeURIComponent(chosen.name)}`)
                if (fileRes.status === 200 && fileRes.data?.content) {
                    const raw = Buffer.from(fileRes.data.content, 'base64').toString('utf8')
                    monitorSnippet = formatSnippetForMonitor(raw, repo.name)
                }
            }
        }
    } catch {
        // Ignore tree inspection errors
    }

    if (!monitorSnippet) {
        monitorSnippet = formatSnippetForMonitor('', repo.name)
    }

    const description =
        (repo.description && repo.description.trim()) ||
        cleanReadmeParagraph(readmeText) ||
        `Public ${repo.language || 'software'} project hosted on GitHub.`

    const stackSet = new Set()
    if (repo.language) stackSet.add(repo.language)
    ;(repo.topics || []).forEach((t) => stackSet.add(t))
    if (readmeText) {
        KNOWN_TECH.forEach((tech) => {
            if (new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(readmeText)) {
                stackSet.add(tech)
            }
        })
    }
    const stack = Array.from(stackSet).slice(0, 6)
    if (stack.length === 0) stack.push('GitHub')

    const cleanTitle = humanizeRepoTitle(repo.name)
    return {
        id: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        repoName: repo.name,
        shortTitle: cleanTitle.length > 20 ? cleanTitle.slice(0, 18).trim() + '…' : cleanTitle,
        title: cleanTitle,
        tabName,
        description,
        stack,
        githubUrl: repo.html_url,
        liveUrl: repo.homepage && repo.homepage.trim() ? repo.homepage.trim() : repo.html_url,
        monitorSnippet
    }
}

async function main() {
    console.log(`[sync-github] Fetching public repositories for ${GITHUB_USER}...`)
    const res = await githubGet(`/users/${GITHUB_USER}/repos?per_page=100&sort=updated`)

    if (res.status !== 200 || !Array.isArray(res.data)) {
        console.error(`[sync-github] Failed to fetch GitHub repos (status ${res.status}):`, res.data)
        process.exit(1)
    }

    const publicRepos = res.data
        .filter((r) => !r.private && !EXCLUDED_REPOS.has(r.name) && (r.size || 0) > 0)
        .sort((a, b) => {
            const pa = PRIORITY_ORDER[a.name] ?? 99
            const pb = PRIORITY_ORDER[b.name] ?? 99
            if (pa !== pb) return pa - pb
            return new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at)
        })

    const projects = []
    for (const repo of publicRepos) {
        const curated = CURATED_META[repo.name]
        if (curated) {
            projects.push({
                id: curated.id,
                repoName: repo.name,
                shortTitle: curated.shortTitle,
                title: curated.title,
                tabName: curated.tabName,
                description: curated.description,
                stack: curated.stack,
                githubUrl: repo.html_url,
                liveUrl: repo.homepage && repo.homepage.trim() ? repo.homepage.trim() : repo.html_url,
                monitorSnippet: curated.monitorSnippet
            })
        } else {
            projects.push(await buildAutoProject(repo))
        }
    }

    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
    fs.writeFileSync(OUT_FILE, JSON.stringify(projects, null, 2) + '\n', 'utf8')
    console.log(`[sync-github] Synced ${projects.length} public repositories -> ${OUT_FILE}`)
}

main().catch((err) => {
    console.error('[sync-github] Unexpected error:', err)
    process.exit(1)
})
