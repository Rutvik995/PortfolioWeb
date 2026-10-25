"use client";

import React, { useRef, useState } from "react";

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
  maxTilt = 10,
  glowColor = "rgba(129, 140, 248, 0.22)",
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;

    setRotX(-normY * maxTilt);
    setRotY(normX * maxTilt);
    setGlowPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotX(0);
    setRotY(0);
  };

  return (
    <div
      style={{
        perspective: "1100px",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`glass-card ${className}`}
        style={{
          transform: isHovered
            ? `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px) scale3d(1.015, 1.015, 1.015)`
            : "rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)",
          transition: isHovered ? "transform 0.08s ease-out, border-color 0.25s, box-shadow 0.25s" : "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
          position: "relative",
          overflow: "hidden",
          boxShadow: isHovered
            ? `0 16px 40px -12px rgba(0, 0, 0, 0.6), 0 0 24px 0 ${glowColor}`
            : "0 8px 30px rgba(0, 0, 0, 0.35)",
          borderColor: isHovered ? "rgba(129, 140, 248, 0.35)" : "var(--border)",
          ...style,
        }}
      >
        {/* Holographic Cursor Spotlight Glare */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            borderRadius: "inherit",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.3s ease",
            background: `radial-gradient(circle 280px at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 75%)`,
            mixBlendMode: "screen",
            zIndex: 1,
          }}
        />

        {/* Content elevated with 3D depth */}
        <div style={{ position: "relative", zIndex: 2, transform: "translateZ(10px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
