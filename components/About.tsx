"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GraduationCap } from "lucide-react";

const skills = [
  "Python", "Machine Learning", "LangGraph", "SQL",
  "React / Next.js", "NLP", "Deep Learning", "REST APIs",
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
          Building at the intersection of <span style={{ color: "#818cf8" }}>AI &amp; data.</span>
        </motion.h2>

        {/* Narrative Text */}
        <motion.div {...f(0.2)} style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.85, marginBottom: "64px" }}>
          <p style={{ marginBottom: "20px" }}>
            I&apos;m a developer and data scientist passionate about building intelligent systems.
            I completed my <span style={{ color: "#e2e8f0" }}>BCA</span> and am currently
            pursuing an <span style={{ color: "#e2e8f0" }}>MSC DATA SCIENCE</span>,
            focusing on autonomous agents, deep learning, and accessible AI.
          </p>
          <p>
            From NL-to-SQL pipelines to multi-agent LangGraph systems and LSTM stock prediction —
            I enjoy building end-to-end systems that solve real problems.
          </p>
        </motion.div>

        {/* Cards - Now stacked vertically for maximum space and centering */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Identity & Availability Card */}
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
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc", marginBottom: "8px" }}>
              Rutvik Bhanderi
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span style={{ position: "relative", display: "flex", width: "6px", height: "6px" }}>
                <span className="ping-slow" style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "#34d399", opacity: 0.75 }} />
                <span style={{ position: "relative", width: "6px", height: "6px", borderRadius: "50%", background: "#34d399" }} />
              </span>
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Available · India · Remote-friendly</span>
            </div>
          </motion.div>

          {/* Education Card */}
          <motion.div {...f(0.4)} className="glass-card" style={{ padding: "40px 24px", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "32px" }}>
              <div
                style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)"
                }}
              >
                <GraduationCap size={20} style={{ color: "#818cf8" }} />
              </div>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc" }}>
                Education
              </h4>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#818cf8", flexShrink: 0 }} />
                  <span style={{ fontSize: "1rem", fontWeight: 600, color: "#f1f5f9" }}>MSc Data Science</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Current · In Progress</p>
              </div>
              
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(148,163,184,0.4)", flexShrink: 0 }} />
                  <span style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0" }}>BCA</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Bachelor of Computer Applications · Completed</p>
              </div>
            </div>
          </motion.div>

          {/* Skills Core Card */}
          <motion.div {...f(0.5)} className="glass-card" style={{ padding: "40px 24px", width: "100%" }}>
            <p style={{
              fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#64748b", fontFamily: "var(--font-display)", marginBottom: "24px"
            }}>
              Core Technologies
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", maxWidth: "600px", margin: "0 auto" }}>
              {skills.map((s) => (
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
