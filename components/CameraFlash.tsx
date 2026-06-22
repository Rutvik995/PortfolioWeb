"use client";

import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export default function CameraFlash() {
  // We use "init" so SSR matches client on first render
  const [phase, setPhase] = useState("init");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Check if the user has already passed the sequence in this session
    if (sessionStorage.getItem("entrySequenceDone")) {
      setPhase("done");
      return;
    }

    setPhase("captcha");
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
  }, []);

  const handleVerify = () => {
    if (!checked) return;
    
    // Transition to the camera flash sequence
    setPhase("smile");

    const t1 = setTimeout(() => setPhase("flash"), 1500); // 1.5s to read "Say cheese"
    const t2 = setTimeout(() => setPhase("joke1"), 1650); // Flash ends, first joke
    const t3 = setTimeout(() => setPhase("joke2"), 3850); // 2.2s to read "Just joking I didn't..."
    const t4 = setTimeout(() => setPhase("joke3"), 5050); // 1.2s to read "...unless?"
    const t5 = setTimeout(() => setPhase("fade"), 7550);  // 2.5s to read "Nah I really didn't. Welcome..."
    const t6 = setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
      sessionStorage.setItem("entrySequenceDone", "true");
    }, 8550); // Total sequence: 8.5 seconds
  };

  if (phase === "init" || phase === "done") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 999999, // Way above everything else
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: phase === "flash" ? "#ffffff" : "#0c0c10",
        opacity: phase === "fade" ? 0 : 1,
        transition: phase === "flash" 
          ? "background 0.05s ease-out" 
          : "background 0.6s ease-out, opacity 1s ease-in-out",
        pointerEvents: phase === "fade" ? "none" : "auto",
        padding: "20px"
      }}
    >
      {/* CAPTCHA Phase */}
      {phase === "captcha" && (
        <div 
          className="glass-card animate-fade-up"
          style={{
            padding: "40px",
            maxWidth: "450px",
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", color: "#f8fafc", fontSize: "1.5rem", fontWeight: 700 }}>
              SECURITY CHECK
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
              PROVE YOU&apos;RE NOT A RECRUITER BOT.
            </p>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              cursor: "pointer",
              textAlign: "left"
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              style={{
                marginTop: "4px",
                width: "18px",
                height: "18px",
                cursor: "pointer",
                accentColor: "#818cf8"
              }}
            />
            <span style={{ color: "#e2e8f0", fontSize: "0.9rem", lineHeight: 1.5 }}>
              I PROMISE TO ACTUALLY READ THIS PORTFOLIO AND NOT JUST SCAN FOR KEYWORDS.
            </span>
          </label>

          <button
            onClick={handleVerify}
            disabled={!checked}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              background: checked ? "#818cf8" : "rgba(129,140,248,0.2)",
              color: checked ? "#fff" : "rgba(255,255,255,0.4)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "1rem",
              border: "none",
              cursor: checked ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {checked && <CheckCircle2 size={18} />}
            VERIFY
          </button>
        </div>
      )}

      {/* "Say Cheese" Text */}
      <div
        style={{
          opacity: phase === "smile" ? 1 : 0,
          transition: "opacity 0.3s",
          position: "absolute",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.5rem, 5vw, 3rem)",
          color: "#f8fafc",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          pointerEvents: "none",
          textTransform: "uppercase"
        }}
      >
        Say cheeeezzee... 📸
      </div>

      {/* Joke Sequence */}
      <div
        style={{
          opacity: phase === "joke1" ? 1 : 0,
          transition: "opacity 0.8s",
          position: "absolute",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1rem, 3vw, 1.25rem)",
          color: "#818cf8",
          fontWeight: 600,
          textAlign: "center",
          padding: "0 20px",
          pointerEvents: "none",
          textTransform: "uppercase"
        }}
      >
        (Just joking I didn&apos;t take your picture!)
      </div>

      <div
        style={{
          opacity: phase === "joke2" ? 1 : 0,
          transition: "opacity 0.8s",
          position: "absolute",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.5rem, 4vw, 2rem)",
          color: "#f1f5f9",
          fontWeight: 700,
          textAlign: "center",
          padding: "0 20px",
          pointerEvents: "none",
          textTransform: "uppercase"
        }}
      >
        ...unless? 🤨
      </div>

      <div
        style={{
          opacity: phase === "joke3" ? 1 : 0,
          transition: "opacity 0.8s",
          position: "absolute",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1rem, 3vw, 1.25rem)",
          color: "#34d399",
          fontWeight: 600,
          textAlign: "center",
          padding: "0 20px",
          pointerEvents: "none",
          textTransform: "uppercase"
        }}
      >
        (Nah I really didn&apos;t. Welcome to my portfolio!)
      </div>
    </div>
  );
}
