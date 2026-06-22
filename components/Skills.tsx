"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const skillGroups = [
  {
    title: "Languages & Frameworks",
    skills: [
      { name: "Python", level: 90 },
      { name: "TypeScript / JavaScript", level: 78 },
      { name: "SQL", level: 85 },
      { name: "React / Next.js", level: 75 },
    ],
  },
  {
    title: "AI / ML",
    skills: [
      { name: "LangGraph / LangChain", level: 88 },
      { name: "TensorFlow / Keras", level: 80 },
      { name: "scikit-learn", level: 85 },
      { name: "NLP / Transformers", level: 75 },
    ],
  },
  {
    title: "Data & Infrastructure",
    skills: [
      { name: "PostgreSQL / MySQL", level: 82 },
      { name: "FastAPI", level: 85 },
      { name: "Redis", level: 70 },
      { name: "REST / WebSocket APIs", level: 80 },
    ],
  },
];

const tools = [
  "Git & GitHub", "VS Code", "Jupyter", "Docker",
  "Pandas", "NumPy", "Plotly", "Matplotlib",
  "yFinance", "Vercel", "Postman", "Linux",
];

function SkillBar({ name, level }: { name: string; level: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} style={{ marginBottom: "20px", maxWidth: "400px", margin: "0 auto 20px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#94a3b8" }}>{name}</span>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>{level}%</span>
      </div>
      <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg, rgba(129,140,248,0.5), #818cf8)" }}
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
          background: "radial-gradient(circle, #818cf8, transparent 70%)",
          top: "10%", right: "-5%"
        }}
      />

      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", marginBottom: "64px" }} ref={ref}>
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
          Skills
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
          What I work <span style={{ color: "#818cf8" }}>with</span>
        </motion.h2>
      </div>

      {/* Stacked Skill Cards */}
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {skillGroups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 + gi * 0.15 }}
            className="glass-card"
            style={{ padding: "48px 32px", width: "100%", textAlign: "center" }}
          >
            <p style={{
              fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#f8fafc", fontFamily: "var(--font-display)", marginBottom: "32px"
            }}>
              {group.title}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {group.skills.map((s) => (
                <SkillBar key={s.name} name={s.name} level={s.level} />
              ))}
            </div>
          </motion.div>
        ))}

        {/* Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-card"
          style={{ padding: "48px 32px", width: "100%", textAlign: "center" }}
        >
          <p style={{
            fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
            color: "#f8fafc", fontFamily: "var(--font-display)", marginBottom: "32px"
          }}>
            Tools &amp; Ecosystem
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", maxWidth: "600px", margin: "0 auto" }}>
            {tools.map((t) => (
              <span key={t} style={{
                padding: "8px 16px", borderRadius: "99px", fontSize: "0.85rem", fontWeight: 500,
                fontFamily: "var(--font-display)", background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1"
              }}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
