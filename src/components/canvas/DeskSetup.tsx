import { useRef } from 'react';
import { Group } from 'three';

export function DeskSetup() {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Desk surface */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.08, 1.6]} />
        <meshStandardMaterial color="#1a1f35" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Desk legs */}
      {([-1.6, 1.6] as number[]).map((x) =>
        ([-0.65, 0.65] as number[]).map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.37, z]} castShadow>
            <boxGeometry args={[0.07, 0.75, 0.07]} />
            <meshStandardMaterial color="#111827" roughness={0.6} metalness={0.4} />
          </mesh>
        ))
      )}

      {/* Monitor */}
      <mesh position={[0, 1.55, -0.4]} castShadow>
        <boxGeometry args={[1.8, 1.0, 0.05]} />
        <meshStandardMaterial color="#0d1117" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Monitor screen glow */}
      <mesh position={[0, 1.55, -0.37]}>
        <planeGeometry args={[1.65, 0.88]} />
        <meshStandardMaterial
          color="#00f2fe"
          emissive="#00f2fe"
          emissiveIntensity={0.4}
          roughness={0.1}
        />
      </mesh>

      {/* Monitor stand */}
      <mesh position={[0, 1.08, -0.4]} castShadow>
        <boxGeometry args={[0.08, 0.6, 0.08]} />
        <meshStandardMaterial color="#1a1f35" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Keyboard */}
      <mesh position={[0, 0.8, 0.2]} castShadow>
        <boxGeometry args={[0.9, 0.025, 0.3]} />
        <meshStandardMaterial color="#0d1117" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Mouse */}
      <mesh position={[0.6, 0.8, 0.2]} castShadow>
        <boxGeometry args={[0.1, 0.03, 0.15]} />
        <meshStandardMaterial color="#0d1117" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Coffee mug */}
      <mesh position={[-1.1, 0.87, 0.1]} castShadow>
        <cylinderGeometry args={[0.07, 0.065, 0.14, 16]} />
        <meshStandardMaterial color="#1a1f35" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Desk lamp base */}
      <mesh position={[1.3, 0.79, -0.3]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.03, 16]} />
        <meshStandardMaterial color="#2a2f45" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Desk lamp arm */}
      <mesh position={[1.3, 1.0, -0.3]} castShadow>
        <boxGeometry args={[0.025, 0.4, 0.025]} />
        <meshStandardMaterial color="#2a2f45" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Desk lamp head */}
      <mesh position={[1.1, 1.22, -0.2]} castShadow>
        <sphereGeometry args={[0.09, 8, 8, 0, Math.PI]} />
        <meshStandardMaterial color="#ffe8b0" emissive="#ffe8b0" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}
