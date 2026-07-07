"use client";

import { ArrowDown, Mail } from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import LinkedinIcon from "@/components/icons/LinkedinIcon";

const socials = [
  { icon: GithubIcon, href: "https://github.com/Rutvik995", label: "GitHub" },
  { icon: LinkedinIcon, href: "https://www.linkedin.com/in/rutvikbhanderi", label: "LinkedIn" },
  { icon: Mail, href: "mailto:rutvik.professional@gmail.com", label: "Email" },
];

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        paddingTop: "200px",
        paddingBottom: "150px",
        display: "flex",
        flexDirection: "column",

        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
      className="px-6 overflow-hidden grid-pattern"
    >
      {/* Background blobs */}
      <div
        className="blob"
        style={{
          width: "500px", height: "500px", opacity: 0.05,
          background: "radial-gradient(circle, #818cf8, transparent 70%)",
          top: "-10%", left: "-10%"
        }}
      />
      <div
        className="blob"
        style={{
          width: "400px", height: "400px", opacity: 0.03,
          background: "radial-gradient(circle, #c4b5fd, transparent 70%)",
          bottom: "-5%", right: "-5%"
        }}
      />

      {/* Main Content */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "800px", margin: "0 auto", width: "100%" }}>

        {/* Badge */}
        <div
          className="animate-fade-up delay-1"
          style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            marginBottom: "40px", padding: "8px 20px", borderRadius: "99px",
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            color: "#94a3b8", fontFamily: "var(--font-display)", fontSize: "0.8rem",
            fontWeight: 500,
          }}
        >
          <span style={{ position: "relative", display: "flex", width: "6px", height: "6px" }}>
            <span className="ping-slow" style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "#34d399", opacity: 0.75 }} />
            <span style={{ position: "relative", width: "6px", height: "6px", borderRadius: "50%", background: "#34d399" }} />
          </span>
          Available for opportunities
        </div>

        {/* Heading */}
        <h1
          className="animate-fade-up delay-2"
          style={{
            fontFamily: "var(--font-display)", color: "#f8fafc",
            fontSize: "clamp(3rem, 8vw, 5rem)", fontWeight: 700,
            lineHeight: 1.1, marginBottom: "24px", letterSpacing: "-0.02em"
          }}
        >
          Hi, I&apos;m{" "}
          <span style={{ color: "#818cf8" }}>Rutvik Bhanderi</span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-up delay-3"
          style={{
            fontFamily: "var(--font-display)", color: "#a5b4fc",
            fontSize: "clamp(1rem, 3vw, 1.25rem)", fontWeight: 500,
            marginBottom: "32px", letterSpacing: "0.01em"
          }}
        >
          MSc Data Science · AI Engineer · Full-Stack Developer
        </p>

        {/* Description */}
        <p
          className="animate-fade-up delay-4"
          style={{
            color: "#64748b", fontSize: "1rem", lineHeight: 1.8,
            maxWidth: "600px", margin: "0 auto 48px auto",
          }}
        >
          Building autonomous AI agents, NL-to-SQL pipelines, and ML-powered platforms.
          I turn complex data into clean, functional, and minimal real-world systems.
        </p>

        {/* Actions */}
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
              background: "#818cf8", color: "#fff",
              padding: "14px 32px", borderRadius: "12px",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9rem",
              textDecoration: "none", transition: "opacity 0.2s, transform 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            View My Work
          </a>
          <a
            href="#contact"
            style={{
              background: "transparent", color: "#818cf8",
              padding: "13px 32px", borderRadius: "12px",
              border: "1px solid rgba(129,140,248,0.3)",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9rem",
              textDecoration: "none", transition: "background 0.2s, transform 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(129,140,248,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Get In Touch
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
                width: "44px", height: "44px", borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "#64748b", transition: "color 0.2s, border-color 0.2s, background 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#f1f5f9";
                e.currentTarget.style.borderColor = "rgba(129,140,248,0.3)";
                e.currentTarget.style.background = "rgba(129,140,248,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              }}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>

      <div
        className="animate-fade-up delay-8"
        style={{
          position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
        }}
      >
        <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#475569" }}>
          Scroll
        </span>
        <ArrowDown size={14} className="bounce-y" style={{ color: "#475569" }} />
      </div>
    </section>
  );
}
