'use client';

import { useMemo } from 'react';
import { WindowCity } from './WindowCity';
import { WorkWall } from './WorkWall';
import { DeskArea } from './DeskArea';
import { Character } from './Character';

const SLATE_BASE     = '#141c2b';
const OAK_FLOOR      = '#5e371f';
const OAK_PLANK_ALT  = '#54301a';
const RUG_COLOR      = '#211a36';
const RUG_BORDER     = '#2c2247';
const WALL_COLOR     = '#222b3e';
const BASEBOARD_COL  = '#3b2314';

/**
 * BaseSlabAndFloor
 * Architectural foundation with thick dark slate slab, wood planks & woven rug
 */
function BaseSlabAndFloor() {
  const planks = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        z: -1.95 + i * 0.35,
        color: i % 2 === 0 ? OAK_FLOOR : OAK_PLANK_ALT,
      })),
    []
  );

  return (
    <group>
      {/* ── Thick Beveled Exterior Base Slab ── */}
      <mesh position={[0, -0.10, 0]} receiveShadow>
        <boxGeometry args={[4.35, 0.20, 4.35]} />
        <meshStandardMaterial color={SLATE_BASE} roughness={0.75} metalness={0.2} />
      </mesh>
      {/* Sub-bevel bottom footing */}
      <mesh position={[0, -0.21, 0]}>
        <boxGeometry args={[4.52, 0.04, 4.52]} />
        <meshStandardMaterial color="#090d14" roughness={0.85} />
      </mesh>

      {/* ── Oak Wood Plank Floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[4.25, 4.25]} />
        <meshStandardMaterial color={OAK_FLOOR} roughness={0.7} />
      </mesh>

      {/* Individual Oak Wood Planks with subtle tonality */}
      {planks.map((p, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.002, p.z]}
          receiveShadow
        >
          <planeGeometry args={[4.22, 0.32]} />
          <meshStandardMaterial color={p.color} roughness={0.75} />
        </mesh>
      ))}

      {/* ── Deep Navy-Purple Woven Rug Under Desk & Chair ── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-0.45, 0.005, 0.25]}
        receiveShadow
      >
        <planeGeometry args={[2.4, 2.7]} />
        <meshStandardMaterial color={RUG_COLOR} roughness={0.96} />
      </mesh>
      {/* Rug woven border */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-0.45, 0.006, 0.25]}
      >
        <planeGeometry args={[2.28, 2.58]} />
        <meshStandardMaterial color={RUG_BORDER} roughness={0.96} />
      </mesh>
    </group>
  );
}

/**
 * ArchitecturalWalls
 * Only 2 walls: Left Window Wall and Back-Right Work Wall (NO ceiling, NO extra walls)
 */
function ArchitecturalWalls() {
  return (
    <group>
      {/* ── Left Wall (Window Wall) with Window Cutout ── */}
      {/* Lower section below window sill */}
      <mesh position={[-2.17, 0.40, 0.0]} receiveShadow>
        <boxGeometry args={[0.14, 0.80, 4.25]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.90} />
      </mesh>
      {/* Upper header above window */}
      <mesh position={[-2.17, 3.25, 0.0]} receiveShadow>
        <boxGeometry args={[0.14, 0.38, 4.25]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.90} />
      </mesh>
      {/* Left side flanking wall */}
      <mesh position={[-2.17, 1.82, -1.65]} receiveShadow>
        <boxGeometry args={[0.14, 2.05, 0.95]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.90} />
      </mesh>
      {/* Right side flanking wall */}
      <mesh position={[-2.17, 1.82, 1.65]} receiveShadow>
        <boxGeometry args={[0.14, 2.05, 0.95]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.90} />
      </mesh>
      {/* Left Wall Baseboard */}
      <mesh position={[-2.08, 0.05, 0.0]}>
        <boxGeometry args={[0.04, 0.10, 4.25]} />
        <meshStandardMaterial color={BASEBOARD_COL} roughness={0.65} />
      </mesh>

      {/* ── Back-Right Wall (Work Wall) ── */}
      <mesh position={[0.0, 1.70, -2.17]} receiveShadow>
        <boxGeometry args={[4.25, 3.40, 0.14]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.90} />
      </mesh>
      {/* Back-Right Wall Baseboard */}
      <mesh position={[0.0, 0.05, -2.08]}>
        <boxGeometry args={[4.25, 0.10, 0.04]} />
        <meshStandardMaterial color={BASEBOARD_COL} roughness={0.65} />
      </mesh>
    </group>
  );
}

export function Room({
  onObjectClick,
}: {
  onObjectClick?: (objectName: string) => void;
}) {
  return (
    <group>
      {/* Floor Foundation & Slab */}
      <BaseSlabAndFloor />

      {/* 2 Architectural Walls */}
      <ArchitecturalWalls />

      {/* Left Wall: Window, Curtains, Radiator, Night City Skyline */}
      <WindowCity />

      {/* Back-Right Wall: Clock, Quote Poster, Bookshelf */}
      <WorkWall />

      {/* Desk Area: L-Desk, Screens, Laptop, Keyboard, Lamp, Coffee, Chair */}
      <DeskArea onObjectClick={onObjectClick} />

      {/* 3D Human Developer Avatar */}
      <Character />
    </group>
  );
}
