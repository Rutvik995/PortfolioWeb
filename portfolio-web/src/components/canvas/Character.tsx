'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Character
 * ─────────────────────────────────────────────────────────────────────────────
 * Rigged 3D Human Developer seated at workstation:
 *  - Loads directly from `/models/character.glb` (with automatic fallback to `/models/model.glb`)
 *  - Real human proportions, PBR skin, long wavy hair, winter hoodie/knitwear
 *  - Skeletal animation driven in `useFrame`:
 *      • Natural alternating typing hands on mechanical keyboard
 *      • Subtle chest expansion/relaxation breathing cycle
 *      • Periodic head turn glancing at secondary monitor
 *      • Soft blue-cyan screen reflection on face + warm yellow rim light on hair
 *
 * ASSET INSTRUCTIONS:
 *  Place your rigged 3D human character GLB file at:
 *    `/public/models/character.glb`
 *  Recommended specifications:
 *    - Standard Mixamo-compatible or humanoid bone names (Head, Neck, Spine, LeftArm, RightArm, LeftHand, RightHand)
 *    - Draco or Meshopt compressed
 */

const HOODIE_COLOR = '#452b1b'; // Warm rich brown winter knit

function CharacterModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const characterGroup = useRef<THREE.Group>(null);

  // Bone references for skeletal manipulation
  const bonesRef = useRef<{
    head?: THREE.Bone;
    neck?: THREE.Bone;
    spine?: THREE.Bone;
    spine1?: THREE.Bone;
    spine2?: THREE.Bone;
    leftArm?: THREE.Bone;
    rightArm?: THREE.Bone;
    leftForeArm?: THREE.Bone;
    rightForeArm?: THREE.Bone;
    leftHand?: THREE.Bone;
    rightHand?: THREE.Bone;
    leftUpLeg?: THREE.Bone;
    rightUpLeg?: THREE.Bone;
    leftLeg?: THREE.Bone;
    rightLeg?: THREE.Bone;
  }>({});

  // Clone scene so multiple instances don't clash
  const clonedScene = useRef<THREE.Group>(null!);
  if (!clonedScene.current) {
    clonedScene.current = scene.clone(true);
  }

  useEffect(() => {
    const root = clonedScene.current;
    if (!root) return;

    // Cache bone references
    const bones: Record<string, THREE.Bone> = {};
    root.traverse((obj) => {
      if ((obj as THREE.Bone).isBone) {
        const name = obj.name.toLowerCase();
        if (name.includes('head')) bones.head = obj as THREE.Bone;
        else if (name.includes('neck')) bones.neck = obj as THREE.Bone;
        else if (name.includes('spine2')) bones.spine2 = obj as THREE.Bone;
        else if (name.includes('spine1')) bones.spine1 = obj as THREE.Bone;
        else if (name.includes('spine')) bones.spine = obj as THREE.Bone;
        else if (name.includes('leftforearm') || name.includes('leftlowerarm')) bones.leftForeArm = obj as THREE.Bone;
        else if (name.includes('rightforearm') || name.includes('rightlowerarm')) bones.rightForeArm = obj as THREE.Bone;
        else if (name.includes('leftarm') || name.includes('leftupperarm')) bones.leftArm = obj as THREE.Bone;
        else if (name.includes('rightarm') || name.includes('rightupperarm')) bones.rightArm = obj as THREE.Bone;
        else if (name.includes('lefthand')) bones.leftHand = obj as THREE.Bone;
        else if (name.includes('righthand')) bones.rightHand = obj as THREE.Bone;
        else if (name.includes('leftupleg') || name.includes('leftthigh')) bones.leftUpLeg = obj as THREE.Bone;
        else if (name.includes('rightupleg') || name.includes('rightthigh')) bones.rightUpLeg = obj as THREE.Bone;
        else if (name.includes('leftleg') || name.includes('leftcalf')) bones.leftLeg = obj as THREE.Bone;
        else if (name.includes('rightleg') || name.includes('rightcalf')) bones.rightLeg = obj as THREE.Bone;
      }

      // Material tuning for PBR photorealism
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;

        const mesh = obj as THREE.Mesh;
        const mat = mesh.material;

        if (mat instanceof THREE.MeshStandardMaterial) {
          const matName = mat.name.toLowerCase();
          const meshName = mesh.name.toLowerCase();

          // Winter hoodie / jacket material override
          if (
            meshName.includes('body') ||
            meshName.includes('look') ||
            meshName.includes('top') ||
            meshName.includes('cloth') ||
            matName.includes('top') ||
            matName.includes('cloth') ||
            matName.includes('look')
          ) {
            mat.color.set(HOODIE_COLOR);
            mat.roughness = 0.92;
            mat.metalness = 0.0;
          }

          // Skin material refinement
          if (
            meshName.includes('head') ||
            meshName.includes('face') ||
            matName.includes('skin') ||
            matName.includes('head')
          ) {
            mat.roughness = 0.54;
            mat.metalness = 0.02;
          }

          // Hair material refinement
          if (meshName.includes('hair') || matName.includes('hair')) {
            mat.roughness = 0.75;
            mat.metalness = 0.05;
          }
        }
      }
    });

    bonesRef.current = bones;
  }, []);

  // Continuous animation and seated pose lock in useFrame (60 FPS)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const bones = bonesRef.current;
    if (!bones) return;

    // ── 1. Enforce Seated Desk Pose ──
    // Thighs bent 90° forward onto chair cushion
    if (bones.leftUpLeg) bones.leftUpLeg.rotation.x = Math.PI / 2.05;
    if (bones.rightUpLeg) bones.rightUpLeg.rotation.x = Math.PI / 2.05;

    // Calves bent 90° downward toward floor
    if (bones.leftLeg) bones.leftLeg.rotation.x = -Math.PI / 2.05;
    if (bones.rightLeg) bones.rightLeg.rotation.x = -Math.PI / 2.05;

    // Spine leaned slightly forward toward desk
    if (bones.spine) bones.spine.rotation.x = 0.12;
    if (bones.spine1) bones.spine1.rotation.x = 0.08;

    // Upper arms forward & forearms resting toward keyboard
    if (bones.leftArm) {
      bones.leftArm.rotation.x = 0.55;
      bones.leftArm.rotation.z = -0.22;
    }
    if (bones.rightArm) {
      bones.rightArm.rotation.x = 0.55;
      bones.rightArm.rotation.z = 0.22;
    }
    if (bones.leftForeArm) {
      bones.leftForeArm.rotation.x = 0.78;
      bones.leftForeArm.rotation.z = 0.14;
    }
    if (bones.rightForeArm) {
      bones.rightForeArm.rotation.x = 0.78;
      bones.rightForeArm.rotation.z = -0.14;
    }

    // ── 2. Subtle Natural Breathing Cycle ──
    if (bones.spine2) {
      bones.spine2.rotation.x = 0.06 + Math.sin(t * 1.8) * 0.014;
    }

    // ── 3. Alternating Typing Hand Movement ──
    if (bones.leftHand) {
      bones.leftHand.rotation.x = -0.10 + Math.sin(t * 14) * 0.05;
      bones.leftHand.rotation.z = -0.04 + Math.cos(t * 12) * 0.02;
    }
    if (bones.rightHand) {
      bones.rightHand.rotation.x = -0.10 + Math.sin(t * 14 + Math.PI) * 0.05;
      bones.rightHand.rotation.z = 0.04 + Math.cos(t * 13) * 0.02;
    }

    // ── 4. Periodic Head Glance toward Secondary Monitor ──
    if (bones.head) {
      const cycle = (t * 0.15) % (Math.PI * 2);
      const isGlancing = Math.sin(cycle) > 0.85;
      const targetY = isGlancing ? 0.28 : 0.0;
      bones.head.rotation.y = THREE.MathUtils.lerp(bones.head.rotation.y, targetY, 0.05);
      bones.head.rotation.x = 0.06 + Math.sin(t * 1.4) * 0.008;
    }
  });

  return (
    <primitive
      ref={characterGroup}
      object={clonedScene.current}
      position={[0, -0.46, 0.02]}
      rotation={[0, 0, 0]}
      scale={0.92}
    />
  );
}

