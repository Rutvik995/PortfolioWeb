"use client";

import React, { useRef, useCallback } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  glowColor?: string;
}

export default function TiltCard({
  children,
  className = "",
  style = {},
  maxTilt = 8,
  glowColor = "rgba(129, 140, 248, 0.22)",
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width - 0.5) * 2;
      const normY = (y / rect.height - 0.5) * 2;

      const rotX = -normY * maxTilt;
      const rotY = normX * maxTilt;
      const glowX = (x / rect.width) * 100;
      const glowY = (y / rect.height) * 100;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-3px) scale3d(1.01, 1.01, 1.01)`;
        if (glareRef.current) {
          glareRef.current.style.opacity = "1";
          glareRef.current.style.background = `radial-gradient(circle 260px at ${glowX.toFixed(1)}% ${glowY.toFixed(1)}%, ${glowColor}, transparent 70%)`;
        }
      });
    },
    [maxTilt, glowColor]
  );

  const handleMouseEnter = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = "transform 0.08s ease-out, border-color 0.2s, box-shadow 0.2s";
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s";
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)";
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
  }, []);

  // Decompose style to avoid mixing shorthand 'border' with 'borderColor' in React 19
  const { border, borderColor: customBorderColor, borderWidth, borderStyle, ...restStyle } = style;

  let baseBorderColor = "var(--border)";
  if (border && typeof border === "string") {
    const parts = border.split(" ");
    if (parts.length >= 3) {
      baseBorderColor = parts.slice(2).join(" ");
    }
  } else if (customBorderColor) {
    baseBorderColor = customBorderColor as string;
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`glass-card ${className}`}
      style={{
        transformStyle: "preserve-3d",
        position: "relative",
        overflow: "hidden",
        borderWidth: (borderWidth as string) || "1px",
        borderStyle: (borderStyle as string) || "solid",
        borderColor: baseBorderColor,
        willChange: "transform",
        ...restStyle,
      }}
    >
      {/* Holographic Cursor Spotlight Glare (Updated via direct DOM, zero React re-renders) */}
      <div
        ref={glareRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          borderRadius: "inherit",
          opacity: 0,
          transition: "opacity 0.25s ease",
          mixBlendMode: "screen",
          zIndex: 1,
        }}
      />

      {/* Content wrapper with display: contents so it never breaks flex/grid layouts */}
      <div style={{ display: "contents", position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
