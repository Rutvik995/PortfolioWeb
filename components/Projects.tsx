"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Database, Bot, TrendingUp, Network, Sun, Cpu } from "lucide-react";

const featuredProjects = [
  {
    id: "deep-agent",
    title: "Autonomous Agentic Architecture & Compound AI System",
    tagline: "Autonomous multi-agent AI platform",
    description:
      "A LangGraph-based autonomous AI platform for multi-domain goal and task tracking. Re-architected to support multiple isolated goals per user via compound namespace keys. Features a self-learning memory system with reflection nodes, multi-tenant isolation, and a full web platform layer.",
    highlights: [
      "Multi-goal isolation via namespace keys",
      "Self-learning reflection nodes",
      "Dual-storage architecture",
      "REST + WebSocket API",
    ],
    tech: ["Python", "LangGraph", "LangChain", "FastAPI", "Redis", "React", "WebSocket"],
    icon: Bot,
    label: "AI Agents · LangGraph",
    featured: true,
  },
  {
    id: "analytics-dashboard",
    title: "AI-Powered Business Analytics Dashboard",
    tagline: "Talk to your database in plain English",
    description:
      "A full-stack platform that translates natural language questions into SQL, executes them against a live database, and renders results on an interactive dashboard — making business data accessible to non-technical stakeholders.",
    tech: ["Python", "FastAPI", "React", "PostgreSQL", "OpenAI API", "Power BI"],
    icon: Database,
    label: "Full-Stack · NLP · SQL",
  },
  {
    id: "solar-analysis",
    title: "Solar Power Plant Analysis Agent",
    tagline: "Intelligent energy analytics for renewable infrastructure",
    description:
      "An agentic system designed for solar power plant performance monitoring and anomaly detection. Processes telemetry data through autonomous analysis pipelines, identifies underperforming panels, and generates actionable insights for plant operators.",
    tech: ["Python", "LangGraph", "PostgreSQL", "Pandas", "RAG", "FastAPI"],
    icon: Sun,
    label: "Agentic AI · Energy Analytics",
  },
  {
    id: "network-analysis",
    title: "Network Analysis Agentic System",
    tagline: "AI-driven network intelligence and diagnostics",
    description:
      "An autonomous agent system for real-time network topology analysis, fault detection, and performance optimization. Leverages graph-based reasoning and AI orchestration to identify bottlenecks and recommend remediation strategies.",
    tech: ["Python", "LangGraph", "NetworkX", "PostgreSQL", "Vector DB", "FastAPI"],
    icon: Network,
    label: "Agentic AI · Network Intelligence",
  },
  {
    id: "stock-market-app",
    title: "Stock Market Intelligence Platform",
    tagline: "LSTM meets Technical Analysis",
    description:
      "A full-stack platform combining an LSTM deep learning model for stock price prediction with a technical-indicator engine (RSI, MACD) for swing trade signals and a portfolio tracker.",
    tech: ["Python", "TensorFlow", "Pandas", "React", "PostgreSQL", "yFinance"],
    icon: TrendingUp,
    label: "ML · Finance · Full-Stack",
  },
];

const additionalAgents = [
  "Business Analysis Agentic System",
  "3+ more specialized agentic systems",
];

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" style={{ position: "relative", padding: "160px 24px" }}>
      <div
        className="blob"
        style={{
          width: "400px", height: "400px", opacity: 0.04,
          background: "radial-gradient(circle, #818cf8, transparent 70%)",
          bottom: "0", left: "-5%"
        }}
      />

      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }} ref={ref}>
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#818cf8", fontFamily: "var(--font-display)",
            marginBottom: "16px"
          }}
        >
          Projects
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: "clamp(2rem, 5vw, 2.75rem)", fontWeight: 700,
            fontFamily: "var(--font-display)", color: "#f8fafc",
            marginBottom: "24px", lineHeight: 1.2, letterSpacing: "-0.02em"
          }}
        >
          Selected <span style={{ color: "#818cf8" }}>Work</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            color: "#64748b", fontSize: "1rem", lineHeight: 1.8,
            maxWidth: "560px", margin: "0 auto 64px auto"
          }}
        >
          A curated selection of production-grade AI systems, agentic platforms, and intelligent data solutions.
        </motion.p>
      </div>

      {/* Stacked Cards */}
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
        {featuredProjects.map((project, i) => {
          const Icon = project.icon;
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
              className="glass-card"
              style={{ padding: "48px 32px", width: "100%", textAlign: "center" }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px" }}>
                <div
                  style={{
                    width: "48px", height: "48px", borderRadius: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)",
                    marginBottom: "16px"
                  }}
                >
                  <Icon size={22} style={{ color: "#818cf8" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", fontFamily: "var(--font-display)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {project.label}
                  </span>
                  {project.featured && (
                    <span style={{
                      background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.2)",
                      color: "#a5b4fc", fontSize: "0.7rem", padding: "4px 10px", borderRadius: "99px",
                      fontFamily: "var(--font-display)", fontWeight: 600
                    }}>
                      Flagship Project
                    </span>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "#f8fafc", marginBottom: "8px" }}>
                {project.title}
              </h3>

              <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#818cf8", marginBottom: "24px" }}>
                {project.tagline}
              </p>

              <p style={{ fontSize: "1rem", color: "#94a3b8", lineHeight: 1.8, marginBottom: "32px", maxWidth: "650px", margin: "0 auto 32px auto" }}>
                {project.description}
              </p>

              {project.highlights && (
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px auto" }}>
                  {project.highlights.map((h) => (
                    <div key={h} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818cf8", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>{h}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
                {project.tech.map((t) => (
                  <span key={t} style={{
                    padding: "6px 14px", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 500,
                    fontFamily: "var(--font-display)", background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8"
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Additional Agentic Systems Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 + featuredProjects.length * 0.12 }}
          className="glass-card"
          style={{
            padding: "40px 32px", width: "100%", textAlign: "center",
            borderStyle: "dashed",
          }}
        >
          <div style={{
            width: "48px", height: "48px", borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(129,140,248,0.07)", border: "1px solid rgba(129,140,248,0.15)",
            margin: "0 auto 20px auto"
          }}>
            <Cpu size={22} style={{ color: "#818cf8", opacity: 0.7 }} />
          </div>

          <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#64748b", fontFamily: "var(--font-display)", marginBottom: "12px" }}>
            Also in my portfolio
          </p>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "#94a3b8", marginBottom: "20px" }}>
            + Business Analysis Agentic System &amp; <span style={{ color: "#818cf8" }}>3+ more</span> specialized agentic systems
          </h3>

          <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.7, maxWidth: "500px", margin: "0 auto" }}>
            Additional autonomous AI platforms spanning enterprise intelligence, process automation, and domain-specific reasoning pipelines.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
