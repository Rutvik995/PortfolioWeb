"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Brain,
  Database,
  RefreshCw,
  Zap,
  ArrowRight,
  Sparkles,
  Server,
  Layers,
  Activity,
  CheckCircle,
} from "lucide-react";
import TiltCard from "./TiltCard";

interface WorkflowStep {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
  badge: string;
  description: string;
  tech: string[];
  metrics: string;
}

const workflowSteps: WorkflowStep[] = [
  {
    id: "input",
    name: "User Intent & Goal Ingestion",
    role: "Natural Language Prompt & Context Extraction",
    icon: Sparkles,
    color: "#38bdf8",
    badge: "STAGE 01 // INGESTION",
    description:
      "Ingests user goals, decomposes complex tasks into discrete DAG sub-objectives, and enforces compound namespace keys for complete multi-tenant tenant isolation.",
    tech: ["FastAPI", "WebSocket", "Namespace Keys", "JSON Schema"],
    metrics: "Latency: ~12ms · Strict Schema Validation",
  },
  {
    id: "orchestrator",
    name: "Supervisor Agent Orchestrator",
    role: "LangGraph Dynamic StateGraph Router",
    icon: Bot,
    color: "#818cf8",
    badge: "STAGE 02 // ROUTING & ORCHESTRATION",
    description:
      "A LangGraph-based state machine dynamically routes execution across specialized agents, decides conditional branch paths, and maintains shared agent memory.",
    tech: ["LangGraph", "StateGraph", "Conditional Edges", "Python"],
    metrics: "Multi-Goal Isolation · Zero Circular Deadlocks",
  },
  {
    id: "rag",
    name: "RAG & Vector Memory Engine",
    role: "Hybrid Search & High-Dimensional Embeddings",
    icon: Database,
    color: "#00f2fe",
    badge: "STAGE 03 // VECTOR RETRIEVAL",
    description:
      "Retrieves domain context, historical user decisions, and schema documentation using hybrid dense/sparse vector search with reranking.",
    tech: ["Pinecone", "ChromaDB", "OpenAI Embeddings", "PostgreSQL"],
    metrics: "Cosine Similarity > 0.88 · 1536-dim Vectors",
  },
  {
    id: "harness",
    name: "Domain Agent Harness",
    role: "Autonomous Execution & Tool Calling",
    icon: Zap,
    color: "#a78bfa",
    badge: "STAGE 04 // AGENTIC EXECUTION",
    description:
      "Spawns isolated domain agents (Solar Plant Telemetry, Network Graph Diagnostics, NL-to-SQL DB Engine, and Business Analytics) equipped with specialized toolchains.",
    tech: ["Tool Calling", "Pandas", "NetworkX", "Power BI APIs", "SQL"],
    metrics: "7+ Specialized Agent Runtimes Enabled",
  },
  {
    id: "reflection",
    name: "Self-Learning Reflection Node",
    role: "Critique, Memory Updates & Self-Correction",
    icon: RefreshCw,
    color: "#34d399",
    badge: "STAGE 05 // REFLECTION & LEARNING",
    description:
      "Evaluates interim tool results against the initial goal. If anomalies or errors are detected, it triggers a self-correction loop before persisting lessons into long-term memory.",
    tech: ["Self-Critique Nodes", "Redis Checkpointer", "Persistent Memory"],
    metrics: "94.2% Autonomous Correction Accuracy",
  },
  {
    id: "output",
    name: "Synthesized Output & Delivery",
    role: "Real-time Streaming & Telemetry Feed",
    icon: Server,
    color: "#60a5fa",
    badge: "STAGE 06 // PRODUCTION STREAM",
    description:
      "Packages structured outputs, live execution charts, and Power BI report embeds, streaming tokens in real time to web and mobile consumers.",
    tech: ["REST API", "WebSocket Feeds", "Next.js UI", "AquaServe Mobile"],
    metrics: "Real-Time WebSocket Stream · 99.9% Uptime",
  },
];

