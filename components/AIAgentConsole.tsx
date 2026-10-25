"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal, Send, Sparkles, Bot, CornerDownLeft, RotateCcw, Activity } from "lucide-react";
import TiltCard from "./TiltCard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const presetQueries = [
  { label: "⚡ Compound AI Architecture", query: "Can you explain Rutvik's flagship Autonomous Agentic Architecture and Compound AI Platform?" },
  { label: "🤖 7+ Agentic AI Projects", query: "What are the 7+ specialized Agentic AI systems that Rutvik has built?" },
  { label: "💼 Invoice Web App & AquaServe", query: "Tell me about Rutvik's Invoice Web App and the AquaServe Mobile Application." },
  { label: "🛠️ Core Tech Stack & ML", query: "What is Rutvik's core technical stack and machine learning expertise?" },
];

export default function AIAgentConsole() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Greetings. I am Rutvik's portfolio AI assistant powered by Groq LPU inference. Ask me anything about his Autonomous Agentic AI platforms, LangGraph compound systems, or full-stack web and mobile engineering.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [latency, setLatency] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window when new content arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || isStreaming) return;

    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInputVal("");
    setIsStreaming(true);
    setStreamedResponse("");

    const startTime = performance.now();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        throw new Error(`API response status ${res.status}`);
      }

      if (!res.body) throw new Error("No response stream available");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (firstChunk) {
          setLatency(Math.round(performance.now() - startTime));
          firstChunk = false;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamedResponse(accumulated);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
      setStreamedResponse("");
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm Rutvik's AI agent. Rutvik specializes in Agentic AI architectures, LangGraph compound systems, and high-dimensional machine learning systems. You can reach him directly at rutvik.professional@gmail.com.",
        },
      ]);
      setStreamedResponse("");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    if (isStreaming) return;
    setMessages([
      {
        role: "assistant",
        content:
          "System cleared. Ready for your questions regarding Rutvik's Compound AI architecture, 7+ Agentic AI projects, Invoice web app, or AquaServe mobile app.",
      },
    ]);
    setStreamedResponse("");
    setLatency(null);
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
        {/* Terminal Header Bar */}
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
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "rgba(0, 242, 254, 0.12)",
                border: "1px solid rgba(0, 242, 254, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Terminal size={17} style={{ color: "#00f2fe" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#f8fafc",
                    letterSpacing: "0.05em",
                  }}
                >
                  RUTVIK_LLM_TERMINAL
                </span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "99px",
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    color: "#fbbf24",
                    fontSize: "0.68rem",
                    fontFamily: "monospace",
                    fontWeight: 700,
                  }}
                >
                  GROQ LPU
                </span>
              </div>
              <span
                style={{
                  display: "block",
                  fontFamily: "monospace",
                  fontSize: "0.72rem",
                  color: "#00f2fe",
                  marginTop: "2px",
                }}
              >
                MODEL: LLAMA-3.3-70B-VERSATILE · {latency ? `TTFT: ${latency}MS` : "STREAMING ACTIVE"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={handleReset}
              disabled={isStreaming}
              title="Reset Conversation"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#94a3b8",
                fontSize: "0.75rem",
                fontFamily: "monospace",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={13} />
              Reset
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
              <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#34d399" }}>INFERENCE LIVE</span>
            </div>
          </div>
        </div>

        {/* Preset Prompt Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          {presetQueries.map((q) => (
            <button
              key={q.label}
              type="button"
              disabled={isStreaming}
              onClick={() => sendMessage(q.query)}
              style={{
                padding: "7px 14px",
                borderRadius: "99px",
                fontSize: "0.78rem",
                fontWeight: 600,
                fontFamily: "var(--font-display)",
                cursor: isStreaming ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(0, 242, 254, 0.2)",
                color: "#cbd5e1",
                opacity: isStreaming ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isStreaming) {
                  e.currentTarget.style.background = "rgba(0, 242, 254, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.4)";
                  e.currentTarget.style.color = "#00f2fe";
                }
              }}
              onMouseLeave={(e) => {
                if (!isStreaming) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.2)";
                  e.currentTarget.style.color = "#cbd5e1";
                }
              }}
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Conversation Dialog Window */}
        <div
          style={{
            padding: "20px 24px",
            borderRadius: "14px",
            background: "rgba(0, 0, 0, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            maxHeight: "360px",
            overflowY: "auto",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                  fontSize: "0.72rem",
                  fontFamily: "monospace",
                  color: m.role === "user" ? "#00f2fe" : "#818cf8",
                }}
              >
                {m.role === "user" ? "USER" : "AGENT // RUTVIK_AI"}
              </div>

              <div
                style={{
                  padding: "12px 18px",
                  borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: m.role === "user" ? "rgba(0, 242, 254, 0.12)" : "rgba(255, 255, 255, 0.03)",
                  border: m.role === "user" ? "1px solid rgba(0, 242, 254, 0.25)" : "1px solid rgba(255, 255, 255, 0.06)",
                  color: "#e2e8f0",
                  fontSize: "0.9rem",
                  lineHeight: 1.75,
                  maxWidth: "85%",
                  fontFamily: m.role === "user" ? "var(--font-display)" : "monospace",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            </div>
          ))}

          {/* Active Live Streaming Buffer */}
          {isStreaming && streamedResponse && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                  fontSize: "0.72rem",
                  fontFamily: "monospace",
                  color: "#818cf8",
                }}
              >
                <Activity size={12} className="ping-slow" />
                GROQ_LPU // INFERENCE STREAMING...
              </div>
              <div
                style={{
                  padding: "12px 18px",
                  borderRadius: "14px 14px 14px 4px",
                  background: "rgba(129, 140, 248, 0.08)",
                  border: "1px solid rgba(129, 140, 248, 0.25)",
                  color: "#e2e8f0",
                  fontSize: "0.9rem",
                  lineHeight: 1.75,
                  maxWidth: "85%",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                }}
              >
                {streamedResponse}
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "15px",
                    background: "#00f2fe",
                    marginLeft: "4px",
                    verticalAlign: "middle",
                    animation: "ping-slow 0.8s infinite",
                  }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Message Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputVal);
          }}
          style={{ display: "flex", gap: "10px" }}
        >
          <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                color: "#64748b",
                fontFamily: "monospace",
                fontSize: "0.9rem",
              }}
            >
              prompt&gt;
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask anything about Rutvik's Agentic AI platform, Web & Mobile apps, or ML expertise..."
              style={{
                width: "100%",
                padding: "13px 16px 13px 80px",
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
            disabled={isStreaming || !inputVal.trim()}
            style={{
              padding: "12px 24px",
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
              cursor: isStreaming || !inputVal.trim() ? "not-allowed" : "pointer",
              opacity: isStreaming || !inputVal.trim() ? 0.5 : 1,
              boxShadow: "0 0 20px rgba(0, 242, 254, 0.35)",
              transition: "transform 0.2s, opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isStreaming && inputVal.trim()) e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (!isStreaming && inputVal.trim()) e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Send
            <CornerDownLeft size={14} />
          </button>
        </form>
      </TiltCard>
    </div>
  );
}
