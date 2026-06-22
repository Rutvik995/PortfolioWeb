"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Send, MapPin } from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import LinkedinIcon from "@/components/icons/LinkedinIcon";

const contacts = [
  {
    id: "email-link",
    icon: Mail,
    label: "Email",
    value: "rutvik.professional@gmail.com",
    href: "mailto:rutvik.professional@gmail.com",
  },
  {
    id: "github-link",
    icon: GithubIcon,
    label: "GitHub",
    value: "github.com/Rutvik995",
    href: "https://github.com/Rutvik995",
  },
  {
    id: "linkedin-link",
    icon: LinkedinIcon,
    label: "LinkedIn",
    value: "linkedin.com/in/rutvikbhanderi",
    href: "https://www.linkedin.com/in/rutvikbhanderi",
  },
];

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" style={{ position: "relative", padding: "160px 24px" }}>
      <div
        className="blob"
        style={{
          width: "400px", height: "400px", opacity: 0.05,
          background: "radial-gradient(circle, #818cf8, transparent 70%)",
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
            textTransform: "uppercase", color: "#818cf8", fontFamily: "var(--font-display)",
            marginBottom: "16px"
          }}
        >
          Contact
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
          Let&apos;s build something <span style={{ color: "#818cf8" }}>together.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.85, maxWidth: "600px", margin: "0 auto" }}
        >
          I&apos;m open to full-time roles, freelance projects, or just a good
          conversation about AI and data systems.
        </motion.p>
      </div>

      {/* Stacked Cards */}
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* CTA Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card"
          style={{ padding: "64px 32px", width: "100%", textAlign: "center" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ position: "relative", display: "flex", width: "8px", height: "8px" }}>
              <span className="ping-slow" style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "#34d399", opacity: 0.75 }} />
              <span style={{ position: "relative", width: "8px", height: "8px", borderRadius: "50%", background: "#34d399" }} />
            </span>
            <span style={{ fontSize: "1rem", fontWeight: 600, color: "#cbd5e1" }}>
              Available for opportunities
            </span>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "40px", color: "#64748b" }}>
            <MapPin size={16} />
            <span style={{ fontSize: "0.95rem" }}>India · Remote-friendly</span>
          </div>
          
          <a
            id="hire-me-btn"
            href="mailto:rutvik.professional@gmail.com"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
              background: "#818cf8", color: "#fff",
              padding: "16px 40px", borderRadius: "12px",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem",
              textDecoration: "none", transition: "opacity 0.2s, transform 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <Send size={16} />
            Send Me an Email
          </a>
        </motion.div>

        {/* Links Array */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {contacts.map(({ id, icon: Icon, label, value, href }, i) => (
            <motion.a
              key={id}
              id={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="glass-card"
              style={{
                display: "flex", alignItems: "center", gap: "24px", padding: "24px 32px",
                textDecoration: "none", transition: "background 0.2s, transform 0.2s, border-color 0.2s",
                width: "100%"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(6px)";
                e.currentTarget.style.borderColor = "rgba(129,140,248,0.3)";
                const arrow = e.currentTarget.querySelector('.contact-arrow') as HTMLElement;
                if (arrow) arrow.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                const arrow = e.currentTarget.querySelector('.contact-arrow') as HTMLElement;
                if (arrow) arrow.style.opacity = "0";
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
                <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "#f8fafc", fontFamily: "var(--font-display)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {value}
                </p>
              </div>

              <Send 
                size={18} 
                className="contact-arrow"
                style={{ marginLeft: "auto", color: "#818cf8", opacity: 0, transition: "opacity 0.2s" }} 
              />
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
