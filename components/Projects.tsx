"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Bot,
  Globe,
  Smartphone,
  Cpu,
  Layers,
  FileSpreadsheet,
  Droplets,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Database,
  Sun,
  Network,
  BarChart3,
  MessageSquareCode,
  TrendingUp,
} from "lucide-react";

// ── 7+ Agentic AI Projects ─────────────────────────────────────────
const agenticProjects = [
  {
    id: "compound-ai",
    name: "Autonomous Agentic Architecture & Compound AI Platform",
    tagline: "Flagship Multi-Agent Platform",
    category: "LangGraph Orchestration",
    icon: Bot,
    description:
      "An enterprise autonomous AI platform engineered for multi-domain goal and task execution. Built with compound namespace keys for multi-goal isolation, reflection nodes for self-learning memory, and a dual-storage state engine.",
    highlights: [
      "Multi-goal isolation via compound namespace keys",
      "Self-learning reflection nodes with feedback loops",
      "Dual-storage state engine (Redis + PostgreSQL)",
      "REST & real-time WebSocket orchestration API",
    ],
    tech: ["Python", "LangGraph", "LangChain", "FastAPI", "Redis", "React", "WebSocket"],
    isFlagship: true,
  },
  {
    id: "solar-analysis",
    name: "Solar Power Plant Analysis Agent",
    tagline: "Renewable Energy Diagnostics",
    category: "Telemetry Analysis",
    icon: Sun,
    description:
      "Autonomous agent pipeline processing high-frequency solar telemetry data. Automatically detects inverter anomalies, identifies underperforming PV panels, and computes yield forecasts.",
    tech: ["Python", "LangGraph", "PostgreSQL", "Pandas", "RAG", "FastAPI"],
  },
  {
    id: "network-analysis",
    name: "Network Analysis Agentic System",
    tagline: "Topology & Anomaly Intelligence",
    category: "Graph Diagnostics",
    icon: Network,
    description:
      "Multi-agent reasoning system for automated network topology diagnostics, routing bottleneck detection, and intelligent root-cause remediation across complex distributed clusters.",
    tech: ["Python", "LangGraph", "NetworkX", "PostgreSQL", "Vector DB", "FastAPI"],
  },
  {
    id: "business-analysis",
    name: "Business Analysis Agentic System",
    tagline: "Executive KPI & Strategic Intelligence",
    category: "Decision Support",
    icon: BarChart3,
    description:
      "Collaborative multi-agent system that synthesizes multi-channel revenue metrics, pinpoints operational friction, and automates executive decision reporting with Power BI integration.",
    tech: ["Python", "LangGraph", "Power BI", "PostgreSQL", "OpenAI API"],
  },
  {
    id: "nl-to-sql",
    name: "Natural Language to SQL Query Agent",
    tagline: "Conversational Enterprise Database Engine",
    category: "NL-to-SQL",
    icon: MessageSquareCode,
    description:
      "Agentic pipeline translating plain conversational questions into optimized, schema-validated SQL queries, executing them securely against production databases with visual charts.",
    tech: ["Python", "FastAPI", "PostgreSQL", "OpenAI API", "Chart.js"],
  },
  {
    id: "customer-intel",
    name: "Customer Intelligence & Support Agent",
    tagline: "Context-Aware Autonomous Support",
    category: "Customer Intelligence",
    icon: Cpu,
    description:
      "Autonomous agent combining semantic vector retrieval, multi-turn conversation memory, and automated ticket triage to resolve user inquiries with high precision.",
    tech: ["Python", "LangChain", "ChromaDB", "FastAPI", "RAG"],
  },
  {
    id: "financial-market",
    name: "Financial Forecasting & Market Agent",
    tagline: "Predictive Signals & Quantitative Modeling",
    category: "FinTech Intelligence",
    icon: TrendingUp,
    description:
      "Quantitative agent fusing LSTM deep learning models with technical indicators (RSI, MACD) to generate algorithmic swing-trading signals and real-time portfolio risk scoring.",
    tech: ["Python", "TensorFlow", "Pandas", "PostgreSQL", "yFinance"],
  },
];

