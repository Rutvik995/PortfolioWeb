"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Send, MapPin, Copy, Check, ExternalLink } from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import LinkedinIcon from "@/components/icons/LinkedinIcon";
import TiltCard from "./TiltCard";

const GMAIL_URL = "https://mail.google.com/mail/?view=cm&fs=1&to=rutvik.professional@gmail.com";
const EMAIL_ADDRESS = "rutvik.professional@gmail.com";

const contacts = [
  {
    id: "email-link",
    icon: Mail,
    label: "Direct Email (Opens in Gmail)",
    value: EMAIL_ADDRESS,
    href: GMAIL_URL,
    isEmail: true,
  },
  {
    id: "github-link",
    icon: GithubIcon,
    label: "GitHub Profile",
    value: "github.com/Rutvik995",
    href: "https://github.com/Rutvik995",
    isEmail: false,
  },
  {
    id: "linkedin-link",
    icon: LinkedinIcon,
    label: "LinkedIn Network",
    value: "linkedin.com/in/rutvikbhanderi",
    href: "https://www.linkedin.com/in/rutvikbhanderi",
    isEmail: false,
  },
];

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
      <div
        className="blob"
        style={{
          width: "400px", height: "400px", opacity: 0.05,
          background: "radial-gradient(circle, #00f2fe, transparent 70%)",
          bottom: "-5%", right: "-5%"
        }}
      />

      {/* Header */}
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", marginBottom: "64px" }} ref={ref}>
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
            marginBottom: "24px", lineHeight: 1.2, letterSpacing: "-0.02em"
          }}
        >
          Let&apos;s engineer something <span style={{ color: "#00f2fe" }}>extraordinary.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.85, maxWidth: "600px", margin: "0 auto" }}
        >
          Available for AI/ML engineering roles, Agentic AI architect contracts, or collaborative research on intelligent systems.
        </motion.p>
      </div>

      {/* Stacked 3D Cards */}
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* CTA 3D Tilt Card */}
        <TiltCard
          maxTilt={5}
          glowColor="rgba(0, 242, 254, 0.22)"
          style={{
            padding: "56px 32px", width: "100%", textAlign: "center",
            background: "linear-gradient(180deg, rgba(12, 16, 32, 0.9) 0%, rgba(7, 9, 20, 0.95) 100%)",
            border: "1px solid rgba(0, 242, 254, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ position: "relative", display: "flex", width: "8px", height: "8px" }}>
              <span className="ping-slow" style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "#00f2fe", opacity: 0.75 }} />
              <span style={{ position: "relative", width: "8px", height: "8px", borderRadius: "50%", background: "#00f2fe", boxShadow: "0 0 8px #00f2fe" }} />
            </span>
            <span style={{ fontSize: "1rem", fontWeight: 600, color: "#cbd5e1" }}>
              Available for immediate impact
            </span>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "36px", color: "#64748b" }}>
            <MapPin size={16} />
            <span style={{ fontSize: "0.95rem" }}>India · Remote-friendly</span>
          </div>
          
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "14px" }}>
            <a
              id="hire-me-btn"
              href={GMAIL_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
                background: "linear-gradient(135deg, #00f2fe 0%, #818cf8 100%)",
                color: "#060913",
                padding: "16px 36px", borderRadius: "12px",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem",
                textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 0 25px rgba(0, 242, 254, 0.35)"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Send size={16} />
              Launch Direct Email (Gmail)
            </a>

            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
                background: copied ? "rgba(52, 211, 153, 0.12)" : "rgba(255,255,255,0.03)",
                color: copied ? "#34d399" : "#cbd5e1",
                border: copied ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid rgba(255,255,255,0.1)",
                padding: "16px 24px", borderRadius: "12px",
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.95rem",
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                if (!copied) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied to Clipboard!" : "Copy Address"}
            </button>
          </div>
        </TiltCard>

        {/* Links Array with 3D Tilt */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {contacts.map(({ id, icon: Icon, label, value, href, isEmail }) => (
            <TiltCard
              key={id}
              maxTilt={6}
              glowColor="rgba(129, 140, 248, 0.2)"
              style={{
                display: "flex", alignItems: "center", gap: "20px", padding: "20px 28px",
                width: "100%", position: "relative",
                background: "rgba(10, 14, 28, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <a
                id={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "20px",
                  textDecoration: "none", flex: 1, minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "48px", height: "48px", borderRadius: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)"
                  }}
                >
                  <Icon size={20} style={{ color: "#818cf8" }} />
                </div>
                
                <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", marginBottom: "4px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {label}
                  </p>
                  <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "#f8fafc", fontFamily: "var(--font-display)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {value}
                  </p>
                </div>
              </a>

              {/* Action buttons on the right */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                {isEmail && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    title="Copy email to clipboard"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "8px 14px", borderRadius: "10px",
                      background: copied ? "rgba(52, 211, 153, 0.15)" : "rgba(255,255,255,0.04)",
                      border: copied ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid rgba(255,255,255,0.08)",
                      color: copied ? "#34d399" : "#94a3b8",
                      fontSize: "0.8rem", fontFamily: "var(--font-display)", fontWeight: 500,
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </button>
                )}

                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-arrow"
                  title="Open directly"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "rgba(129,140,248,0.08)",
                    border: "1px solid rgba(129,140,248,0.18)",
                    color: "#818cf8", textDecoration: "none",
                    opacity: 0.8, transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(129,140,248,0.18)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.background = "rgba(129,140,248,0.08)"; }}
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </TiltCard>
          ))}
        </div>

      </div>
    </section>
  );
}
