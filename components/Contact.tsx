"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Copy, Check, ExternalLink, MapPin, Sparkles } from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import LinkedinIcon from "@/components/icons/LinkedinIcon";
import TiltCard from "./TiltCard";

const GMAIL_URL = "https://mail.google.com/mail/?view=cm&fs=1&to=rutvik.professional@gmail.com";
const EMAIL_ADDRESS = "rutvik.professional@gmail.com";
const GITHUB_URL = "https://github.com/Rutvik995";
const LINKEDIN_URL = "https://www.linkedin.com/in/rutvikbhanderi";

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(EMAIL_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section id="contact" style={{ position: "relative", padding: "160px 24px" }}>
      {/* Background Glow */}
      <div
        className="blob"
        style={{
          width: "450px", height: "450px", opacity: 0.05,
          background: "radial-gradient(circle, #00f2fe, transparent 70%)",
          bottom: "-5%", right: "-5%"
        }}
      />

      <div style={{ maxWidth: "860px", margin: "0 auto" }} ref={ref}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
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
            COMMUNICATION // SECURE CHANNEL
          </motion.p>
          
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: "clamp(2rem, 5vw, 2.75rem)", fontWeight: 700,
              fontFamily: "var(--font-display)", color: "#f8fafc",
              marginBottom: "20px", lineHeight: 1.2, letterSpacing: "-0.02em"
            }}
          >
            Let&apos;s build something <span style={{ color: "#00f2fe" }}>extraordinary.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.85, maxWidth: "620px", margin: "0 auto 28px auto" }}
          >
            Available for AI/ML engineering positions, Agentic AI architect contracts, or technical collaborations on intelligent systems.
          </motion.p>

          {/* Status Pill */}
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "8px 20px", borderRadius: "99px",
              background: "rgba(0, 242, 254, 0.05)", border: "1px solid rgba(0, 242, 254, 0.2)",
              color: "#cbd5e1", fontSize: "0.82rem", fontWeight: 600, fontFamily: "var(--font-display)"
            }}
          >
            <span style={{ position: "relative", display: "flex", width: "8px", height: "8px" }}>
              <span className="ping-slow" style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "#00f2fe", opacity: 0.75 }} />
              <span style={{ position: "relative", width: "8px", height: "8px", borderRadius: "50%", background: "#00f2fe", boxShadow: "0 0 8px #00f2fe" }} />
            </span>
            <span>Available for opportunities</span>
            <span style={{ color: "#64748b" }}>·</span>
            <span style={{ color: "#94a3b8" }}>India · Remote-friendly</span>
          </div>
        </div>

        {/* 3 Perfectly Aligned Contact Channels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* 1. Direct Email Card */}
          <TiltCard
            maxTilt={5}
            glowColor="rgba(0, 242, 254, 0.25)"
            style={{
              padding: "26px 32px",
              background: "linear-gradient(180deg, rgba(12, 18, 34, 0.9) 0%, rgba(8, 12, 24, 0.96) 100%)",
              border: "1px solid rgba(0, 242, 254, 0.3)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 w-full">
              {/* Left: Icon & Details */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", minWidth: 0, flex: 1 }}>
                <a
                  href={GMAIL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Send Email via Gmail"
                  style={{
                    width: "54px", height: "54px", borderRadius: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: "rgba(0, 242, 254, 0.12)", border: "1px solid rgba(0, 242, 254, 0.3)",
                    boxShadow: "0 0 16px rgba(0, 242, 254, 0.15)",
                    transition: "transform 0.2s, background 0.2s",
                    textDecoration: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.background = "rgba(0, 242, 254, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "rgba(0, 242, 254, 0.12)";
                  }}
                >
                  <Mail size={22} style={{ color: "#00f2fe" }} />
                </a>

                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#00f2fe", marginBottom: "4px", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>
                    DIRECT EMAIL // PRIMARY INBOX
                  </p>
                  <a
                    href={GMAIL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc",
                      fontFamily: "var(--font-display)", wordBreak: "break-all",
                      textDecoration: "none", transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#00f2fe")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#f8fafc")}
                  >
                    {EMAIL_ADDRESS}
                  </a>
                </div>
              </div>

              {/* Right: Aligned Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "10px 18px", borderRadius: "10px",
                    background: copied ? "rgba(52, 211, 153, 0.18)" : "rgba(255, 255, 255, 0.04)",
                    border: copied ? "1px solid rgba(52, 211, 153, 0.45)" : "1px solid rgba(255, 255, 255, 0.12)",
                    color: copied ? "#34d399" : "#cbd5e1",
                    fontSize: "0.85rem", fontFamily: "var(--font-display)", fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (!copied) e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    if (!copied) e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                  }}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copied ? "Copied!" : "Copy Address"}</span>
                </button>

                <a
                  href={GMAIL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "10px 22px", borderRadius: "10px",
                    background: "linear-gradient(135deg, #00f2fe 0%, #818cf8 100%)",
                    color: "#060913",
                    fontSize: "0.85rem", fontFamily: "var(--font-display)", fontWeight: 700,
                    textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
                    boxShadow: "0 0 20px rgba(0, 242, 254, 0.3)"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span>Open in Gmail</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </TiltCard>

          {/* 2. GitHub Profile Card */}
          <TiltCard
            maxTilt={5}
            glowColor="rgba(129, 140, 248, 0.22)"
            style={{
              padding: "26px 32px",
              background: "linear-gradient(180deg, rgba(14, 16, 32, 0.9) 0%, rgba(9, 11, 22, 0.96) 100%)",
              border: "1px solid rgba(129, 140, 248, 0.25)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 w-full">
              {/* Left: Icon & Details */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", minWidth: 0, flex: 1 }}>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit GitHub Profile"
                  style={{
                    width: "54px", height: "54px", borderRadius: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: "rgba(129, 140, 248, 0.12)", border: "1px solid rgba(129, 140, 248, 0.3)",
                    boxShadow: "0 0 16px rgba(129, 140, 248, 0.15)",
                    transition: "transform 0.2s, background 0.2s",
                    textDecoration: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.background = "rgba(129, 140, 248, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "rgba(129, 140, 248, 0.12)";
                  }}
                >
                  <GithubIcon size={22} style={{ color: "#818cf8" }} />
                </a>

                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#818cf8", marginBottom: "4px", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>
                    GITHUB // OPEN SOURCE REPOSITORIES
                  </p>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc",
                      fontFamily: "var(--font-display)", wordBreak: "break-all",
                      textDecoration: "none", transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#818cf8")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#f8fafc")}
                  >
                    github.com/Rutvik995
                  </a>
                </div>
              </div>

              {/* Right: Aligned Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, flexWrap: "wrap" }}>
                <a
                  href="https://github.com/Rutvik995?tab=repositories"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "10px 18px", borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#cbd5e1",
                    fontSize: "0.85rem", fontFamily: "var(--font-display)", fontWeight: 600,
                    textDecoration: "none", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.color = "#cbd5e1";
                  }}
                >
                  <span>Repositories</span>
                </a>

                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "10px 22px", borderRadius: "10px",
                    background: "rgba(129, 140, 248, 0.14)",
                    border: "1px solid rgba(129, 140, 248, 0.4)",
                    color: "#c7d2fe",
                    fontSize: "0.85rem", fontFamily: "var(--font-display)", fontWeight: 600,
                    textDecoration: "none", transition: "all 0.2s",
                    boxShadow: "0 0 16px rgba(129, 140, 248, 0.15)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(129, 140, 248, 0.24)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(129, 140, 248, 0.14)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <GithubIcon size={15} />
                  <span>Visit GitHub</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </TiltCard>

          {/* 3. LinkedIn Network Card */}
          <TiltCard
            maxTilt={5}
            glowColor="rgba(56, 189, 248, 0.22)"
            style={{
              padding: "26px 32px",
              background: "linear-gradient(180deg, rgba(10, 16, 32, 0.9) 0%, rgba(7, 11, 22, 0.96) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 w-full">
              {/* Left: Icon & Details */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", minWidth: 0, flex: 1 }}>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect on LinkedIn"
                  style={{
                    width: "54px", height: "54px", borderRadius: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)",
                    boxShadow: "0 0 16px rgba(56, 189, 248, 0.15)",
                    transition: "transform 0.2s, background 0.2s",
                    textDecoration: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.background = "rgba(56, 189, 248, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "rgba(56, 189, 248, 0.12)";
                  }}
                >
                  <LinkedinIcon size={22} style={{ color: "#38bdf8" }} />
                </a>

                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#38bdf8", marginBottom: "4px", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>
                    LINKEDIN // PROFESSIONAL NETWORK
                  </p>
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc",
                      fontFamily: "var(--font-display)", wordBreak: "break-all",
                      textDecoration: "none", transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#f8fafc")}
                  >
                    linkedin.com/in/rutvikbhanderi
                  </a>
                </div>
              </div>

              {/* Right: Aligned Action Button */}
              <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "10px 22px", borderRadius: "10px",
                    background: "rgba(56, 189, 248, 0.14)",
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    color: "#bae6fd",
                    fontSize: "0.85rem", fontFamily: "var(--font-display)", fontWeight: 600,
                    textDecoration: "none", transition: "all 0.2s",
                    boxShadow: "0 0 16px rgba(56, 189, 248, 0.15)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(56, 189, 248, 0.24)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(56, 189, 248, 0.14)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <LinkedinIcon size={15} />
                  <span>Connect on LinkedIn</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </TiltCard>

        </div>
      </div>
    </section>
  );
}