// ── Web Applications ────────────────────────────────────────────────
const webProjects = [
  {
    id: "invoice-webapp",
    name: "Invoice Web App",
    tagline: "Smart Invoicing & Billing Management Platform",
    category: "Web Application",
    icon: FileSpreadsheet,
    badge: "Featured Web App",
    description:
      "A modern, full-stack invoicing and financial management application built to streamline billing workflows. Features dynamic invoice creation, customizable templates, client management, PDF rendering, and automated payment tracking.",
    highlights: [
      "Instant invoice creation with dynamic taxes, discounts, and itemization",
      "Automated PDF export & email dispatch to clients",
      "Client ledger, invoice status tracking (Paid, Pending, Overdue)",
      "Financial dashboard with monthly revenue metrics and receivables",
    ],
    tech: ["React / Next.js", "TypeScript", "Node.js / FastAPI", "PostgreSQL", "TailwindCSS"],
  },
  {
    id: "business-dashboard",
    name: "AI Business Analytics Web Platform",
    tagline: "Conversational Data & Dashboard Hub",
    category: "Web Application",
    icon: Database,
    badge: "Full-Stack Web App",
    description:
      "Full-stack web platform enabling teams to query complex enterprise databases using everyday language, rendering real-time interactive charts, metrics, and Power BI dashboards.",
    highlights: [
      "Conversational NL-to-SQL interface for business users",
      "Interactive data visualization and real-time query execution",
      "Power BI embedded reporting integration",
    ],
    tech: ["React", "FastAPI", "PostgreSQL", "Power BI", "Chart.js"],
  },
];

// ── Mobile Applications ─────────────────────────────────────────────
const mobileProjects = [
  {
    id: "aquaserve",
    name: "AquaServe",
    tagline: "Water Delivery & Service Management Mobile Platform",
    category: "Mobile Application",
    icon: Droplets,
    badge: "Featured Mobile App",
    description:
      "A cross-platform mobile application designed for water supply logistics, doorstep delivery management, and recurring customer subscriptions. Connects customers, dispatchers, and delivery partners in real time.",
    highlights: [
      "Customer ordering for on-demand water delivery & periodic jar subscriptions",
      "Live order tracking with delivery agent GPS location & status alerts",
      "Driver dispatch interface with route optimization & delivery confirmation",
      "Integrated wallet, secure payments, and monthly consumption history",
    ],
    tech: ["React Native", "TypeScript", "Node.js / Express", "PostgreSQL", "Google Maps API"],
  },
];

type CategoryFilter = "all" | "agentic" | "web" | "mobile";

