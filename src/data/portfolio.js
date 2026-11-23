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
      look: [2.05, 2.68, -4.10], // Centered on entire laptop (screen + keyboard + riser) shifted for left card
      size: [2.4, 1.7],
      normal: [-0.20, 0.32, 0.92], // Elevated angle looking down at keyboard and straight onto screen
      padding: 1.30
    },
    macScreen: {
      name: "macScreen",
      look: [2.05, 2.68, -4.10],
      size: [2.4, 1.7],
      normal: [-0.20, 0.32, 0.92],
      padding: 1.30
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
      pos: [1.22, 4.01, -0.29],
      look: [2.05, 2.68, -4.10]
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
      id: "cortex",
      title: "Cortex — Autonomous Multi-Agent Engine",
      tabName: "cortex_supervisor.py",
      problem: "Standard single-prompt LLM wrappers fail beyond 3 steps, hallucinate schemas, and lack tenant memory isolation.",
      description: "A 10-node LangGraph orchestration engine featuring runtime tool synthesis, 4-tier memory compaction, and strict compound-key execution boundaries.",
      stack: ["LangGraph", "Python", "FastAPI", "PostgreSQL", "Redis", "WebSocket"],
      githubUrl: "https://github.com/Rutvik995",
      liveUrl: "https://github.com/Rutvik995",
      codeSnippet: `from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated

class AgentState(TypedDict):
    tenant_id: str
    goal: str
    plan: list[str]
    results: dict
    active_agent: str

def supervisor_node(state: AgentState):
    """Decomposes goal and routes to workers"""
    next_node = router.schedule(state["goal"])
    return {"active_agent": next_node}

def tool_execution(state: AgentState):
    result = tool_harness.run(state["active_agent"])
    return {"results": result}

builder = StateGraph(AgentState)
builder.add_node("supervisor", supervisor_node)
builder.add_node("tool_worker", tool_execution)
builder.add_conditional_edges(
    "supervisor",
    should_continue,
    {"researcher": "tool_worker", "end": END}
)
graph = builder.compile()`
    },
    {
      id: "solar-fault",
      title: "Solar Fault Detection & Predictive Grid Agent",
      tabName: "solar_fault_agent.py",
      problem: "Utility-scale solar fields lose up to 14% output from undetected string diode failures and dust degradation.",
      description: "Autonomous telemetry pipeline streaming multi-inverter sensor feeds through an ensemble anomaly detector to classify string faults and schedule drone dispatch.",
      stack: ["Python", "PyTorch", "FastAPI", "TimescaleDB", "Pandas", "Scikit-Learn"],
      githubUrl: "https://github.com/Rutvik995",
      liveUrl: "https://github.com/Rutvik995",
      codeSnippet: `import torch
import numpy as np
from timescaledb import StreamClient

class SolarTelemetryAgent:
    def __init__(self, model_weights: str):
        self.detector = torch.jit.load(model_weights)
        self.client = StreamClient(timeout_ms=50)

    async def monitor_inverter_string(self, string_id: str):
        raw_volts, raw_amps = await self.client.read(string_id)
        tensor_in = torch.tensor([[raw_volts, raw_amps]], dtype=torch.float32)
        
        with torch.no_grad():
            anomaly_score = self.detector(tensor_in).item()
            
        if anomaly_score > 0.85:
            await dispatch_maintenance_alert(
                string=string_id, 
                severity="HIGH_FAULT",
                score=anomaly_score
            )
            return {"status": "ALERT_DISPATCHED", "score": anomaly_score}
        return {"status": "NOMINAL"}`
    },
    {
      id: "sales-orchestrator",
      title: "Compound Lead Intelligence & Outreach Pipeline",
      tabName: "sales_orchestrator.py",
      problem: "B2B research teams spend 70% of time manually aggregating company registries, tech stacks, and hiring signals.",
      description: "Deterministic 5-agent pipeline that crawls domain telemetry, queries vector stores for market positioning, and drafts customized outreach briefs.",
      stack: ["LangChain", "Python", "ChromaDB", "Playwright", "Pydantic"],
      githubUrl: "https://github.com/Rutvik995",
      liveUrl: "https://github.com/Rutvik995",
      codeSnippet: `from pydantic import BaseModel, Field
from langchain.chat_models import ChatOpenAI

class CompanyDossier(BaseModel):
    domain: str
    headcount: int
    tech_stack: list[str]
    key_decision_makers: list[str]
    buying_intent_score: float = Field(ge=0.0, le=1.0)

async def orchestrate_enrichment(domain: str) -> CompanyDossier:
    crawler_res = await web_crawler.fetch_tech_footprint(domain)
    filings = await sec_edgar_client.search_ticker(domain)
    
    synthesizer = llm.with_structured_output(CompanyDossier)
    dossier = await synthesizer.ainvoke({
        "signals": crawler_res,
        "financials": filings
    })
    return dossier`
    },
    {
      id: "iot-supervisor",
      title: "Natural-Language IoT Control & Telemetry Bridge",
      tabName: "iot_supervisor.py",
      problem: "Shopfloor operators struggle with complex SCADA panels when executing emergency protocol overrides.",
      description: "Voice and text-driven bridge translating natural language instructions into validated industrial hardware register writes.",
      stack: ["Python", "FastAPI", "MQTT", "OpenAI Whisper", "WebSockets"],
      githubUrl: "https://github.com/Rutvik995",
      liveUrl: "https://github.com/Rutvik995",
      codeSnippet: `import asyncio
from paho.mqtt import client as mqtt_client

class IndustrialHardwareBridge:
    def __init__(self, broker_url: str):
        self.mqtt = mqtt_client.Client("edge_supervisor")
        self.mqtt.connect(broker_url, 1883)

    def execute_safety_override(self, machine_id: str, command: str):
        payload = safety_schema_validator.parse(command)
        topic = f"factory/cell_3/{machine_id}/control"
        
        self.mqtt.publish(topic, payload.to_binary(), qos=2)
        audit_log.record(machine=machine_id, cmd=command)
        return {"status": "ACKNOWLEDGED", "machine": machine_id}`
    }
  ],

  experiences: [
    {
      role: "AI Engineer Intern",
      company: "Innovation Intellect Pvt Ltd",
      location: "Bhuj, Gujarat",
      period: "Apr 2026 — Jun 2026",
      mode: "On-site",
      highlights: [
        "Built autonomous multi-agent systems for real-time sensor analysis and workflow automation.",
        "Engineered natural-language IoT control pipelines enabling operators to command industrial hardware and inspect live telemetry in English and Hindi.",
        "Formulated predictive analytics models to forecast operational trends, coupled with dynamic data visualizations.",
        "Constructed automated root-cause troubleshooting knowledge-base querying systems."
      ],
      skills: ["LangGraph", "Multi-Agent AI", "IoT Telemetry", "Predictive Analytics", "NLP"]
    },
    {
      role: "Android Developer Intern",
      company: "Shreesoftech",
      location: "Bhuj, Gujarat",
      period: "Dec 2025 — Feb 2026",
      mode: "Remote",
      highlights: [
        "Developed native Android client features with Kotlin, implementing reactive UI state flows and RESTful endpoint synchronization.",
        "Collaborated on mobile architecture, offline-first data caching with Room, and asynchronous background services."
      ],
      skills: ["Android", "Kotlin", "Room Database", "REST APIs", "Coroutines"]
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
      skills: ["PyTorch", "Deep Learning", "Llama 3 (Groq)", "Gemini API", "OpenAI API", "Scikit-Learn", "Pandas", "NumPy"]
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
