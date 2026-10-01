"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BrainCircuit, BarChart2, Network } from "lucide-react";

const coreSkills = [
  "Python", "Agentic AI", "Machine Learning", "LangGraph",
  "RAG Pipelines", "Vector Databases", "PostgreSQL", "Power BI",
];

const highlights = [
  {
    icon: BrainCircuit,
    title: "AI/ML Engineering",
    desc: "Designing autonomous agents, compound AI systems, and LLM-powered pipelines that operate reliably in production environments.",
  },
  {
    icon: Network,
    title: "Agentic Architecture",
    desc: "Building multi-agent orchestration frameworks with LangGraph — from self-learning memory systems to multi-tenant agent platforms.",
  },
  {
    icon: BarChart2,
    title: "Data Science & Analytics",
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

      <div ref={ref} style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>

        {/* Section Heading */}
        <motion.p {...f(0)} style={{
          fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase", color: "#818cf8", fontFamily: "var(--font-display)",
          marginBottom: "16px"
        }}>
          About Me
        </motion.p>

        <motion.h2 {...f(0.1)} style={{
          fontSize: "clamp(2rem, 5vw, 2.75rem)", fontWeight: 700,
          fontFamily: "var(--font-display)", color: "#f8fafc",
          marginBottom: "32px", lineHeight: 1.2, letterSpacing: "-0.02em"
        }}>
          Building at the intersection of <span style={{ color: "#818cf8" }}>AI &amp; intelligence.</span>
        </motion.h2>

        {/* Narrative Text */}
        <motion.div {...f(0.2)} style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.85, marginBottom: "64px" }}>
          <p style={{ marginBottom: "20px" }}>
            I&apos;m an <span style={{ color: "#e2e8f0" }}>AI/ML Engineer and Data Scientist</span> passionate about building
            autonomous intelligent systems. I specialize in designing <span style={{ color: "#e2e8f0" }}>agentic AI architectures</span> and
            compound multi-agent platforms that solve complex, real-world problems at scale.
          </p>
          <p>
            From multi-agent LangGraph systems to NL-to-SQL pipelines, RAG-powered applications, and ML-driven analytics —
            I engineer end-to-end intelligent solutions that deliver measurable business value.
          </p>
        </motion.div>

        {/* Highlight Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Identity Card */}
          <motion.div {...f(0.3)} className="glass-card" style={{ padding: "40px 24px", width: "100%" }}>
            <div
              style={{
                width: "64px", height: "64px", borderRadius: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)",
                color: "#818cf8", fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700,
                margin: "0 auto 24px auto"
              }}
            >
              RB
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc", marginBottom: "6px" }}>
              Rutvik Bhanderi
            </p>
            <p style={{ fontSize: "0.9rem", color: "#818cf8", fontWeight: 600, fontFamily: "var(--font-display)", marginBottom: "16px" }}>
              AI/ML Engineer · Agentic AI Architect · Data Scientist
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span style={{ position: "relative", display: "flex", width: "6px", height: "6px" }}>
                <span className="ping-slow" style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "#34d399", opacity: 0.75 }} />
                <span style={{ position: "relative", width: "6px", height: "6px", borderRadius: "50%", background: "#34d399" }} />
              </span>
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Available · India · Remote-friendly</span>
            </div>
          </motion.div>

          {/* Expertise Highlight Cards */}
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <motion.div key={h.title} {...f(0.4 + i * 0.1)} className="glass-card" style={{ padding: "40px 24px", width: "100%" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)",
                  margin: "0 auto 20px auto"
                }}>
                  <Icon size={20} style={{ color: "#818cf8" }} />
                </div>
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", marginBottom: "12px" }}>
                  {h.title}
                </h4>
                <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.75, maxWidth: "480px", margin: "0 auto" }}>
                  {h.desc}
                </p>
              </motion.div>
            );
          })}

          {/* Core Technologies Card */}
          <motion.div {...f(0.75)} className="glass-card" style={{ padding: "40px 24px", width: "100%" }}>
            <p style={{
              fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#64748b", fontFamily: "var(--font-display)", marginBottom: "24px"
            }}>
              Core Technologies
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", maxWidth: "600px", margin: "0 auto" }}>
              {coreSkills.map((s) => (
                <span key={s} style={{
                  padding: "8px 16px", borderRadius: "99px", fontSize: "0.85rem", fontWeight: 500,
                  fontFamily: "var(--font-display)", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1"
                }}>
                  {s}
                </span>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