/**
 * Character Component with graceful asset fallback
 */
export function Character() {
  const [modelUrl, setModelUrl] = useState('/models/character.glb');
  const [hasError, setHasError] = useState(false);

  // If character.glb doesn't exist, try model.glb
  useEffect(() => {
    fetch('/models/character.glb', { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) setModelUrl('/models/model.glb');
      })
      .catch(() => setModelUrl('/models/model.glb'));
  }, []);

  if (hasError) {
    return (
      <group position={[0, 0.65, 0]}>
        {/* Sleek architectural placeholder wireframe */}
        <mesh position={[0, 0.45, 0]}>
          <capsuleGeometry args={[0.22, 0.65, 8, 16]} />
          <meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.35} />
        </mesh>
      </group>
    );
  }

  return (
    <group
      position={[-0.30, 0.0, 0.15]}
      rotation={[0, -Math.PI / 2 + 0.12, 0]}
    >
      <CharacterModel url={modelUrl} />

      {/* ── Screen Light Soft Glow on Character's Face ── */}
      <pointLight
        position={[0, 1.25, 0.45]}
        color="#38bdf8"
        intensity={1.2}
        distance={1.4}
        decay={2}
      />

      {/* ── Lamp Warm Rim Light on Character's Hair & Shoulders ── */}
      <pointLight
        position={[-0.45, 1.35, 0.20]}
        color="#ffaa3b"
        intensity={2.1}
        distance={2.0}
        decay={2}
      />
    </group>
  );
}

// Preload model
useGLTF.preload('/models/character.glb');
useGLTF.preload('/models/model.glb');
