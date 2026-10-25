"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BrainCircuit, BarChart2, Network, ShieldCheck, Terminal } from "lucide-react";
import TiltCard from "./TiltCard";

const coreSkills = [
  "Python", "Agentic AI", "LangGraph", "Machine Learning",
  "RAG Pipelines", "Vector Databases", "PostgreSQL", "Power BI",
  "FastAPI", "Next.js", "React Native", "Docker",
];

const highlights = [
  {
    icon: BrainCircuit,
    title: "AI/ML Engineering",
    color: "#00f2fe",
    desc: "Designing autonomous agents, compound AI systems, and high-dimensional ML pipelines that operate reliably in production environments.",
  },
  {
    icon: Network,
    title: "Agentic Architecture",
    color: "#818cf8",
    desc: "Building multi-agent orchestration frameworks with LangGraph — from self-learning memory nodes to multi-tenant agent platforms.",
  },
  {
    icon: BarChart2,
    title: "Data Science & Analytics",
    color: "#34d399",
    desc: "Transforming raw data into strategic intelligence through predictive modeling, NL-to-SQL systems, and Power BI business dashboards.",
  },
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const f = (d = 0) => ({
    initial: { opacity: 0, y: 25 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.6, delay: d },
  });

  return (
    <section id="about" style={{ position: "relative", padding: "160px 24px" }}>
      {/* Background Blob */}
      <div
        className="blob"
        style={{
          width: "500px", height: "500px", opacity: 0.04,
          background: "radial-gradient(circle, #818cf8, transparent 70%)",
          top: "10%", right: "-10%"
        }}
      />

      <div ref={ref} style={{ maxWidth: "880px", margin: "0 auto", textAlign: "center" }}>

        {/* Section Heading */}
        <motion.p {...f(0)} style={{
          fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase", color: "#818cf8", fontFamily: "monospace",
          marginBottom: "16px"
        }}>
          IDENTITY // ARCHITECT PROFILE
        </motion.p>

        <motion.h2 {...f(0.1)} style={{
          fontSize: "clamp(2rem, 5vw, 2.75rem)", fontWeight: 700,
          fontFamily: "var(--font-display)", color: "#f8fafc",
          marginBottom: "28px", lineHeight: 1.2, letterSpacing: "-0.02em"
        }}>
          Building at the frontier of <span style={{ color: "#818cf8" }}>AI &amp; Data Systems.</span>
        </motion.h2>

        {/* Narrative Text */}
        <motion.div {...f(0.2)} style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.85, marginBottom: "56px" }}>
          <p style={{ marginBottom: "20px" }}>
            I&apos;m an <span style={{ color: "#e2e8f0", fontWeight: 600 }}>AI/ML Engineer and Data Scientist</span> passionate about building
            autonomous intelligent systems. I specialize in designing <span style={{ color: "#00f2fe", fontWeight: 600 }}>agentic AI architectures</span> and
            compound multi-agent platforms that solve complex, real-world problems at scale.
          </p>
          <p>
            From multi-agent LangGraph systems to NL-to-SQL query engines, hybrid RAG pipelines, and full-stack platforms (including the Invoice Web App and AquaServe Mobile App) —
            I engineer end-to-end intelligent solutions that deliver measurable impact.
          </p>
        </motion.div>

        {/* Highlight 3D Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Identity Telemetry Card */}
          <TiltCard
            maxTilt={5}
            glowColor="rgba(129, 140, 248, 0.25)"
            style={{
              padding: "40px 28px", width: "100%",
              background: "linear-gradient(180deg, rgba(13, 17, 34, 0.85) 0%, rgba(8, 10, 22, 0.95) 100%)",
              border: "1px solid rgba(129, 140, 248, 0.2)",
            }}
          >
            <div
              style={{
                width: "64px", height: "64px", borderRadius: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.3)",
                color: "#818cf8", fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700,
                margin: "0 auto 20px auto",
                boxShadow: "0 0 24px rgba(129, 140, 248, 0.2)",
              }}
            >
              RB
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "#f8fafc", marginBottom: "6px" }}>
              Rutvik Bhanderi
            </p>
            <p style={{ fontSize: "0.92rem", color: "#818cf8", fontWeight: 600, fontFamily: "var(--font-display)", marginBottom: "18px" }}>
              AI/ML Engineer · Agentic AI Architect · Data Scientist
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
              <span style={{ position: "relative", display: "flex", width: "7px", height: "7px" }}>
                <span className="ping-slow" style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "#34d399", opacity: 0.75 }} />
                <span style={{ position: "relative", width: "7px", height: "7px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
              </span>
              <span style={{ fontSize: "0.85rem", color: "#64748b", fontFamily: "monospace" }}>LOCATION: INDIA · REMOTE-FRIENDLY</span>
            </div>

            {/* Micro specs */}
            <div
              style={{
                display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px",
                fontFamily: "monospace", fontSize: "0.75rem", color: "#94a3b8",
                paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.06)"
              }}
            >
              <span>FOCUS: MULTI-AGENT SWARMS</span>
              <span>·</span>
              <span>LANGGRAPH / STATEGRAPH</span>
              <span>·</span>
              <span>RAG &amp; VECTOR SEARCH</span>
            </div>
          </TiltCard>

          {/* Expertise Highlight Cards with 3D Tilt */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <TiltCard
                  key={h.title}
                  maxTilt={8}
                  glowColor={`${h.color}25`}
                  style={{
                    padding: "32px 24px",
                    background: "rgba(11, 15, 30, 0.75)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    textAlign: "center",
                  }}
                >
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${h.color}15`, border: `1px solid ${h.color}35`,
                    margin: "0 auto 18px auto",
                    color: h.color,
                  }}>
                    <Icon size={22} />
                  </div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", marginBottom: "10px" }}>
                    {h.title}
                  </h4>
                  <p style={{ fontSize: "0.88rem", color: "#94a3b8", lineHeight: 1.75 }}>
                    {h.desc}
                  </p>
                </TiltCard>
              );
            })}
          </div>

          {/* Core Technologies 3D Card */}
          <TiltCard
            maxTilt={5}
            glowColor="rgba(0, 242, 254, 0.18)"
            style={{
              padding: "36px 24px", width: "100%",
              background: "linear-gradient(180deg, rgba(10, 14, 28, 0.75) 0%, rgba(7, 9, 18, 0.95) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <p style={{
              fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#64748b", fontFamily: "monospace", marginBottom: "20px"
            }}>
              TECHNICAL CAPABILITIES
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", maxWidth: "680px", margin: "0 auto" }}>
              {coreSkills.map((s) => (
                <span key={s} style={{
                  padding: "8px 16px", borderRadius: "99px", fontSize: "0.82rem", fontWeight: 600,
                  fontFamily: "var(--font-display)", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1"
                }}>
                  {s}
                </span>
              ))}
            </div>
          </TiltCard>

        </div>
      </div>
    </section>
  );
}
