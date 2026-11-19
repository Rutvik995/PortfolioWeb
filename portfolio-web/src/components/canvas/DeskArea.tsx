'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { portfolioConfig } from '@/config/portfolio.config';
import { CoffeeSteam } from './CoffeeSteam';
import { DeskLamp } from './DeskLamp';

const WALNUT_TOP    = '#261b14';
const WALNUT_EDGE   = '#1c130d';
const METAL_LEG     = '#111827';
const BRASS_ACCENT  = '#d4af37';
const ALU_MONITOR   = '#334155';
const KEYBOARD_BASE = '#0f172a';
const CHAIR_FRAME   = '#1e293b';
const CHAIR_MESH    = '#090d16';

/**
 * DeskArea
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete Workstation:
 *  - L-shaped dark walnut corner desk with under-desk drawer unit
 *  - Dual PC monitors with live syntax-highlighted code scrolling & architecture graph
 *  - Open laptop with glowing emissive screen
 *  - Mechanical keyboard with animated RGB underglow, mouse, and mousepad
 *  - Coffee mug with continuous rising wavy steam
 *  - Articulated brass desk lamp with warm 2800K light cone
 *  - Ergonomic office chair + robot vacuum on floor + routed cables
 */
export function DeskArea({
  onObjectClick,
}: {
  onObjectClick?: (objectName: string) => void;
}) {
  const codeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const codeTexRef = useRef<THREE.CanvasTexture | null>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const graphTexRef = useRef<THREE.CanvasTexture | null>(null);
  const rgbLightRef = useRef<THREE.PointLight>(null);

  // 1. Primary Monitor Live Scrolling Code Texture
  const { codeTexture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d')!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    codeCanvasRef.current = canvas;
    codeTexRef.current = tex;
    return { codeTexture: tex };
  }, []);

  // 2. Secondary Monitor Live Architecture Graph Texture
  const { graphTexture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 576;
    const ctx = canvas.getContext('2d')!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    graphCanvasRef.current = canvas;
    graphTexRef.current = tex;
    return { graphTexture: tex };
  }, []);

  // Graph nodes
  const graphNodes = useMemo(
    () => [
      { x: 0.50, y: 0.16, label: 'Core API' },
      { x: 0.22, y: 0.44, label: 'Planner' },
      { x: 0.78, y: 0.44, label: 'Vector DB' },
      { x: 0.18, y: 0.76, label: 'Postgres' },
      { x: 0.50, y: 0.76, label: 'Neural RAG' },
      { x: 0.82, y: 0.76, label: 'Verification' },
    ],
    []
  );

  const graphEdges = useMemo(
    () => [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 4],
      [2, 5],
      [4, 5],
    ],
    []
  );

  // 60 FPS live rendering for screens and RGB keyboard cycle
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // ── Update Code Screen ──
    const codeCanvas = codeCanvasRef.current;
    if (codeCanvas) {
      const ctx = codeCanvas.getContext('2d')!;
      const w = codeCanvas.width;
      const h = codeCanvas.height;

      // Dark editor background
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, w, h);

      // Window tab bar
      ctx.fillStyle = '#111b2e';
      ctx.fillRect(0, 0, w, 44);

      // Window control buttons
      const dots = ['#ef4444', '#f59e0b', '#10b981'];
      dots.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(24 + i * 22, 22, 6.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Filename tab
      ctx.font = '600 17px ui-monospace, Menlo, monospace';
      ctx.fillStyle = '#93c5fd';
      ctx.fillText(portfolioConfig.screenCode.filename, 105, 28);

      // Line number column
      ctx.fillStyle = '#0c1322';
      ctx.fillRect(0, 44, 56, h - 44);

      // Syntax highlighted lines
      ctx.font = '19px ui-monospace, Menlo, monospace';
      const lines = portfolioConfig.screenCode.lines;
      const totalChars = lines.reduce(
        (acc, l) => acc + l.tokens.reduce((s, tok) => s + tok.text.length, 0),
        0
      );
      const charsToReveal = Math.floor(t * 20) % (totalChars + 60);

      let charsUsed = 0;
      let cursorX = 72;
      let cursorY = 82;

      for (let li = 0; li < lines.length; li++) {
        const y = 82 + li * 34;

        // Line number
        ctx.fillStyle = '#334155';
        ctx.fillText(String(li + 1).padStart(2, ' '), 16, y);

        let x = 72;
        cursorX = x;
        cursorY = y;

        for (const token of lines[li].tokens) {
          const remaining = charsToReveal - charsUsed;
          if (remaining <= 0) break;

          const slice = token.text.slice(0, Math.min(token.text.length, remaining));
          ctx.fillStyle = token.color;
          ctx.fillText(slice, x, y);

          x += ctx.measureText(slice).width;
          charsUsed += token.text.length;
          cursorX = x;
        }

        if (charsToReveal - charsUsed <= 0 && charsUsed >= charsToReveal) break;
      }

      // Blinking cursor
      if (Math.floor(t * 2.5) % 2 === 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cursorX + 2, cursorY - 18, 9, 23);
      }

      if (codeTexRef.current) codeTexRef.current.needsUpdate = true;
    }

    // ── Update Architecture Graph Screen ──
    const graphCanvas = graphCanvasRef.current;
    if (graphCanvas) {
      const ctx = graphCanvas.getContext('2d')!;
      const w = graphCanvas.width;
      const h = graphCanvas.height;

      ctx.fillStyle = '#070c18';
      ctx.fillRect(0, 0, w, h);

      // Header
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, 40);
      ctx.font = '600 15px ui-sans-serif, system-ui';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('LIVE NEURAL ARCHITECTURE PIPELINE', 20, 26);

      const px = (node: { x: number; y: number }) => [
        node.x * (w - 120) + 60,
        node.y * (h - 90) + 55,
      ];

      // Draw Edges
      graphEdges.forEach(([a, b], idx) => {
        const [ax, ay] = px(graphNodes[a]);
        const [bx, by] = px(graphNodes[b]);

        ctx.strokeStyle = '#1e385c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // Traveling pulse particle
        const k = (t * 0.45 + idx * 0.2) % 1;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(ax + (bx - ax) * k, ay + (by - ay) * k, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Nodes
      graphNodes.forEach((node, i) => {
        const [x, y] = px(node);
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + i);

        ctx.fillStyle = '#0f1d33';
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + 0.5 * pulse})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(x - 50, y - 18, 100, 36, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = '600 14px ui-sans-serif, system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f0f9ff';
        ctx.fillText(node.label, x, y + 5);
      });
      ctx.textAlign = 'start';

      if (graphTexRef.current) graphTexRef.current.needsUpdate = true;
    }

    // ── RGB Underglow Cycle ──
    if (rgbLightRef.current) {
      const hue = (t * 0.15) % 1;
      rgbLightRef.current.color.setHSL(hue, 0.95, 0.55);
    }
  });

  // Hanging cables geometry
  const cables = useMemo(() => {
    const curves = [
      [[-0.1, 0.68, 0.65], [-0.08, 0.40, 0.72], [-0.05, 0.15, 0.85]],
      [[0.45, 0.68, 0.60], [0.42, 0.38, 0.70], [0.38, 0.15, 0.85]],
    ];
    return curves.map((pts) => {
      const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
      return new THREE.TubeGeometry(c, 16, 0.005, 6, false);
    });
  }, []);

  return (
    <group position={[-0.30, 0.0, 0.15]} rotation={[0, -Math.PI / 2 + 0.12, 0]}>
      {/* ═════════════════════ L-SHAPED CORNER DESK ═════════════════════ */}
      {/* Primary Desk Top (facing developer) */}
      <mesh position={[0, 0.72, 0.65]} castShadow receiveShadow>
        <boxGeometry args={[1.90, 0.045, 0.92]} />
        <meshStandardMaterial color={WALNUT_TOP} roughness={0.65} />
      </mesh>
      {/* Primary Desk Chamfer Edge */}
      <mesh position={[0, 0.71, 0.18]}>
        <boxGeometry args={[1.90, 0.02, 0.02]} />
        <meshStandardMaterial color={WALNUT_EDGE} roughness={0.7} />
      </mesh>

      {/* L-Wing Return Top (Left Side Extension) */}
      <mesh position={[-0.86, 0.72, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.045, 0.85]} />
        <meshStandardMaterial color={WALNUT_TOP} roughness={0.65} />
      </mesh>

      {/* Modern Black Steel Desk Legs */}
      {/* Left Front Leg */}
      <mesh position={[-0.88, 0.36, 0.98]} castShadow>
        <boxGeometry args={[0.045, 0.72, 0.045]} />
        <meshStandardMaterial color={METAL_LEG} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Left Rear Leg */}
      <mesh position={[-0.88, 0.36, -0.32]} castShadow>
        <boxGeometry args={[0.045, 0.72, 0.045]} />
        <meshStandardMaterial color={METAL_LEG} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Right Front Leg */}
      <mesh position={[0.88, 0.36, 0.98]} castShadow>
        <boxGeometry args={[0.045, 0.72, 0.045]} />
        <meshStandardMaterial color={METAL_LEG} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Right Rear Leg */}
      <mesh position={[0.88, 0.36, 0.22]} castShadow>
        <boxGeometry args={[0.045, 0.72, 0.045]} />
        <meshStandardMaterial color={METAL_LEG} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Under-Desk 3-Drawer Pedestal (Right Side) */}
      <group position={[0.64, 0.38, 0.65]}>
        {/* Drawer Casing */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.62, 0.78]} />
          <meshStandardMaterial color="#1f140e" roughness={0.7} />
        </mesh>
        {/* 3 Drawers with Brass Handles */}
        {[-0.18, 0.0, 0.18].map((dy, i) => (
          <group key={i} position={[0, dy, -0.395]}>
            <mesh castShadow>
              <boxGeometry args={[0.39, 0.17, 0.02]} />
              <meshStandardMaterial color={WALNUT_TOP} roughness={0.65} />
            </mesh>
            <mesh position={[0, 0, -0.015]} castShadow>
              <boxGeometry args={[0.12, 0.014, 0.018]} />
              <meshStandardMaterial color={BRASS_ACCENT} metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ═════════════════════ DUAL SCREENS SETUP ═════════════════════ */}
      {/* Primary 32" Widescreen Code Monitor */}
      <group
        position={[0.05, 0.745, 0.96]}
        rotation={[0, 0.08, 0]}
        onClick={() => onObjectClick && onObjectClick('projects')}
      >
        {/* Monitor Base & Arm */}
        <mesh position={[0, 0.008, 0]} castShadow>
          <boxGeometry args={[0.24, 0.016, 0.18]} />
          <meshStandardMaterial color={ALU_MONITOR} metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.22, 0.04]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.42, 16]} />
          <meshStandardMaterial color={ALU_MONITOR} metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Monitor Bezel */}
        <group position={[0, 0.44, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.82, 0.50, 0.025]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Active Emissive Code Display */}
          <mesh position={[0, 0, -0.014]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.79, 0.47]} />
            <meshStandardMaterial
              map={codeTexture}
              emissive="#38bdf8"
              emissiveMap={codeTexture}
              emissiveIntensity={1.3}
              roughness={0.2}
            />
          </mesh>
          {/* Soft Monitor Key Light Illuminating Face & Hands */}
          <pointLight
            position={[0, 0, -0.35]}
            color="#38bdf8"
            intensity={1.8}
            distance={1.6}
            decay={2}
          />
        </group>
      </group>

      {/* Secondary 27" Architecture Graph Monitor (Angled on Right) */}
      <group
        position={[0.72, 0.745, 0.88]}
        rotation={[0, 0.52, 0]}
        onClick={() => onObjectClick && onObjectClick('about')}
      >
        <mesh position={[0, 0.008, 0]} castShadow>
          <boxGeometry args={[0.20, 0.016, 0.16]} />
          <meshStandardMaterial color={ALU_MONITOR} metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.20, 0.04]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.38, 16]} />
          <meshStandardMaterial color={ALU_MONITOR} metalness={0.8} roughness={0.25} />
        </mesh>

        <group position={[0, 0.40, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.62, 0.44, 0.025]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, -0.014]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.59, 0.41]} />
            <meshStandardMaterial
              map={graphTexture}
              emissive="#38bdf8"
              emissiveMap={graphTexture}
              emissiveIntensity={1.1}
              roughness={0.2}
            />
          </mesh>
        </group>
      </group>

      {/* ═════════════════════ SLIM LAPTOP BESIDE MONITOR ═════════════════════ */}
      <group
        position={[-0.62, 0.745, 0.65]}
        rotation={[0, -0.38, 0]}
        onClick={() => onObjectClick && onObjectClick('contact')}
      >
        {/* Laptop Base */}
        <mesh position={[0, 0.005, 0]} castShadow>
          <boxGeometry args={[0.34, 0.010, 0.24]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Trackpad */}
        <mesh position={[0, 0.011, -0.05]}>
          <planeGeometry args={[0.11, 0.07]} />
          <meshStandardMaterial color="#475569" roughness={0.3} />
        </mesh>
        {/* Laptop Keyboard Area */}
        <mesh position={[0, 0.011, 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.29, 0.12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>

        {/* Tilted Laptop Screen Lid */}
        <group position={[0, 0.010, 0.115]} rotation={[-0.32, 0, 0]}>
          <mesh position={[0, 0.11, 0]} castShadow>
            <boxGeometry args={[0.34, 0.22, 0.008]} />
            <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Glowing Laptop Display */}
          <mesh position={[0, 0.11, -0.005]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.32, 0.20]} />
            <meshStandardMaterial
              color="#0d1b2a"
              emissive="#38bdf8"
              emissiveIntensity={0.65}
              roughness={0.2}
            />
          </mesh>
        </group>
      </group>

      {/* ═════════════════════ MECHANICAL KEYBOARD & MOUSE ═════════════════════ */}
      {/* Stitched Desk Mat / Mousepad */}
      <mesh position={[0, 0.744, 0.44]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.92, 0.38]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.92} />
      </mesh>

      {/* Mechanical Keyboard Base */}
      <group position={[0, 0.748, 0.44]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.44, 0.018, 0.15]} />
          <meshStandardMaterial color={KEYBOARD_BASE} roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Keycaps Array Slab */}
        <mesh position={[0, 0.012, 0]} castShadow>
          <boxGeometry args={[0.41, 0.010, 0.12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {/* Accent Spacebar */}
        <mesh position={[0.01, 0.018, 0.042]} castShadow>
          <boxGeometry args={[0.16, 0.008, 0.024]} />
          <meshStandardMaterial color="#0284c7" roughness={0.5} />
        </mesh>
        {/* Animated RGB Underglow Light */}
        <pointLight
          ref={rgbLightRef}
          position={[0, -0.01, 0]}
          intensity={0.45}
          distance={0.35}
          decay={2}
        />
      </group>

      {/* Ergonomic Wireless Mouse */}
      <group position={[0.32, 0.752, 0.44]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.024, 0.055, 12, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Glowing Scroll Wheel */}
        <mesh position={[0, 0.022, 0.015]}>
          <cylinderGeometry args={[0.006, 0.006, 0.012, 12]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* ═════════════════════ COFFEE STEAM & DESK LAMP ═════════════════════ */}
      {/* Hot Coffee Beside Laptop */}
      <CoffeeSteam position={[-0.38, 0.745, 0.48]} />

      {/* Articulated Brass Desk Lamp */}
      <DeskLamp position={[-0.66, 0.745, 0.90]} rotation={[0, Math.PI * 0.92, 0]} />

      {/* ═════════════════════ ERGONOMIC OFFICE CHAIR ═════════════════════ */}
      <group position={[0, 0, 0.02]}>
        {/* Star Base & 5 Casters */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.028, 0.035, 0.22, 16]} />
          <meshStandardMaterial color={CHAIR_FRAME} metalness={0.8} roughness={0.2} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh position={[0, 0.06, 0.15]} castShadow>
                <boxGeometry args={[0.035, 0.02, 0.28]} />
                <meshStandardMaterial color={CHAIR_FRAME} metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.025, 0.27]} castShadow>
                <sphereGeometry args={[0.025, 12, 10]} />
                <meshStandardMaterial color="#0f172a" roughness={0.6} />
              </mesh>
            </group>
          );
        })}

        {/* Seat Cushion */}
        <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.09, 0.46]} />
          <meshStandardMaterial color={CHAIR_MESH} roughness={0.85} />
        </mesh>

        {/* Contoured Mesh Backrest with Lumbar Spine */}
        <group position={[0, 0.76, -0.22]} rotation={[-0.08, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.44, 0.58, 0.04]} />
            <meshStandardMaterial color={CHAIR_MESH} roughness={0.8} />
          </mesh>
          {/* Chrome Spine Support */}
          <mesh position={[0, -0.05, -0.025]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.52, 12]} />
            <meshStandardMaterial color={CHAIR_FRAME} metalness={0.9} roughness={0.15} />
          </mesh>
        </group>

        {/* Adjustable Armrests */}
        {[-0.26, 0.26].map((x, i) => (
          <group key={i} position={[x, 0.58, -0.02]}>
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.24, 12]} />
              <meshStandardMaterial color={CHAIR_FRAME} metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.12, 0.03]} castShadow>
              <boxGeometry args={[0.065, 0.022, 0.22]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ═════════════════════ ROBOT VACUUM (ROOMBA) ON FLOOR ═════════════════════ */}
      <group position={[-0.82, 0.038, 1.45]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.075, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Top Trim Ring */}
        <mesh position={[0, 0.038, 0]}>
          <torusGeometry args={[0.14, 0.008, 10, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Status LED Glow */}
        <mesh position={[0, 0.040, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.014, 16]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </group>

      {/* Draped Realistic Cables */}
      {cables.map((geo, idx) => (
        <mesh key={idx} geometry={geo} castShadow>
          <meshStandardMaterial color="#090d14" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
