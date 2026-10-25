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
      targetRotY = normX * 0.45; // yaw
      targetRotX = -normY * 0.35; // pitch
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // Generate 3D nodes representing neurons in vector space
    const NODE_COUNT = 65;
    const BOUNDS = 380;
    const nodes: Node3D[] = [];
    const colors = ["#818cf8", "#38bdf8", "#00f2fe", "#a78bfa", "#6366f1"];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * BOUNDS * 2,
        y: (Math.random() - 0.5) * BOUNDS * 2,
        z: (Math.random() - 0.5) * BOUNDS * 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        baseRadius: Math.random() * 2.2 + 1.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // 3D camera projection settings
    const FOV = 420;
    const CAMERA_Z = 520;

    let time = 0;

    const render = () => {
      time += 0.015;

      // Smooth rotation dampening
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);
      const cosY = Math.cos(currentRotY + time * 0.08); // slow auto-drift
      const sinY = Math.sin(currentRotY + time * 0.08);

      ctx.clearRect(0, 0, width, height);

      // Project nodes to 2D screen coordinates
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

        // Update positions within bounding cube
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        if (Math.abs(n.x) > BOUNDS) n.vx *= -1;
        if (Math.abs(n.y) > BOUNDS) n.vy *= -1;
        if (Math.abs(n.z) > BOUNDS) n.vz *= -1;

        // Rotate around Y axis
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.z * cosY + n.x * sinY;

        // Rotate around X axis
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + n.y * sinX;

        // Distance from camera
        const depth = CAMERA_Z + z2;

        if (depth > 10) {
          const scale = FOV / depth;
          const x2d = width / 2 + x1 * scale;
          const y2d = height / 2 + y2 * scale;
          const pulse = Math.sin(time * 2 + n.pulsePhase) * 0.5 + 1;

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

      // Draw synaptic connection lines between nearby 3D nodes
      const MAX_DIST = 145;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          const dx = p1.rawNode.x - p2.rawNode.x;
          const dy = p1.rawNode.y - p2.rawNode.y;
          const dz = p1.rawNode.z - p2.rawNode.z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D < MAX_DIST) {
            const alpha = (1 - dist3D / MAX_DIST) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p1.x2d, p1.y2d);
            ctx.lineTo(p2.x2d, p2.y2d);

            // Gradient line between node colors
            const grad = ctx.createLinearGradient(p1.x2d, p1.y2d, p2.x2d, p2.y2d);
            grad.addColorStop(0, p1.color);
            grad.addColorStop(1, p2.color);

            ctx.strokeStyle = grad;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = Math.min(p1.scale, p2.scale) * 1.2;
            ctx.stroke();

            // Occasional pulsing synaptic signals traveling along line
            const signalPos = (time * 0.8 + (i + j) * 0.15) % 1;
            const sx = p1.x2d + (p2.x2d - p1.x2d) * signalPos;
            const sy = p1.y2d + (p2.y2d - p1.y2d) * signalPos;

            ctx.fillStyle = "#ffffff";
            ctx.globalAlpha = alpha * 1.8;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.2 * Math.min(p1.scale, p2.scale), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw projected nodes with 3D halos
      projected.sort((a, b) => b.z - a.z); // Render back-to-front

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        if (p.x2d < -50 || p.x2d > width + 50 || p.y2d < -50 || p.y2d > height + 50) continue;

        // Glow halo
        const haloGrad = ctx.createRadialGradient(p.x2d, p.y2d, 0, p.x2d, p.y2d, p.radius * 3.5);
        haloGrad.addColorStop(0, p.color);
        haloGrad.addColorStop(1, "transparent");

        ctx.fillStyle = haloGrad;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, p.radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Node center
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, Math.max(1, p.radius * 0.65), 0, Math.PI * 2);
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
        opacity: 0.65,
      }}
    />
  );
}
