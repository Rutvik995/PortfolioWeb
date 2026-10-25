"use client";

import { ArrowDown, Mail, Sparkles, Terminal, Activity, Brain, Layers } from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import LinkedinIcon from "@/components/icons/LinkedinIcon";

const socials = [
  { icon: GithubIcon, href: "https://github.com/Rutvik995", label: "GitHub" },
  { icon: LinkedinIcon, href: "https://www.linkedin.com/in/rutvikbhanderi", label: "LinkedIn" },
  { icon: Mail, href: "https://mail.google.com/mail/?view=cm&fs=1&to=rutvik.professional@gmail.com", label: "Email" },
];

const telemetryBadges = [
  { label: "7+ Agentic AI Pipelines", icon: Brain, color: "#818cf8" },
  { label: "LangGraph StateGraph Engine", icon: Layers, color: "#00f2fe" },
  { label: "Production RAG & Vector DBs", icon: Activity, color: "#34d399" },
];

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        paddingTop: "190px",
        paddingBottom: "130px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
      className="px-6 overflow-hidden grid-pattern"
    >
      {/* Background Neural Glow Orbs */}
      <div
        className="blob"
        style={{
          width: "550px", height: "550px", opacity: 0.08,
          background: "radial-gradient(circle, #00f2fe, transparent 70%)",
          top: "-10%", left: "-10%"
        }}
      />
      <div
        className="blob"
        style={{
          width: "500px", height: "500px", opacity: 0.07,
          background: "radial-gradient(circle, #818cf8, transparent 70%)",
          bottom: "-5%", right: "-5%"
        }}
      />

      {/* Main Content Container */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "900px", margin: "0 auto", width: "100%" }}>

        {/* AI System Status Badge */}
        <div
          className="animate-fade-up delay-1"
          style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            marginBottom: "32px", padding: "8px 22px", borderRadius: "99px",
            border: "1px solid rgba(0, 242, 254, 0.25)",
            background: "rgba(0, 242, 254, 0.04)",
            boxShadow: "0 0 24px rgba(0, 242, 254, 0.12)",
            color: "#e2e8f0", fontFamily: "var(--font-display)", fontSize: "0.82rem",
            fontWeight: 600,
          }}
        >
          <span style={{ position: "relative", display: "flex", width: "8px", height: "8px" }}>
            <span className="ping-slow" style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "#00f2fe", opacity: 0.85 }} />
            <span style={{ position: "relative", width: "8px", height: "8px", borderRadius: "50%", background: "#00f2fe", boxShadow: "0 0 8px #00f2fe" }} />
          </span>
          <span style={{ color: "#00f2fe", fontFamily: "monospace", letterSpacing: "0.05em" }}>SYSTEM: ONLINE</span>
          <span style={{ color: "#64748b" }}>//</span>
          <span>Open for AI/ML &amp; Data Science Roles</span>
        </div>

        {/* Main Heading */}
        <h1
          className="animate-fade-up delay-2"
          style={{
            fontFamily: "var(--font-display)", color: "#f8fafc",
            fontSize: "clamp(3.2rem, 8vw, 5.6rem)", fontWeight: 800,
            lineHeight: 1.08, marginBottom: "20px", letterSpacing: "-0.03em"
          }}
        >
          Hi, I&apos;m{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #00f2fe 0%, #818cf8 50%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 30px rgba(129, 140, 248, 0.35))",
            }}
          >
            Rutvik Bhanderi
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-up delay-3"
          style={{
            fontFamily: "var(--font-display)", color: "#c7d2fe",
            fontSize: "clamp(1.1rem, 3.2vw, 1.4rem)", fontWeight: 600,
            marginBottom: "24px", letterSpacing: "0.01em"
          }}
        >
          AI/ML Engineer · Agentic AI Architect · Data Scientist
        </p>

        {/* Description */}
        <p
          className="animate-fade-up delay-4"
          style={{
            color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.85,
            maxWidth: "680px", margin: "0 auto 36px auto",
          }}
        >
          Architecting autonomous multi-agent AI platforms, LangGraph compound systems, and high-performance machine learning pipelines.
          Bridging high-dimensional data science with robust production engineering.
        </p>

        {/* Telemetry Micro-Badges */}
        <div
          className="animate-fade-up delay-4"
          style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px",
            marginBottom: "44px"
          }}
        >
          {telemetryBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "7px 16px", borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  color: "#cbd5e1", fontSize: "0.82rem", fontWeight: 500,
                  fontFamily: "var(--font-display)"
                }}
              >
                <Icon size={14} style={{ color: badge.color }} />
                <span>{badge.label}</span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div
          className="animate-fade-up delay-5"
          style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "center", gap: "16px", marginBottom: "48px"
          }}
        >
          <a
            href="#projects"
            style={{
              background: "linear-gradient(135deg, #00f2fe 0%, #818cf8 100%)",
              color: "#060913",
              padding: "16px 36px", borderRadius: "14px",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem",
              textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 0 30px rgba(0, 242, 254, 0.35)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 45px rgba(0, 242, 254, 0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 242, 254, 0.35)"; }}
          >
            Explore AI Solutions
          </a>

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=rutvik.professional@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "rgba(129, 140, 248, 0.08)", color: "#f8fafc",
              padding: "15px 36px", borderRadius: "14px",
              border: "1px solid rgba(129, 140, 248, 0.35)",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.95rem",
              textDecoration: "none", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(129, 140, 248, 0.18)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(129, 140, 248, 0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Initiate Contact
          </a>
        </div>

        {/* Socials */}
        <div
          className="animate-fade-up delay-6"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}
        >
          {socials.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{
                width: "46px", height: "46px", borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#94a3b8", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#00f2fe";
                e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.4)";
                e.currentTarget.style.background = "rgba(0, 242, 254, 0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Icon size={19} />
            </a>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="animate-fade-up delay-8"
        style={{
          position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
        }}
      >
        <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#64748b", fontFamily: "monospace" }}>
          SCROLL_TO_EXPLORE
        </span>
        <ArrowDown size={14} className="bounce-y" style={{ color: "#00f2fe" }} />
      </div>
    </section>
  );
}
