export const portfolioData = {
  developer: {
    name: "Rutvik",
    fullName: "Rutvik Bhanderi",
    role: "AI Systems Developer",
    tagline: "Building autonomous agents, multi-agent orchestrations, and deterministic compound AI systems.",
    availability: "Available for high-impact AI/ML engineering roles",
    email: "rutvik.professional@gmail.com",
    github: "https://github.com/Rutvik995",
    linkedin: "https://linkedin.com/in/rutvikbhanderi",
    location: "India",
    resumeUrl: "#resume"
  },

  // Computed Camera Subject Framing Targets
  cameraFrameTargets: {
    hero: {
      name: "hero",
      alias: "overview",
      look: [0.0, 1.5, -1.5], // Center of the room diorama
      size: [11.8, 6.7], // Fits the entire room box (bookshelf, PC, desk, chair, TV, sofa, walls) on all screens
      normal: [0.5226, 0.3275, 0.7875],
      padding: 1.15,
      idleOrbit: true
    },
    overview: {
      name: "overview",
      look: [0.0, 1.5, -1.5],
      size: [11.8, 6.7],
      normal: [0.5226, 0.3275, 0.7875],
      padding: 1.15,
      idleOrbit: true
    },
    projects: {
      name: "projects",
      alias: "pcScreen",
      look: [0.306, 3.416, -4.511], // Ultrawide PC monitor screen face
      size: [2.5, 1.45],
      normal: [0.0, 0.16, 0.985], // Elevated view looking over chair headrest straight onto screen
      padding: 1.25
    },
    pcScreen: {
      name: "pcScreen",
      look: [0.306, 3.416, -4.511],
      size: [2.5, 1.45],
      normal: [0.0, 0.16, 0.985],
      padding: 1.25
    },
    experience: {
      name: "experience",
      alias: "macScreen",
      look: [2.23, 2.99, -4.32], // Direct display framing matching PC monitor style
      size: [1.34, 0.83],
      normal: [-0.22, 0.08, 0.97], // Orthogonal to MacBook lid normal with clean bottom dock clearance
      padding: 1.24
    },
    macScreen: {
      name: "macScreen",
      look: [2.23, 2.99, -4.32],
      size: [1.34, 0.83],
      normal: [-0.22, 0.08, 0.97],
      padding: 1.24
    },
    skills: {
      name: "skills",
      alias: "bookshelf",
      look: [-3.3, 2.3, -2.7], // Whole bookshelf from floor to top + guitar, framed from interior
      size: [2.6, 3.4],
      normal: [0.65, 0.22, 0.73],
      padding: 1.15
    },
    bookshelf: {
      name: "bookshelf",
      look: [-3.3, 2.3, -2.7],
      size: [2.6, 3.4],
      normal: [0.65, 0.22, 0.73],
      padding: 1.15
    },
    about: {
      name: "about",
      look: [0.5, 2.1, -2.8], // Developer workstation (desk, chair, monitors, coffee) framed WHOLE
      size: [4.6, 3.2],
      normal: [0.38, 0.44, 0.81],
      padding: 1.15
    },
    contact: {
      name: "contact",
      look: [0.8, 1.2, 1.2], // Lounge zone: coffee table with smart speaker/controller and sofa with mascot
      size: [4.4, 2.6],
      normal: [-0.25, 0.50, 0.83],
      padding: 1.15
    },
    tvScreen: {
      name: "tvScreen",
      look: [4.19, 2.665, 1.820], // TV screen face
      size: [4.16, 2.34],
      normal: [-0.92, 0.12, 0.37],
      padding: 1.18
    }
  },

  computeCameraFraming(targetKey, aspect, fovDegrees = 30) {
    const targets = portfolioData.cameraFrameTargets;
    const def = targets[targetKey] || targets.hero;
    const [lx, ly, lz] = def.look;
    const [w, h] = def.size;
    const [nx, ny, nz] = def.normal;
    const padding = def.padding || 1.18;

    const wPad = w * padding;
    const hPad = h * padding;

    const tanFovY = Math.tan((fovDegrees * Math.PI) / 360);
    const tanFovX = tanFovY * aspect;

    const distH = (hPad / 2) / tanFovY;
    const distW = (wPad / 2) / tanFovX;
    const dist = Math.max(distH, distW);

    // Compute camera position along the normal vector
    const len = Math.hypot(nx, ny, nz) || 1;
    let px = lx + (nx / len) * dist;
    let py = ly + (ny / len) * dist;
    let pz = lz + (nz / len) * dist;

    // Boundary / Wall Clamping: keep inside safe universe
    px = Math.max(-6.0, Math.min(25.0, px));
    py = Math.max(0.5, Math.min(20.0, py));
    pz = Math.max(-6.0, Math.min(30.0, pz));

    return {
      name: targetKey,
      look: [lx, ly, lz],
      pos: [px, py, pz],
      dist: dist,
      size: def.size,
      idleOrbit: !!def.idleOrbit
    };
  },

  cameraTargets: {
    hero: {
      pos: [7.5, 6.2, 9.8],
      look: [0, 1.5, -1.5]
    },
    projects: {
      pos: [0.306, 3.96, -1.16],
      look: [0.306, 3.416, -4.511]
    },
    experience: {
      pos: [1.82, 3.14, -2.53],
      look: [2.23, 2.99, -4.32]
    },
    skills: {
      pos: [1.34, 3.87, 2.52],
      look: [-3.3, 2.3, -2.7]
    },
    about: {
      pos: [3.11, 5.12, 2.77],
      look: [0.5, 2.1, -2.8]
    },
    contact: {
      pos: [-0.59, 3.98, 5.82],
      look: [0.8, 1.2, 1.2]
    }
  },

  projects: [
    {
      id: "solar-power-analysis",
      shortTitle: "Solar Power AI",
      title: "Solar Power Plant Analysis Platform",
      tabName: "graph.py",
      description: "Enterprise operational intelligence and conversational analytics platform for commercial solar PV facilities, pairing a React 18 dashboard with a deterministic LangGraph multi-agent copilot, FastAPI backend, PostgreSQL store, and 276 passing tests.",
      stack: ["Python", "LangGraph", "FastAPI", "PostgreSQL", "React 18", "TailwindCSS"],
      githubUrl: "https://github.com/Rutvik995/Solar-Power-Plant-Analysis",
      liveUrl: "https://github.com/Rutvik995/Solar-Power-Plant-Analysis",
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
    {
      id: "data-analysis-agent",
      shortTitle: "DataAnalysis Agent",
      title: "Multi-Agent Data Analysis & Visualization System",
      tabName: "app.py",
      description: "Autonomous multi-agent SQL and visualization pipeline built with PydanticAI, LangChain, DeepAgents, and PostgreSQL (asyncpg). Converts natural-language requests into validated SQL queries, generates interactive Plotly charts, and asks clarifying follow-up questions when requirements are ambiguous.",
      stack: ["Python", "PydanticAI", "LangChain", "DeepAgents", "PostgreSQL", "Plotly"],
      githubUrl: "https://github.com/Rutvik995/DataAnalysis_Multi-Agentic-System",
      liveUrl: "https://github.com/Rutvik995/DataAnalysis_Multi-Agentic-System",
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
    {
      id: "travel-ai-agent",
      shortTitle: "Travel AI Agent",
      title: "ARVEX — Multi-Agent AI Travel Planner",
      tabName: "travel_agent.py",
      description: "Multi-agent AI travel planning assistant powered by LangGraph and CrewAI with Serper live web search tools, OpenRouter LLM routing, persistent thread memory, and a dark glassmorphism Flask chat interface for customized day-by-day itineraries.",
      stack: ["Python", "LangGraph", "CrewAI", "Flask", "OpenRouter", "Serper API"],
      githubUrl: "https://github.com/Rutvik995/Travel_AI_Agent",
      liveUrl: "https://github.com/Rutvik995/Travel_AI_Agent",
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
    {
      id: "plant-disease-detection",
      shortTitle: "Plant Disease AI",
      title: "Plant Leaf Disease Detection System",
      tabName: "plant_app.py",
      description: "Real-time AI web application diagnosing crop leaf diseases across 39 PlantVillage categories using a MobileNetV2 CNN (97.42% test accuracy) served via Flask, returning top-5 probabilities with organic and chemical treatment advice.",
      stack: ["Python", "TensorFlow", "Keras", "MobileNetV2", "Flask", "NumPy"],
      githubUrl: "https://github.com/Rutvik995/Plant-Leaf-Disease-Detection",
      liveUrl: "https://github.com/Rutvik995/Plant-Leaf-Disease-Detection",
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
    {
      id: "stock-algo",
      shortTitle: "STOCK-ALGO",
      title: "STOCK-ALGO — Market Strategy & Backtesting",
      tabName: "stock_algo.py",
      description: "Algorithmic trading and NIFTY 100 strategy backtesting platform built with Python, Pandas, TensorFlow, Scikit-Learn, and Plotly/Dash, computing SMA/EMA, RSI, MACD, Bollinger Bands, Sharpe Ratio, and cumulative returns.",
      stack: ["Python", "Pandas", "TensorFlow", "Scikit-Learn", "Plotly", "Dash"],
      githubUrl: "https://github.com/Rutvik995/STOCK-ALGO",
      liveUrl: "https://github.com/Rutvik995/STOCK-ALGO",
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
    {
      id: "aquaserve",
      shortTitle: "Aquaserve Android",
      title: "Aquaserve — Water Delivery Android App",
      tabName: "AquaserveApp.kt",
      description: "Native Android application built with Kotlin and Jetpack Compose paired with a Node.js backend for three-panel multi-tenant water delivery logistics, live order status tracking, and payment history.",
      stack: ["Kotlin", "Android SDK", "Jetpack Compose", "Node.js", "REST APIs", "Gradle"],
      githubUrl: "https://github.com/Rutvik995/Aquaserve",
      liveUrl: "https://github.com/Rutvik995/Aquaserve",
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
    {
      id: "power-bi-dashboards",
      shortTitle: "Power BI BI",
      title: "Power BI Dashboards & KPI Analytics",
      tabName: "analytics.dax",
      description: "Collection of interactive Power BI and DAX business intelligence workbooks including Aquaserve Dashboard, Nike Sales Dashboard, and executive KPI performance reporting.",
      stack: ["Power BI", "DAX", "KPI Tracking", "Sales Analytics", "Data Visualization"],
      githubUrl: "https://github.com/Rutvik995/Power-BI-Dashboards",
      liveUrl: "https://github.com/Rutvik995/Power-BI-Dashboards",
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
    {
      id: "ai-programs",
      shortTitle: "AI Programs",
      title: "AI-PROGRAMS — Classical Search & Expert Systems",
      tabName: "8_puzzle.py",
      description: "Python implementations of classic Artificial Intelligence algorithms covering 8-Puzzle heuristic search, N-Queens backtracking, Travelling Salesperson optimization, Water Jug search, game AI, and rule-based expert systems.",
      stack: ["Python", "Heuristic Search", "Backtracking", "Game AI", "Expert Systems"],
      githubUrl: "https://github.com/Rutvik995/AI-PROGRAMS",
      liveUrl: "https://github.com/Rutvik995/AI-PROGRAMS",
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
    {
      id: "portfolio-web",
      shortTitle: "3D Portfolio",
      title: "PortfolioWeb — Interactive 3D Developer Room",
      tabName: "Experience.js",
      description: "Interactive 3D WebGL developer room built with Three.js, custom GLSL baked lighting shaders, live raycast screen synchronization, Smart TV music visualizer, and an interactive in-room 3D MacBook AI assistant.",
      stack: ["Three.js", "WebGL", "GLSL", "GSAP", "JavaScript", "Groq AI"],
      githubUrl: "https://github.com/Rutvik995/PortfolioWeb",
      liveUrl: "https://rutvikb.vercel.app/",
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
  ],

  experiences: [
    {
      role: "AI Engineer Intern",
      company: "Innovation Intellect Pvt Ltd",
      location: "Bhuj, Kutch",
      period: "Apr 2026 — Jun 2026",
      mode: "On-site",
      highlights: [
        "Designed and orchestrated multi-agent architectures with dynamic task planning, tool-calling, and self-reflection loops, replacing linear prompt-chaining with adaptive, goal-driven workflows.",
        "Engineered compound AI systems combining model execution loops, retrieval pipelines, and rule-based guardrails to deliver predictable, production-grade outputs.",
        "Built end-to-end RAG pipelines, optimizing chunking strategy, vector embeddings, and semantic reranking to reduce hallucination and improve retrieval precision.",
        "Deployed a containerized local LLM evaluation and UI environment using OpenWebUI on Docker, enabling reproducible testing and comparison of models."
      ],
      skills: ["LangGraph", "Multi-Agent Orchestration", "RAG", "OpenWebUI", "Python"]
    },
    {
      role: "Android Developer Intern",
      company: "Shreesoftech",
      location: "Bhuj, Kutch",
      period: "Dec 2025 — Feb 2026",
      mode: "Remote",
      highlights: [
        "Built AquaServe, a full-stack Android application, end-to-end: Kotlin client and Node.js/MongoDB REST APIs.",
        "Architected a three-panel, multi-tenant system (Customer, Driver, Owner) with role-based data separation."
      ],
      skills: ["Android", "Kotlin", "Node.js", "MongoDB", "REST APIs"]
    }
  ],

  skillsGrouped: [
    {
      category: "Agents & Orchestration",
      description: "Deterministic graph state machines, multi-agent coordination, runtime tool harnesses",
      skills: ["LangGraph", "LangChain", "StateGraph", "Pydantic Schemas", "Tool Calling", "Multi-Agent DAGs", "Prompt Engineering"]
    },
    {
      category: "Backend & Data",
      description: "Relational persistence, time-series indexing, vector stores, streaming protocols",
      skills: ["Python", "FastAPI", "PostgreSQL", "Redis", "TimescaleDB", "Pinecone", "ChromaDB", "WebSockets", "Docker"]
    },
    {
      category: "Machine Learning & AI",
      description: "Inference pipelines, open models, local and cloud LLM endpoints, neural vision",
      skills: ["PyTorch", "Deep Learning", "Llama 3", "Gemini API", "OpenAI API", "Scikit-Learn", "Pandas", "NumPy"]
    },
    {
      category: "Full-Stack & Systems",
      description: "Production web applications, interactive 3D WebGL graphics, mobile clients",
      skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Three.js / WebGL", "Android / Kotlin", "Git / CI/CD"]
    }
  ],

  about: {
    bio: [
      "I'm an AI systems developer specializing in taking autonomous multi-agent architectures out of prototype notebooks and engineering the deterministic state machines, databases, APIs, and interfaces required to run them reliably in production.",
      "My work focuses on compound AI systems: building verifiable multi-step execution graphs with LangGraph, designing tiered memory compaction layers that preserve LLM context windows, and isolating tenant execution via compound state boundaries.",
      "When I'm not profiling database indexes or debugging agent loop topologies, I'm exploring distributed systems architecture and interactive WebGL experiences."
    ]
  },

  contact: {
    heading: "Let's Build Something High-Impact",
    subheading: "Open to full-time AI/ML engineering roles, strategic technical collaborations, and ambitious systems engineering work.",
    email: "rutvik.professional@gmail.com",
    github: "https://github.com/Rutvik995",
    githubUsername: "Rutvik995",
    linkedin: "https://linkedin.com/in/rutvikbhanderi",
    linkedinUsername: "rutvikbhanderi",
    location: "India"
  }
};
