'use client';

import { useMemo, useState } from 'react';
import * as THREE from 'three';

const BRASS_GOLD   = '#d4af37'; // Polished warm brass
const BRASS_DARK   = '#997d26'; // Antique brass accents
const CHROME_METAL = '#e2e8f0'; // Polished steel / chrome springs
const SHADE_INNER  = '#fffbeb'; // Warm enameled reflector
const BASE_RUBBER  = '#0f172a';

function createSpring(radius: number, height: number, turns: number) {
  const pts: THREE.Vector3[] = [];
  const steps = turns * 16;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const angle = u * turns * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = u * height;
    pts.push(new THREE.Vector3(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, steps, 0.002, 6, false);
}

export interface DeskLampProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  onToggle?: (state: boolean) => void;
}

export function DeskLamp({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onToggle,
}: DeskLampProps) {
  const [lampOn, setLampOn] = useState(true);

  const spring1 = useMemo(() => createSpring(0.0065, 0.22, 14), []);
  const spring2 = useMemo(() => createSpring(0.0065, 0.20, 12), []);

  const handleToggle = () => {
    const next = !lampOn;
    setLampOn(next);
    if (onToggle) onToggle(next);
  };

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={handleToggle}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* ── 1. Weighted Circular Base ── */}
      <mesh position={[0, 0.004, 0]}>
        <cylinderGeometry args={[0.088, 0.090, 0.008, 32]} />
        <meshStandardMaterial color={BASE_RUBBER} roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.016, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.082, 0.088, 0.016, 32]} />
        <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} />
      </mesh>

      <mesh position={[0, 0.028, 0]} castShadow>
        <cylinderGeometry args={[0.048, 0.054, 0.012, 28]} />
        <meshStandardMaterial color={BRASS_DARK} metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Red accent rotary switch on base */}
      <mesh position={[0.042, 0.034, 0.032]}>
        <cylinderGeometry args={[0.0065, 0.0075, 0.012, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Swivel socket boss */}
      <mesh position={[0, 0.042, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, 0.016, 20]} />
        <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ── 2. Lower Bracket & Swivel Fork ── */}
      <group position={[0, 0.050, 0]}>
        {[-0.014, 0.014].map((x, i) => (
          <mesh key={i} position={[x, 0.016, 0]}>
            <boxGeometry args={[0.005, 0.032, 0.022]} />
            <meshStandardMaterial color={BRASS_DARK} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, 0.024, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.0045, 0.0045, 0.038, 12]} />
          <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0.022, 0.024, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.010, 0.010, 0.007, 16]} />
          <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.25} />
        </mesh>
      </group>

      {/* ── 3. Lower Articulated Arm (Leaning Inward) ── */}
      <group position={[0, 0.074, 0]} rotation={[-0.48, 0, -0.18]}>
        {[-0.010, 0.010].map((x, i) => (
          <mesh key={i} position={[x, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.30, 12]} />
            <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} />
          </mesh>
        ))}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.026, 0.012, 0.014]} />
          <meshStandardMaterial color={BRASS_DARK} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.04, 0.014]} geometry={spring1}>
          <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
        </mesh>

        {/* ── 4. Articulated Elbow Joint ── */}
        <group position={[0, 0.30, 0]}>
          {[-0.012, 0.012].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.016, 0.016, 0.004, 20]} />
              <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 0.038, 14]} />
            <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0.024, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.013, 0.013, 0.007, 18]} />
            <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.25} />
          </mesh>

          {/* ── 5. Upper Articulated Arm (Reaching Down Over Desk) ── */}
          <group rotation={[0.82, 0, 0.22]}>
            {[-0.010, 0.010].map((x, i) => (
              <mesh key={i} position={[x, 0.14, 0]} castShadow>
                <cylinderGeometry args={[0.0045, 0.0045, 0.28, 12]} />
                <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} />
              </mesh>
            ))}
            <mesh position={[0, 0.14, 0]}>
              <boxGeometry args={[0.024, 0.010, 0.012]} />
              <meshStandardMaterial color={BRASS_DARK} metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.03, -0.012]} geometry={spring2}>
              <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
            </mesh>

            {/* ── 6. Swivel Wrist & Flared Bell Lampshade ── */}
            <group position={[0, 0.28, 0]} rotation={[0.55, -0.20, 0.45]}>
              <mesh position={[0, 0.015, 0]}>
                <sphereGeometry args={[0.012, 14, 12]} />
                <meshStandardMaterial color={CHROME_METAL} metalness={0.95} roughness={0.15} />
              </mesh>
              <mesh position={[0, 0.032, 0]} castShadow>
                <cylinderGeometry args={[0.018, 0.020, 0.026, 20]} />
                <meshStandardMaterial color={BRASS_DARK} metalness={0.88} roughness={0.25} />
              </mesh>

              {/* ── Flared Bell Shade Pointing Downward ── */}
              <group position={[0, 0.045, 0]} rotation={[Math.PI, 0, 0]}>
                <mesh position={[0, -0.015, 0]} castShadow>
                  <sphereGeometry args={[0.034, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} side={THREE.DoubleSide} />
                </mesh>

                <mesh position={[0, 0.045, 0]} castShadow>
                  <cylinderGeometry args={[0.034, 0.082, 0.09, 28, 1, true]} />
                  <meshStandardMaterial color={BRASS_GOLD} metalness={0.88} roughness={0.22} side={THREE.DoubleSide} />
                </mesh>

                {/* Interior warm enameled reflector lining */}
                <mesh position={[0, 0.045, 0]}>
                  <cylinderGeometry args={[0.033, 0.080, 0.088, 24, 1, true]} />
                  <meshStandardMaterial
                    color={SHADE_INNER}
                    emissive="#ffedd5"
                    emissiveIntensity={lampOn ? 0.45 : 0.02}
                    roughness={0.3}
                    side={THREE.BackSide}
                  />
                </mesh>

                <mesh position={[0, 0.090, 0]}>
                  <torusGeometry args={[0.082, 0.0035, 10, 28]} />
                  <meshStandardMaterial color={BRASS_GOLD} metalness={0.9} roughness={0.2} />
                </mesh>

                {/* Frosted glowing warm amber bulb (2700K - 3000K) */}
                <mesh position={[0, 0.042, 0]}>
                  <sphereGeometry args={[0.028, 18, 16]} />
                  <meshStandardMaterial
                    color="#fffbeb"
                    emissive="#ffaa3b"
                    emissiveIntensity={lampOn ? 5.5 : 0.15}
                    roughness={0.1}
                  />
                </mesh>

                {/* Core warm key light cast directly from lamp shade onto desk and character */}
                {lampOn && (
                  <>
                    <pointLight
                      color="#ffaa3b"
                      intensity={4.8}
                      distance={5.5}
                      decay={1.8}
                      castShadow
                      shadow-mapSize={[1024, 1024]}
                      shadow-bias={-0.0004}
                    />
                    <spotLight
                      color="#ffb74d"
                      intensity={6.2}
                      angle={0.65}
                      penumbra={0.5}
                      distance={4.5}
                      position={[0, 0.05, 0]}
                      target-position={[0, 1.2, 0]}
                      castShadow
                      shadow-bias={-0.0004}
                    />
                  </>
                )}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
