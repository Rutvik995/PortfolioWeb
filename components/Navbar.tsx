"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "About",    href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills",   href: "#skills" },
  { label: "Contact",  href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive]         = useState("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { threshold: 0.35 }
    );
    document.querySelectorAll("section[id]").forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const navStyle: React.CSSProperties = {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
    transition: "background .3s, border-color .3s",
    background: scrolled ? "rgba(12,12,16,0.85)" : "transparent",
    backdropFilter: scrolled ? "blur(20px)" : "none",
    WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
    borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
  };

  return (
    <>
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={navStyle}
      >
        <div
          style={{
            maxWidth: "1100px", margin: "0 auto",
            padding: "0 32px", height: "68px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          {/* ── Full name — left ─────────────────────── */}
          <a
            href="#hero"
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              textDecoration: "none", flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: "1rem", color: "#f1f5f9", letterSpacing: "-0.01em",
              }}
            >
              Rutvik Bhanderi
            </span>
          </a>

          {/* ── Nav tabs — center ─────────────────────── */}
          <div
            className="hidden md:flex"
            style={{
              alignItems: "center", gap: "4px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "5px",
            }}
          >
            {navLinks.map((link) => {
              const isActive = active === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  style={{
                    position: "relative",
                    display: "inline-block",
                    padding: "7px 18px",
                    borderRadius: "10px",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    fontFamily: "var(--font-display)",
                    color: isActive ? "#f1f5f9" : "#64748b",
                    background: isActive ? "rgba(129,140,248,0.12)" : "transparent",
                    border: isActive ? "1px solid rgba(129,140,248,0.2)" : "1px solid transparent",
                    textDecoration: "none",
                    transition: "color .2s, background .2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#94a3b8";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#64748b";
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* ── Hire Me — right ──────────────────────── */}
          <div className="hidden md:flex">
            <a
              href="mailto:rutvik.professional@gmail.com"
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "9px 22px", borderRadius: "11px",
                background: "rgba(129,140,248,0.1)",
                border: "1px solid rgba(129,140,248,0.25)",
                color: "#a5b4fc",
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.82rem",
                textDecoration: "none",
                transition: "background .2s, border-color .2s, color .2s, transform .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(129,140,248,0.18)";
                e.currentTarget.style.color = "#c7d2fe";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(129,140,248,0.1)";
                e.currentTarget.style.color = "#a5b4fc";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Hire Me
            </a>
          </div>

          {/* ── Mobile toggle ───────────────────────── */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              padding: "8px", borderRadius: "10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#64748b", cursor: "none",
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile drawer ──────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: "fixed", top: "76px", left: "16px", right: "16px", zIndex: 40,
              background: "rgba(12,12,16,0.97)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px", padding: "12px",
              backdropFilter: "blur(24px)",
            }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block", padding: "12px 16px",
                  borderRadius: "10px", fontSize: "0.875rem", fontWeight: 500,
                  fontFamily: "var(--font-display)", color: "#64748b", textDecoration: "none",
                  transition: "color .2s, background .2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#f1f5f9"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}
              >
                {link.label}
              </a>
            ))}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "8px", paddingTop: "10px" }}>
              <a
                href="mailto:rutvik.professional@gmail.com"
                style={{
                  display: "block", textAlign: "center", padding: "11px",
                  background: "#818cf8", borderRadius: "10px",
                  color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                Hire Me
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
