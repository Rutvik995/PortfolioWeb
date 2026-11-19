'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { portfolioConfig } from '@/config/portfolio.config';

/**
 * WorkWall
 * ─────────────────────────────────────────────────────────────────────────────
 * Back-Right Wall features:
 *  - Real-Time Wall Clock driven smoothly by visitor's new Date()
 *  - Motivational Quote Poster with dynamic HTML Canvas typography
 *  - Multi-tier Bookshelf with colorful books, succulent plant, mini trophy
 *  - Draped realistic cables beneath lower shelf
 */

/* ── 1. Real-Time Visitor Clock ── */
function RealTimeClock({ position }: { position: [number, number, number] }) {
  const hourRef = useRef<THREE.Group>(null);
  const minRef = useRef<THREE.Group>(null);
  const secRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const now = new Date();
    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    const TAU = Math.PI * 2;
    if (secRef.current) secRef.current.rotation.z = -(s / 60) * TAU;
    if (minRef.current) minRef.current.rotation.z = -(m / 60) * TAU;
    if (hourRef.current) hourRef.current.rotation.z = -(h / 12) * TAU;
  });

  // Dial hour ticks
  const ticks = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const isMajor = i % 3 === 0;
      return {
        x: Math.sin(angle) * 0.17,
        y: Math.cos(angle) * 0.17,
        rot: -angle,
        isMajor,
      };
    });
  }, []);

  return (
    <group position={position} rotation={[0, 0, 0]}>
      {/* Outer Rim */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.035, 48]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Clock Face Bezel */}
      <mesh position={[0, 0, 0.016]}>
        <cylinderGeometry args={[0.205, 0.205, 0.01, 48]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>

      {/* Hour Markers */}
      {ticks.map((t, idx) => (
        <mesh
          key={idx}
          position={[t.x, t.y, 0.022]}
          rotation={[0, 0, t.rot]}
        >
          <boxGeometry args={[t.isMajor ? 0.012 : 0.007, t.isMajor ? 0.028 : 0.018, 0.004]} />
          <meshStandardMaterial color={t.isMajor ? '#f8fafc' : '#94a3b8'} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Center Pivot Pin */}
      <mesh position={[0, 0, 0.026]}>
        <cylinderGeometry args={[0.012, 0.012, 0.01, 24]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Hour Hand */}
      <group ref={hourRef} position={[0, 0, 0.024]}>
        <mesh position={[0, 0.052, 0]} castShadow>
          <boxGeometry args={[0.010, 0.104, 0.004]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
      </group>

      {/* Minute Hand */}
      <group ref={minRef} position={[0, 0, 0.025]}>
        <mesh position={[0, 0.075, 0]} castShadow>
          <boxGeometry args={[0.007, 0.150, 0.004]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.2} />
        </mesh>
      </group>

      {/* Second Hand (Smooth Red Needle) */}
      <group ref={secRef} position={[0, 0, 0.027]}>
        <mesh position={[0, 0.082, 0]}>
          <boxGeometry args={[0.0035, 0.185, 0.003]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} />
        </mesh>
        {/* Tail counterweight */}
        <mesh position={[0, -0.035, 0]}>
          <boxGeometry args={[0.006, 0.040, 0.003]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} />
        </mesh>
      </group>

      {/* Clock Protective Convex Glass */}
      <mesh position={[0, 0, 0.030]}>
        <circleGeometry args={[0.20, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          roughness={0.05}
          metalness={0.1}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}

/* ── 2. Motivational Quote Poster ── */
function QuotePoster({ position }: { position: [number, number, number] }) {
  const quoteTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Matte dark poster backdrop
      ctx.fillStyle = '#0a101f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gold architectural inner border
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 10;
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

      // Subtle decorative corner marks
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);

      // Header label
      ctx.font = '600 36px -apple-system, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '8px';
      ctx.fillText(portfolioConfig.quotePoster.subtext.toUpperCase(), canvas.width / 2, 220);

      // Decorative divider
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(canvas.width / 2 - 80, 270, 160, 4);

      // Main Quote (word wrapped)
      ctx.font = 'italic 700 72px Georgia, serif';
      ctx.fillStyle = '#f8fafc';
      const quote = `"${portfolioConfig.quotePoster.quote}"`;

      // Word wrapping logic
      const words = quote.split(' ');
      let line = '';
      let y = 620;
      const maxWidth = canvas.width - 240;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[i] + ' ';
          y += 105;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);

      // Author signature
      ctx.font = '600 46px -apple-system, system-ui, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`— ${portfolioConfig.quotePoster.author}`, canvas.width / 2, y + 140);

      // Bottom glyph
      ctx.font = '32px sans-serif';
      ctx.fillStyle = 'rgba(212, 175, 55, 0.7)';
      ctx.fillText('✦   ENGINEERED WITH RIGOR   ✦', canvas.width / 2, canvas.height - 130);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);

  return (
    <group position={position}>
      {/* Sleek Beveled Frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.78, 1.05, 0.035]} />
        <meshStandardMaterial color="#1e2230" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Frame Gold Inner Lip */}
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[0.73, 1.00, 0.015]} />
        <meshStandardMaterial color="#d4af37" roughness={0.35} metalness={0.7} />
      </mesh>

      {/* Poster Canvas Print */}
      <mesh position={[0, 0, 0.019]}>
        <planeGeometry args={[0.70, 0.97]} />
        <meshStandardMaterial map={quoteTexture} roughness={0.85} />
      </mesh>

      {/* Protective Glazing */}
      <mesh position={[0, 0, 0.021]}>
        <planeGeometry args={[0.70, 0.97]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          roughness={0.08}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

/* ── 3. Bookshelf with Books, Plant, and Trophy ── */
function FloatingShelvesWithDecor() {
  const booksUpper = useMemo(
    () => [
      { w: 0.055, h: 0.22, col: '#ef4444', title: 'ML' },
      { w: 0.048, h: 0.19, col: '#3b82f6', title: 'TS' },
      { w: 0.062, h: 0.25, col: '#10b981', title: 'AI' },
      { w: 0.052, h: 0.20, col: '#f59e0b', title: 'GL' },
      { w: 0.058, h: 0.23, col: '#8b5cf6', title: 'OS' },
    ],
    []
  );

  const booksLower = useMemo(
    () => [
      { w: 0.050, h: 0.21, col: '#06b6d4' },
      { w: 0.064, h: 0.24, col: '#ec4899' },
      { w: 0.046, h: 0.18, col: '#6366f1' },
      { w: 0.056, h: 0.22, col: '#14b8a6' },
      { w: 0.052, h: 0.20, col: '#eab308' },
    ],
    []
  );

  return (
    <group position={[-0.85, 2.15, -2.06]}>
      {/* ── Upper Shelf ── */}
      <group position={[0, 0.48, 0]}>
        {/* Wooden Shelf Board */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.15, 0.032, 0.24]} />
          <meshStandardMaterial color="#4a2c1a" roughness={0.7} />
        </mesh>

        {/* Books Array */}
        {booksUpper.reduce((acc, b, i) => {
          const prev = acc[i - 1];
          const x = prev ? prev.x + prev.w / 2 + b.w / 2 + 0.012 : -0.42;
          acc.push({ ...b, x });
          return acc;
        }, [] as Array<{ x: number; w: number; h: number; col: string }>).map((b, i) => (
          <mesh key={i} position={[b.x, 0.016 + b.h / 2, 0]} castShadow>
            <boxGeometry args={[b.w, b.h, 0.18]} />
            <meshStandardMaterial color={b.col} roughness={0.75} />
          </mesh>
        ))}

        {/* Mini Golden Trophy */}
        <group position={[0.22, 0.016, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.032, 0.040, 0.045, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.048, 0]} castShadow>
            <cylinderGeometry args={[0.010, 0.012, 0.050, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.095, 0]} castShadow>
            <sphereGeometry args={[0.028, 16, 14]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Small Succulent Pot */}
        <group position={[0.42, 0.016, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.042, 0.032, 0.065, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.050, 0]}>
            <sphereGeometry args={[0.036, 12, 10]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ── Lower Shelf ── */}
      <group position={[0, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.15, 0.032, 0.24]} />
          <meshStandardMaterial color="#4a2c1a" roughness={0.7} />
        </mesh>

        {booksLower.reduce((acc, b, i) => {
          const prev = acc[i - 1];
          const x = prev ? prev.x + prev.w / 2 + b.w / 2 + 0.012 : -0.42;
          acc.push({ ...b, x });
          return acc;
        }, [] as Array<{ x: number; w: number; h: number; col: string }>).map((b, i) => (
          <mesh key={i} position={[b.x, 0.016 + b.h / 2, 0]} castShadow>
            <boxGeometry args={[b.w, b.h, 0.18]} />
            <meshStandardMaterial color={b.col} roughness={0.75} />
          </mesh>
        ))}

        {/* Figurine on lower shelf */}
        <group position={[0.35, 0.016, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.065, 0.025, 0.065]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.055, 0]} castShadow>
            <capsuleGeometry args={[0.024, 0.045, 8, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function WorkWall() {
  return (
    <group>
      {/* Real-Time Visitor Clock */}
      <RealTimeClock position={[0.75, 2.70, -2.12]} />

      {/* Motivational Quote Poster */}
      <QuotePoster position={[0.75, 1.82, -2.12]} />

      {/* Bookshelf with Books, Plant & Trophy */}
      <FloatingShelvesWithDecor />
    </group>
  );
}
