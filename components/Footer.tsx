"use client";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="py-10 px-6 text-center" style={{ borderTop: "1px solid var(--border)", position: "relative" }}>
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">

        {/* Top row: Brand and Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--accent-dim)", border: "1px solid rgba(129,140,248,0.2)",
                color: "var(--accent)", fontFamily: "var(--font-display)" }}>
              R
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}>
              Rutvik Bhanderi
            </span>
          </div>

          <div className="flex gap-5">
            {["About", "Projects", "Skills", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs transition-colors"
                style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Funny copyright */}
        <p style={{ color: "var(--text-3)", fontSize: "0.85rem", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto" }}>
          &copy; {year} Rutvik Bhanderi. All rights reserved, except my sleep schedule, which I gave up for this project.
        </p>

        {/* Tiny Easter Egg */}
        <p style={{ color: "#475569", fontSize: "0.65rem", marginTop: "16px", fontStyle: "italic" }}>
          If you read this far, you deserve a cookie 🍪 (not a real one, sorry, this is a website)
        </p>
      </div>
    </footer>
  );
}