export default function Projects() {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const flagshipAgent = agenticProjects[0];
  const otherAgenticProjects = agenticProjects.slice(1);

  return (
    <section id="projects" style={{ position: "relative", padding: "160px 24px" }}>
      {/* Background Glow */}
      <div
        className="blob"
        style={{
          width: "450px", height: "450px", opacity: 0.04,
          background: "radial-gradient(circle, #818cf8, transparent 70%)",
          top: "5%", left: "-5%"
        }}
      />
      <div
        className="blob"
        style={{
          width: "400px", height: "400px", opacity: 0.03,
          background: "radial-gradient(circle, #38bdf8, transparent 70%)",
          bottom: "10%", right: "-5%"
        }}
      />

      <div style={{ maxWidth: "1050px", margin: "0 auto" }} ref={ref}>

        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
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
            Portfolio &amp; Solutions
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3rem)", fontWeight: 700,
              fontFamily: "var(--font-display)", color: "#f8fafc",
              marginBottom: "20px", lineHeight: 1.2, letterSpacing: "-0.02em"
            }}
          >
            Featured <span style={{ color: "#818cf8" }}>Projects</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.8,
              maxWidth: "680px", margin: "0 auto"
            }}
          >
            Spanning <span style={{ color: "#e2e8f0", fontWeight: 600 }}>7+ Autonomous Agentic AI Systems</span>, full-stack web platforms, and mobile applications.
          </motion.p>
        </div>

        {/* Category Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px",
            marginBottom: "56px"
          }}
        >
          {[
            { id: "all", label: "All Projects (10+)", icon: Layers },
            { id: "agentic", label: "7+ Agentic AI Systems", icon: Bot },
            { id: "web", label: "Web Applications", icon: Globe },
            { id: "mobile", label: "Mobile Applications", icon: Smartphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as CategoryFilter)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "10px 20px", borderRadius: "12px",
                  fontSize: "0.85rem", fontWeight: 600, fontFamily: "var(--font-display)",
                  cursor: "pointer", transition: "all 0.2s",
                  background: active ? "rgba(129,140,248,0.18)" : "rgba(255,255,255,0.03)",
                  border: active ? "1px solid rgba(129,140,248,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  color: active ? "#f1f5f9" : "#94a3b8",
                  boxShadow: active ? "0 0 20px rgba(129,140,248,0.15)" : "none",
                }}
              >
                <Icon size={15} style={{ color: active ? "#818cf8" : "#64748b" }} />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            1. AGENTIC AI SYSTEMS (7+ PROJECTS)
        ══════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {(filter === "all" || filter === "agentic") && (
            <motion.div
              key="agentic-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ marginBottom: "64px" }}
            >
              {/* Category Subheading Banner */}
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: "12px", marginBottom: "28px", paddingBottom: "16px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >
                    <Bot size={18} style={{ color: "#818cf8" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.35rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "#f8fafc" }}>
                      Agentic AI &amp; Compound Systems
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      7+ Specialized Multi-Agent Systems &amp; Autonomous Frameworks
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    padding: "6px 14px", borderRadius: "99px",
                    background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.25)",
                    color: "#a5b4fc", fontSize: "0.75rem", fontWeight: 600, fontFamily: "var(--font-display)"
                  }}
                >
                  7+ Projects Shipped
                </span>
              </div>

              {/* ── Flagship Project Card ── */}
              <div
                className="glass-card"
                style={{
                  padding: "44px 36px", marginBottom: "32px",
                  border: "1px solid rgba(129,140,248,0.28)",
                  background: "linear-gradient(180deg, rgba(129,140,248,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "5px 12px", borderRadius: "99px",
                      background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)",
                      color: "#c7d2fe", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-display)"
                    }}
                  >
                    <Sparkles size={13} style={{ color: "#818cf8" }} />
                    FLAGSHIP AGENTIC ARCHITECTURE
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {flagshipAgent.category}
                  </span>
                </div>

                <h4 style={{ fontSize: "clamp(1.4rem, 4vw, 1.85rem)", fontWeight: 700, fontFamily: "var(--font-display)", color: "#f8fafc", marginBottom: "10px" }}>
                  {flagshipAgent.name}
                </h4>

                <p style={{ fontSize: "1rem", fontWeight: 600, color: "#818cf8", marginBottom: "18px" }}>
                  {flagshipAgent.tagline}
                </p>

                <p style={{ fontSize: "0.95rem", color: "#94a3b8", lineHeight: 1.8, marginBottom: "28px" }}>
                  {flagshipAgent.description}
                </p>

                {/* Flagship Highlights */}
                {flagshipAgent.highlights && (
                  <div
                    style={{
                      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "12px", marginBottom: "28px"
                    }}
                  >
                    {flagshipAgent.highlights.map((h) => (
                    <div
                      key={h}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: "10px",
                        padding: "12px 16px", borderRadius: "12px",
                        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)"
                      }}
                    >
                      <CheckCircle2 size={16} style={{ color: "#34d399", marginTop: "2px", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.5 }}>{h}</span>
                    </div>
                  ))}
                </div>
              )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {flagshipAgent.tech.map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: "5px 12px", borderRadius: "99px", fontSize: "0.78rem", fontWeight: 500,
                        fontFamily: "var(--font-display)", background: "rgba(129,140,248,0.1)",
                        border: "1px solid rgba(129,140,248,0.2)", color: "#c7d2fe"
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── 6 Additional Agentic Projects in Clean 2-Column Grid ── */}
              <div
                style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "20px"
                }}
              >
                {otherAgenticProjects.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <div
                      key={p.id}
                      className="glass-card"
                      style={{
                        padding: "28px 24px", display: "flex", flexDirection: "column",
                        transition: "all 0.25s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <div
                          style={{
                            width: "42px", height: "42px", borderRadius: "12px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(129,140,248,0.09)", border: "1px solid rgba(129,140,248,0.2)"
                          }}
                        >
                          <Icon size={19} style={{ color: "#818cf8" }} />
                        </div>
                        <span
                          style={{
                            fontSize: "0.72rem", fontWeight: 700, color: "#64748b",
                            fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em"
                          }}
                        >
                          Agentic System #{idx + 2}
                        </span>
                      </div>

                      <h4 style={{ fontSize: "1.15rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "#f8fafc", marginBottom: "6px" }}>
                        {p.name}
                      </h4>

                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#818cf8", marginBottom: "14px" }}>
                        {p.tagline}
                      </p>

                      <p style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.7, marginBottom: "20px", flex: 1 }}>
                        {p.description}
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto" }}>
                        {p.tech.map((t) => (
                          <span
                            key={t}
                            style={{
                              padding: "4px 10px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 500,
                              fontFamily: "var(--font-display)", background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.07)", color: "#cbd5e1"
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════
            2. WEB APPLICATIONS (INVOICE WEB APP & PLATFORMS)
        ══════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {(filter === "all" || filter === "web") && (
            <motion.div
              key="web-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ marginBottom: "64px" }}
            >
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: "12px", marginBottom: "28px", paddingBottom: "16px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >
                    <Globe size={18} style={{ color: "#38bdf8" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.35rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "#f8fafc" }}>
                      Web Applications
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      Full-Stack Web Platforms &amp; Business SaaS Solutions
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    padding: "6px 14px", borderRadius: "99px",
                    background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)",
                    color: "#7dd3fc", fontSize: "0.75rem", fontWeight: 600, fontFamily: "var(--font-display)"
                  }}
                >
                  Full-Stack Platforms
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {webProjects.map((p) => {
                  const Icon = p.icon;
                  const isInvoice = p.id === "invoice-webapp";
                  return (
                    <div
                      key={p.id}
                      className="glass-card"
                      style={{
                        padding: "36px 32px",
                        border: isInvoice ? "1px solid rgba(56,189,248,0.3)" : "1px solid var(--border)",
                        background: isInvoice
                          ? "linear-gradient(180deg, rgba(56,189,248,0.05) 0%, rgba(255,255,255,0.02) 100%)"
                          : "var(--bg-card)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "44px", height: "44px", borderRadius: "12px",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)"
                            }}
                          >
                            <Icon size={20} style={{ color: "#38bdf8" }} />
                          </div>
                          <div>
                            <span
                              style={{
                                padding: "4px 10px", borderRadius: "99px",
                                background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)",
                                color: "#7dd3fc", fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-display)"
                              }}
                            >
                              {p.badge}
                            </span>
                          </div>
                        </div>

                        <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, fontFamily: "var(--font-display)" }}>
                          {p.category}
                        </span>
                      </div>

                      <h4 style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "#f8fafc", marginBottom: "6px" }}>
                        {p.name}
                      </h4>

                      <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#38bdf8", marginBottom: "16px" }}>
                        {p.tagline}
                      </p>

                      <p style={{ fontSize: "0.95rem", color: "#94a3b8", lineHeight: 1.8, marginBottom: "22px" }}>
                        {p.description}
                      </p>

                      {p.highlights && (
                        <div
                          style={{
                            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "10px", marginBottom: "24px"
                          }}
                        >
                          {p.highlights.map((h) => (
                            <div
                              key={h}
                              style={{
                                display: "flex", alignItems: "flex-start", gap: "8px",
                                padding: "10px 14px", borderRadius: "10px",
                                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)"
                              }}
                            >
                              <CheckCircle2 size={15} style={{ color: "#38bdf8", marginTop: "2px", flexShrink: 0 }} />
                              <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{h}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {p.tech.map((t) => (
                          <span
                            key={t}
                            style={{
                              padding: "5px 12px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 500,
                              fontFamily: "var(--font-display)", background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.07)", color: "#cbd5e1"
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════
            3. MOBILE APPLICATIONS (AQUASERVE)
        ══════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {(filter === "all" || filter === "mobile") && (
            <motion.div
              key="mobile-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ marginBottom: "32px" }}
            >
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: "12px", marginBottom: "28px", paddingBottom: "16px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >
                    <Smartphone size={18} style={{ color: "#34d399" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.35rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "#f8fafc" }}>
                      Mobile Applications
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      Cross-Platform Mobile Engineering &amp; On-Demand Distribution
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    padding: "6px 14px", borderRadius: "99px",
                    background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
                    color: "#6ee7b7", fontSize: "0.75rem", fontWeight: 600, fontFamily: "var(--font-display)"
                  }}
                >
                  Mobile Platform
                </span>
              </div>

              {mobileProjects.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.id}
                    className="glass-card"
                    style={{
                      padding: "36px 32px",
                      border: "1px solid rgba(52,211,153,0.3)",
                      background: "linear-gradient(180deg, rgba(52,211,153,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "44px", height: "44px", borderRadius: "12px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)"
                          }}
                        >
                          <Icon size={20} style={{ color: "#34d399" }} />
                        </div>
                        <div>
                          <span
                            style={{
                              padding: "4px 10px", borderRadius: "99px",
                              background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)",
                              color: "#6ee7b7", fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-display)"
                            }}
                          >
                            {p.badge}
                          </span>
                        </div>
                      </div>

                      <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, fontFamily: "var(--font-display)" }}>
                        {p.category}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "1.45rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "#f8fafc", marginBottom: "6px" }}>
                      {p.name}
                    </h4>

                    <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#34d399", marginBottom: "16px" }}>
                      {p.tagline}
                    </p>

                    <p style={{ fontSize: "0.95rem", color: "#94a3b8", lineHeight: 1.8, marginBottom: "24px" }}>
                      {p.description}
                    </p>

                    <div
                      style={{
                        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "10px", marginBottom: "26px"
                      }}
                    >
                      {p.highlights.map((h) => (
                        <div
                          key={h}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: "8px",
                            padding: "10px 14px", borderRadius: "10px",
                            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)"
                          }}
                        >
                          <CheckCircle2 size={15} style={{ color: "#34d399", marginTop: "2px", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{h}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {p.tech.map((t) => (
                        <span
                          key={t}
                          style={{
                            padding: "5px 12px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 500,
                            fontFamily: "var(--font-display)", background: "rgba(52,211,153,0.08)",
                            border: "1px solid rgba(52,211,153,0.2)", color: "#a7f3d0"
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
