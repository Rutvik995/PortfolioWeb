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

  cameraTargets: {
    hero: {
      pos: [7.5, 6.2, 9.8],
      look: [0, 1.5, -1.5]
    },
    projects: {
      pos: [0.3, 3.4, -2.0],
      look: [0.3, 3.4, -4.6]
    },
    experience: {
      pos: [2.2, 2.8, -2.5],
      look: [2.2, 2.6, -4.3]
    },
    skills: {
      pos: [-3.0, 3.5, -1.0],
      look: [-4.0, 3.0, -4.0]
    },
    about: {
      pos: [7.5, 6.2, 9.8],
      look: [0, 1.5, -1.5]
    },
    contact: {
      pos: [4.2, 2.8, 4.5],
      look: [4.2, 2.7, 1.8]
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