export default function AgenticWorkflow() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance through workflow stages
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const current = workflowSteps[activeStep];
  const CurrentIcon = current.icon;

  return (
    <div style={{ maxWidth: "1050px", margin: "0 auto", padding: "0 12px" }}>
      {/* Header Banner */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "99px",
            background: "rgba(129, 140, 248, 0.1)",
            border: "1px solid rgba(129, 140, 248, 0.25)",
            color: "#a5b4fc",
            fontSize: "0.75rem",
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          <Brain size={14} style={{ color: "#818cf8" }} />
          Compound AI System Architecture
        </div>

        <h3
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: "#f8fafc",
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          Interactive <span style={{ color: "#818cf8" }}>Agentic AI</span> Pipeline
        </h3>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "0.95rem",
            lineHeight: 1.8,
            maxWidth: "620px",
            margin: "0 auto",
          }}
        >
          Explore how my LangGraph multi-agent platform orchestrates goal decomposition,
          autonomous tool harness calls, and self-learning reflection nodes.
        </p>
      </div>

      {/* Interactive Workflow Visualizer Box */}
      <TiltCard
        maxTilt={6}
        glowColor="rgba(129, 140, 248, 0.25)"
        style={{
          padding: "36px 32px",
          border: "1px solid rgba(129, 140, 248, 0.25)",
          background: "linear-gradient(180deg, rgba(12, 14, 26, 0.95) 0%, rgba(7, 8, 16, 0.98) 100%)",
        }}
      >
        {/* Step Nodes Stepper Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "16px",
            marginBottom: "32px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === activeStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  setActiveStep(idx);
                  setIsAutoPlaying(false);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  background: isActive ? `${step.color}15` : "rgba(255, 255, 255, 0.02)",
                  border: isActive ? `1px solid ${step.color}50` : "1px solid rgba(255, 255, 255, 0.06)",
                  cursor: "pointer",
                  transition: "all 0.25s",
                  minWidth: "120px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: isActive ? `${step.color}25` : "rgba(255, 255, 255, 0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isActive ? step.color : "#64748b",
                    boxShadow: isActive ? `0 0 16px ${step.color}40` : "none",
                  }}
                >
                  <Icon size={18} />
                </div>

                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                    color: isActive ? "#f8fafc" : "#64748b",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  0{idx + 1}. {step.id.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detail Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "28px",
              alignItems: "center",
            }}
          >
            {/* Left: Stage Description */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "5px 12px",
                  borderRadius: "99px",
                  background: `${current.color}15`,
                  border: `1px solid ${current.color}35`,
                  color: current.color,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  marginBottom: "16px",
                }}
              >
                <Activity size={12} />
                {current.badge}
              </div>

              <h4
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: "#f8fafc",
                  marginBottom: "8px",
                }}
              >
                {current.name}
              </h4>

              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: current.color,
                  marginBottom: "18px",
                }}
              >
                {current.role}
              </p>

              <p
                style={{
                  fontSize: "0.95rem",
                  color: "#94a3b8",
                  lineHeight: 1.8,
                  marginBottom: "24px",
                }}
              >
                {current.description}
              </p>

              {/* Technologies */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {current.tech.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "99px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      fontFamily: "var(--font-display)",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.09)",
                      color: "#cbd5e1",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Telemetry & HUD State Box */}
            <div
              style={{
                padding: "24px",
                borderRadius: "16px",
                background: "rgba(0, 0, 0, 0.45)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#34d399",
                      boxShadow: "0 0 10px #34d399",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                      letterSpacing: "0.05em",
                    }}
                  >
                    AGENT_STATE // ACTIVE
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    color: current.color,
                  }}
                >
                  NODE {activeStep + 1}/06
                </span>
              </div>

              {/* Telemetry rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "monospace", fontSize: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>METRIC:</span>
                  <span style={{ color: "#e2e8f0" }}>{current.metrics}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>ISOLATION:</span>
                  <span style={{ color: "#34d399" }}>COMPOUND KEY // ACTIVE</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>GRAPH CYCLES:</span>
                  <span style={{ color: "#38bdf8" }}>SELF-LEARNING ENABLED</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>CHECKPOINT:</span>
                  <span style={{ color: "#a78bfa" }}>REDIS_STATE_STORE</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginTop: "20px" }}>
                <div
                  style={{
                    height: "4px",
                    borderRadius: "99px",
                    background: "rgba(255, 255, 255, 0.08)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((activeStep + 1) / workflowSteps.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                    style={{
                      height: "100%",
                      borderRadius: "99px",
                      background: `linear-gradient(90deg, #818cf8, ${current.color})`,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Stepper Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "32px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveStep((prev) => (prev > 0 ? prev - 1 : workflowSteps.length - 1));
              setIsAutoPlaying(false);
            }}
            style={{
              padding: "8px 18px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#94a3b8",
              fontSize: "0.82rem",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← Previous Node
          </button>

          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            style={{
              padding: "6px 14px",
              borderRadius: "99px",
              background: isAutoPlaying ? "rgba(52, 211, 153, 0.12)" : "rgba(255, 255, 255, 0.04)",
              border: isAutoPlaying ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
              color: isAutoPlaying ? "#34d399" : "#64748b",
              fontSize: "0.75rem",
              fontFamily: "monospace",
              cursor: "pointer",
            }}
          >
            {isAutoPlaying ? "● SIMULATION RUNNING" : "○ SIMULATION PAUSED"}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveStep((prev) => (prev + 1) % workflowSteps.length);
              setIsAutoPlaying(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              borderRadius: "10px",
              background: "rgba(129, 140, 248, 0.12)",
              border: "1px solid rgba(129, 140, 248, 0.3)",
              color: "#c7d2fe",
              fontSize: "0.82rem",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Next Node →
          </button>
        </div>
      </TiltCard>
    </div>
  );
}
