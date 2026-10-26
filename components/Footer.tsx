"use client";

import { Mail } from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import LinkedinIcon from "@/components/icons/LinkedinIcon";

const footerSocials = [
  {
    name: "GitHub",
    href: "https://github.com/Rutvik995",
    icon: GithubIcon,
    color: "#818cf8",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/rutvikbhanderi",
    icon: LinkedinIcon,
    color: "#38bdf8",
  },
  {
    name: "Email",
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=rutvik.professional@gmail.com",
    icon: Mail,
    color: "#00f2fe",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="py-12 px-6 text-center" style={{ borderTop: "1px solid var(--border)", position: "relative" }}>
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">

        {/* Top row: Brand and Nav Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--accent-dim)", border: "1px solid rgba(129,140,248,0.2)",
                color: "var(--accent)", fontFamily: "var(--font-display)" }}>
              R
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--text-1)", fontFamily: "var(--font-display)" }}>
              Rutvik Bhanderi
            </span>
          </div>

          <div className="flex gap-6">
            {["About", "Architecture", "Projects", "Skills", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs transition-colors"
                style={{ color: "var(--text-2)", fontFamily: "var(--font-display)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Middle row: Social Links */}
        <div className="flex items-center gap-4">
          {footerSocials.map(({ name, href, icon: Icon, color }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "var(--text-2)",
                fontSize: "0.8rem",
                fontFamily: "var(--font-display)",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.07)";
                e.currentTarget.style.color = color;
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                e.currentTarget.style.color = "var(--text-2)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Icon size={15} />
              <span>{name}</span>
            </a>
          ))}
        </div>

        {/* Standard copyright */}
        <p style={{ color: "var(--text-3)", fontSize: "0.85rem", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto" }}>
          &copy; {year} Rutvik Bhanderi. Built for AI/ML Engineering & Agentic Architectures.
        </p>
      </div>
    </footer>
  );
}
