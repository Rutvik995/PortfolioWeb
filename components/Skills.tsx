"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Cpu, Brain, Database, Wrench } from "lucide-react";
import TiltCard from "./TiltCard";

const skillGroups = [
  {
    title: "Core Languages & Analytics Engines",
    icon: Database,
    color: "#00f2fe",
    skills: [
      { name: "Python", level: 92 },
      { name: "SQL / PostgreSQL", level: 88 },
      { name: "Power BI (Business Analytics & DAX)", level: 82 },
    ],
  },
  {
    title: "Agentic AI & Machine Learning",
    icon: Brain,
    color: "#818cf8",
    skills: [
      { name: "Agentic AI / Multi-Agent Systems", level: 92 },
      { name: "LangGraph (StateGraph Orchestration)", level: 90 },
      { name: "Machine Learning / Deep Learning (PyTorch)", level: 86 },
      { name: "RAG (Hybrid Dense/Sparse Retrieval)", level: 88 },
    ],
  },
  {
    title: "Data & Agent Infrastructure",
    icon: Cpu,
    color: "#34d399",
    skills: [
      { name: "Vector Databases (Pinecone / ChromaDB)", level: 84 },
      { name: "Harness of Agents & Tool Calling", level: 90 },
      { name: "LangChain / LLM Structured Output", level: 88 },
      { name: "FastAPI / WebSocket Streaming APIs", level: 86 },
    ],
  },
];

const tools = [
  "LangGraph", "LangChain", "OpenAI API", "RAG Pipelines",
  "Pinecone", "ChromaDB", "PostgreSQL", "Power BI",
  "FastAPI", "Next.js", "React Native", "TypeScript",
  "Redis", "Docker", "Git & GitHub", "Pandas",
];

function SkillBar({ name, level, color }: { name: string; level: number; color: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} style={{ marginBottom: "20px", maxWidth: "520px", margin: "0 auto 20px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#cbd5e1", fontFamily: "var(--font-display)" }}>{name}</span>
        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: color, fontFamily: "monospace" }}>{level}%</span>
      </div>
      <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: "99px",
            background: `linear-gradient(90deg, rgba(129,140,248,0.4), ${color})`,
            boxShadow: `0 0 10px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" style={{ position: "relative", padding: "160px 24px" }}>
      <div
        className="blob"
        style={{
          width: "400px", height: "400px", opacity: 0.04,
          background: "radial-gradient(circle, #00f2fe, transparent 70%)",
          top: "10%", right: "-5%"
        }}
      />

      <div style={{ maxWidth: "880px", margin: "0 auto", textAlign: "center", marginBottom: "64px" }} ref={ref}>
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#00f2fe", fontFamily: "monospace",
            marginBottom: "16px"
          }}
        >
          CORE COMPETENCIES // ARSENAL
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
          Technical <span style={{ color: "#00f2fe" }}>Expertise</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            color: "#94a3b8", fontSize: "1rem", lineHeight: 1.8,
            maxWidth: "540px", margin: "0 auto"
          }}
        >
          Specialized in Agentic AI architectures, machine learning engineering, and intelligent data systems.
        </motion.p>
      </div>

      {/* Stacked 3D Tilt Skill Cards */}
      <div style={{ maxWidth: "880px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>

        {skillGroups.map((group, gi) => {
          const Icon = group.icon;
          return (
            <TiltCard
              key={group.title}
              maxTilt={6}
              glowColor={`${group.color}25`}
              style={{
                padding: "44px 32px",
                width: "100%",
                background: "linear-gradient(180deg, rgba(13, 17, 34, 0.8) 0%, rgba(8, 10, 20, 0.95) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "28px" }}>
                <Icon size={18} style={{ color: group.color }} />
                <p style={{
                  fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#f8fafc", fontFamily: "var(--font-display)"
                }}>
                  {group.title}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {group.skills.map((s) => (
                  <SkillBar key={s.name} name={s.name} level={s.level} color={group.color} />
                ))}
              </div>
            </TiltCard>
          );
        })}

        {/* Tools Section with 3D Tilt */}
        <TiltCard
          maxTilt={5}
          glowColor="rgba(0, 242, 254, 0.2)"
          style={{
            padding: "40px 32px", width: "100%", textAlign: "center",
            background: "linear-gradient(180deg, rgba(10, 14, 28, 0.8) 0%, rgba(7, 9, 18, 0.95) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "28px" }}>
            <Wrench size={18} style={{ color: "#00f2fe" }} />
            <p style={{
              fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#f8fafc", fontFamily: "var(--font-display)"
            }}>
              Production Ecosystem &amp; Toolchain
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", maxWidth: "680px", margin: "0 auto" }}>
            {tools.map((t) => (
              <span key={t} style={{
                padding: "8px 16px", borderRadius: "99px", fontSize: "0.82rem", fontWeight: 600,
                fontFamily: "var(--font-display)", background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1",
                transition: "all 0.2s"
              }}>
                {t}
              </span>
            ))}
          </div>
        </TiltCard>

      </div>
    </section>
  );
}
