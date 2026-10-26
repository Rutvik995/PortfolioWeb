"use client";

import { useEffect, useRef } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  baseRadius: number;
  color: string;
  pulsePhase: number;
}

export default function Neural3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking for 3D rotation
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / width - 0.5) * 2;
      const normY = (e.clientY / height - 0.5) * 2;
      targetRotY = normX * 0.35;
      targetRotX = -normY * 0.25;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    // Optimized node count for 120fps hardware acceleration
    const NODE_COUNT = 36;
    const BOUNDS = 360;
    const nodes: Node3D[] = [];
    const colors = ["#818cf8", "#38bdf8", "#00f2fe", "#a78bfa", "#6366f1"];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * BOUNDS * 2,
        y: (Math.random() - 0.5) * BOUNDS * 2,
        z: (Math.random() - 0.5) * BOUNDS * 2,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.35,
        baseRadius: Math.random() * 2 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const FOV = 400;
    const CAMERA_Z = 500;
    const MAX_DIST = 160;
    const MAX_DIST_SQ = MAX_DIST * MAX_DIST;

    let time = 0;

    const render = () => {
      time += 0.012;

      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);
      const cosY = Math.cos(currentRotY + time * 0.06);
      const sinY = Math.sin(currentRotY + time * 0.06);

      ctx.clearRect(0, 0, width, height);

      interface ProjectedNode {
        x2d: number;
        y2d: number;
        scale: number;
        z: number;
        color: string;
        radius: number;
        rawNode: Node3D;
      }

      const projected: ProjectedNode[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        if (Math.abs(n.x) > BOUNDS) n.vx *= -1;
        if (Math.abs(n.y) > BOUNDS) n.vy *= -1;
        if (Math.abs(n.z) > BOUNDS) n.vz *= -1;

        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.z * cosY + n.x * sinY;

        const y2 = n.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + n.y * sinX;

        const depth = CAMERA_Z + z2;

        if (depth > 10) {
          const scale = FOV / depth;
          const x2d = width / 2 + x1 * scale;
          const y2d = height / 2 + y2 * scale;
          const pulse = Math.sin(time * 2 + n.pulsePhase) * 0.4 + 1;

          projected.push({
            x2d,
            y2d,
            scale,
            z: z2,
            color: n.color,
            radius: n.baseRadius * scale * pulse,
            rawNode: n,
          });
        }
      }

      // Fast distance check without Math.sqrt overhead
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          const dx = p1.rawNode.x - p2.rawNode.x;
          const dy = p1.rawNode.y - p2.rawNode.y;
          const dz = p1.rawNode.z - p2.rawNode.z;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < MAX_DIST_SQ) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / MAX_DIST) * 0.25;

            ctx.beginPath();
            ctx.moveTo(p1.x2d, p1.y2d);
            ctx.lineTo(p2.x2d, p2.y2d);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = Math.min(p1.scale, p2.scale) * 1.1;
            ctx.stroke();
          }
        }
      }

      // Render nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        if (p.x2d < -20 || p.x2d > width + 20 || p.y2d < -20 || p.y2d > height + 20) continue;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, Math.max(1, p.radius * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.55,
      }}
    />
  );
}
