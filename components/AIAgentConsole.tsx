"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal, Send, Sparkles, Bot, CornerDownLeft, RefreshCcw } from "lucide-react";
import TiltCard from "./TiltCard";

interface QAItem {
  prompt: string;
  response: string;
  tag: string;
}

const knowledgeBase: Record<string, string> = {
  flagship:
    "Rutvik's flagship project is the Autonomous Agentic Architecture & Compound AI Platform. Built with LangGraph, it features multi-goal isolation via compound namespace keys, self-learning reflection nodes for autonomous error-recovery, dual-storage persistence (Redis + PostgreSQL), and a full WebSocket orchestration layer.",
  agentic:
    "Rutvik has engineered 7+ specialized Agentic AI Systems: (1) Autonomous Multi-Agent AI Platform (LangGraph), (2) Solar Power Plant Telemetry Agent, (3) Network Topology & Anomaly Analysis System, (4) Business KPI & Executive Decision Agent, (5) Natural Language to SQL Query Agent, (6) Customer Intelligence & Support Agent, and (7) Financial Forecasting LSTM Market Agent.",
  apps:
    "In full-stack engineering, Rutvik developed the 'Invoice Web App' (comprehensive billing platform with dynamic tax calculations, custom PDF generator, client ledger, and payment tracking) and 'AquaServe' (on-demand water delivery and recurring subscription mobile app with real-time GPS tracking and route optimization).",
  skills:
    "Rutvik specializes in Python, Agentic AI, LangGraph, Machine Learning, PostgreSQL, Power BI, RAG (Retrieval-Augmented Generation), Vector Databases (Pinecone, ChromaDB), FastAPI, Next.js, and React Native for mobile.",
};

const presetQueries = [
  { label: "⚡ Flagship Compound AI Architecture", key: "flagship" },
  { label: "🤖 7+ Agentic AI Projects", key: "agentic" },
  { label: "💼 Invoice Web App & AquaServe", key: "apps" },
  { label: "🛠️ Core Tech Stack & Skills", key: "skills" },
];

export default function AIAgentConsole() {
  const [inputVal, setInputVal] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeQueryKey, setActiveQueryKey] = useState("flagship");
  const [streamIndex, setStreamIndex] = useState(0);
  const fullTextRef = useRef(knowledgeBase["flagship"]);

  // Stream text token by token
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStreaming && streamIndex < fullTextRef.current.length) {
      timer = setTimeout(() => {
        setDisplayedText(fullTextRef.current.slice(0, streamIndex + 3));
        setStreamIndex((prev) => prev + 3);
      }, 16);
    } else if (streamIndex >= fullTextRef.current.length) {
      setIsStreaming(false);
    }
    return () => clearTimeout(timer);
  }, [isStreaming, streamIndex]);

  // Initial load stream
  useEffect(() => {
    triggerQuery("flagship");
  }, []);

  const triggerQuery = (key: string) => {
    const text = knowledgeBase[key] || "Analyzing agent neural logs for query...";
    fullTextRef.current = text;
    setActiveQueryKey(key);
    setDisplayedText("");
    setStreamIndex(0);
    setIsStreaming(true);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const lower = inputVal.toLowerCase();
    let matchedKey = "agentic";

    if (lower.includes("flagship") || lower.includes("compound") || lower.includes("langgraph")) {
      matchedKey = "flagship";
    } else if (lower.includes("invoice") || lower.includes("aquaserve") || lower.includes("mobile") || lower.includes("web")) {
      matchedKey = "apps";
    } else if (lower.includes("skill") || lower.includes("stack") || lower.includes("python") || lower.includes("ml")) {
      matchedKey = "skills";
    }

    fullTextRef.current = knowledgeBase[matchedKey];
    setActiveQueryKey(matchedKey);
    setDisplayedText("");
    setStreamIndex(0);
    setIsStreaming(true);
    setInputVal("");
  };

  return (
    <div style={{ maxWidth: "1050px", margin: "80px auto 0 auto", padding: "0 12px" }}>
      <TiltCard
        maxTilt={5}
        glowColor="rgba(0, 242, 254, 0.22)"
        style={{
          padding: "32px",
          border: "1px solid rgba(0, 242, 254, 0.25)",
          background: "linear-gradient(180deg, rgba(8, 12, 22, 0.98) 0%, rgba(5, 7, 14, 0.99) 100%)",
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            paddingBottom: "16px",
            marginBottom: "20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(0, 242, 254, 0.12)",
                border: "1px solid rgba(0, 242, 254, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Terminal size={16} style={{ color: "#00f2fe" }} />
            </div>
            <div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#f8fafc",
                  letterSpacing: "0.05em",
                }}
              >
                RUTVIK_AI_TERMINAL // v2.6.4
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  color: "#00f2fe",
                }}
              >
                MODEL: AGENTIC-REASONING-ENGINE · LATENCY &lt; 14MS
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
            <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#34d399" }}>ONLINE</span>
          </div>
        </div>

        {/* Preset Prompt Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          {presetQueries.map((q) => {
            const isSelected = activeQueryKey === q.key;
            return (
              <button
                key={q.key}
                type="button"
                onClick={() => triggerQuery(q.key)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "99px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: isSelected ? "rgba(0, 242, 254, 0.18)" : "rgba(255, 255, 255, 0.03)",
                  border: isSelected ? "1px solid rgba(0, 242, 254, 0.45)" : "1px solid rgba(255, 255, 255, 0.08)",
                  color: isSelected ? "#00f2fe" : "#94a3b8",
                }}
              >
                {q.label}
              </button>
            );
          })}
        </div>

        {/* Console Output Screen */}
        <div
          style={{
            padding: "20px 24px",
            borderRadius: "14px",
            background: "rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            minHeight: "120px",
            marginBottom: "20px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.92rem",
              lineHeight: 1.85,
              color: "#e2e8f0",
              whiteSpace: "pre-wrap",
            }}
          >
            <span style={{ color: "#00f2fe", marginRight: "8px" }}>➜</span>
            {displayedText}
            {isStreaming && (
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "15px",
                  background: "#00f2fe",
                  marginLeft: "4px",
                  verticalAlign: "middle",
                  animation: "ping-slow 1s infinite",
                }}
              />
            )}
          </div>
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleCustomSubmit} style={{ display: "flex", gap: "10px" }}>
          <div
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "14px",
                color: "#64748b",
                fontFamily: "monospace",
                fontSize: "0.9rem",
              }}
            >
              query&gt;
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about Rutvik's architecture, 7+ AI projects, Invoice web app..."
              style={{
                width: "100%",
                padding: "12px 16px 12px 75px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#f8fafc",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                outline: "none",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.4)";
                e.currentTarget.style.background = "rgba(0, 242, 254, 0.04)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isStreaming}
            style={{
              padding: "12px 22px",
              borderRadius: "12px",
              background: "#00f2fe",
              border: "none",
              color: "#070b14",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: isStreaming ? "not-allowed" : "pointer",
              opacity: isStreaming ? 0.6 : 1,
              boxShadow: "0 0 20px rgba(0, 242, 254, 0.3)",
              transition: "transform 0.2s, opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isStreaming) e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (!isStreaming) e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Run
            <CornerDownLeft size={14} />
          </button>
        </form>
      </TiltCard>
    </div>
  );
}
