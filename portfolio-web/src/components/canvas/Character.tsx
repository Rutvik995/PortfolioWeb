'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const HOODIE_COLOR = '#422a1c'; // Rich matte dark brown winter knit

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
    hips?: THREE.Bone;
  }>({});

  // Store rest quaternions so rotations are applied cleanly relative to bind pose
  const restQuatsRef = useRef<Map<THREE.Bone, THREE.Quaternion>>(new Map());

  // Use the original scene directly (NO scene.clone which breaks SkinnedMesh bindings)
  const modelScene = useMemo(() => {
    // Traverse and optimize materials
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;

        const mesh = obj as THREE.Mesh;
        const mat = mesh.material;

        if (mat instanceof THREE.MeshStandardMaterial) {
          const matName = mat.name.toLowerCase();
          const meshName = mesh.name.toLowerCase();

          // Winter hoodie / knitwear material override
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
            mat.roughness = 0.52;
            mat.metalness = 0.02;
          }

          // Hair material refinement
          if (meshName.includes('hair') || matName.includes('hair')) {
            mat.roughness = 0.78;
            mat.metalness = 0.03;
          }
        }
      }
    });

    return scene;
  }, [scene]);

  useEffect(() => {
    const root = modelScene;
    if (!root) return;

    const bones: typeof bonesRef.current = {};
    const restMap = new Map<THREE.Bone, THREE.Quaternion>();

    root.traverse((obj) => {
      if ((obj as THREE.Bone).isBone) {
        const bone = obj as THREE.Bone;
        const name = bone.name.toLowerCase();

        restMap.set(bone, bone.quaternion.clone());

        if (name.includes('head')) bones.head = bone;
        else if (name.includes('neck')) bones.neck = bone;
        else if (name.includes('spine2')) bones.spine2 = bone;
        else if (name.includes('spine1')) bones.spine1 = bone;
        else if (name.includes('spine')) bones.spine = bone;
        else if (name.includes('hips')) bones.hips = bone;
        else if (name.includes('leftforearm') || name.includes('leftlowerarm')) bones.leftForeArm = bone;
        else if (name.includes('rightforearm') || name.includes('rightlowerarm')) bones.rightForeArm = bone;
        else if (name.includes('leftarm') || name.includes('leftupperarm')) bones.leftArm = bone;
        else if (name.includes('rightarm') || name.includes('rightupperarm')) bones.rightArm = bone;
        else if (name.includes('lefthand')) bones.leftHand = bone;
        else if (name.includes('righthand')) bones.rightHand = bone;
        else if (name.includes('leftupleg') || name.includes('leftthigh')) bones.leftUpLeg = bone;
        else if (name.includes('rightupleg') || name.includes('rightthigh')) bones.rightUpLeg = bone;
        else if (name.includes('leftleg') || name.includes('leftcalf')) bones.leftLeg = bone;
        else if (name.includes('rightleg') || name.includes('rightcalf')) bones.rightLeg = bone;
      }
    });

    bonesRef.current = bones;
    restQuatsRef.current = restMap;
  }, [modelScene]);

  // Quaternions helper
  const applyDelta = (bone: THREE.Bone | undefined, euler: THREE.Euler) => {
    if (!bone) return;
    const rest = restQuatsRef.current.get(bone);
    if (!rest) return;
    const delta = new THREE.Quaternion().setFromEuler(euler);
    bone.quaternion.copy(rest).multiply(delta);
  };

  // Continuous animation and seated pose lock in useFrame (60 FPS)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const bones = bonesRef.current;
    if (!bones) return;

    // ── 1. Seated Lower Body Pose ──
    // Bend thighs forward 90 degrees onto the chair cushion
    applyDelta(bones.leftUpLeg, new THREE.Euler(1.52, 0.08, -0.05));
    applyDelta(bones.rightUpLeg, new THREE.Euler(1.52, -0.08, 0.05));

    // Bend calves downward 90 degrees to floor
    applyDelta(bones.leftLeg, new THREE.Euler(-1.55, 0, 0));
    applyDelta(bones.rightLeg, new THREE.Euler(-1.55, 0, 0));

    // ── 2. Upper Body Spine Lean ──
    applyDelta(bones.spine, new THREE.Euler(0.10, 0, 0));
    applyDelta(bones.spine1, new THREE.Euler(0.06, 0, 0));
    applyDelta(bones.spine2, new THREE.Euler(0.05 + Math.sin(t * 1.8) * 0.012, 0, 0)); // breathing

    // ── 3. Arms Lowered from T-Pose onto Keyboard ──
    // Left arm down and forward
    applyDelta(bones.leftArm, new THREE.Euler(0.48, 0.25, -1.18));
    // Left forearm angled inward over keyboard
    applyDelta(bones.leftForeArm, new THREE.Euler(0.20, -0.65, -0.72));

    // Right arm down and forward
    applyDelta(bones.rightArm, new THREE.Euler(0.48, -0.25, 1.18));
    // Right forearm angled inward over keyboard
    applyDelta(bones.rightForeArm, new THREE.Euler(0.20, 0.65, 0.72));

    // ── 4. Alternating Hands Typing Motion ──
    const leftTap = Math.sin(t * 14) * 0.06;
    const rightTap = Math.sin(t * 14 + Math.PI) * 0.06;
    applyDelta(bones.leftHand, new THREE.Euler(-0.15 + leftTap, 0.05, 0));
    applyDelta(bones.rightHand, new THREE.Euler(-0.15 + rightTap, -0.05, 0));

    // ── 5. Head Micro-Glance ──
    if (bones.head) {
      const cycle = (t * 0.15) % (Math.PI * 2);
      const isGlancing = Math.sin(cycle) > 0.82;
      const targetY = isGlancing ? 0.32 : 0.0;
      const rest = restQuatsRef.current.get(bones.head);
      if (rest) {
        const delta = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.08 + Math.sin(t * 1.4) * 0.01, targetY, 0)
        );
        bones.head.quaternion.copy(rest).multiply(delta);
      }
    }
  });

  return (
    <primitive
      ref={characterGroup}
      object={modelScene}
      position={[0, -0.44, 0.02]}
      rotation={[0, 0, 0]}
      scale={0.92}
    />
  );
}

export function Character() {
  const [modelUrl, setModelUrl] = useState('/models/character.glb');

  useEffect(() => {
    fetch('/models/character.glb', { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) setModelUrl('/models/model.glb');
      })
      .catch(() => setModelUrl('/models/model.glb'));
  }, []);

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
        intensity={1.4}
        distance={1.6}
        decay={2}
      />

      {/* ── Lamp Warm Rim Light on Character's Hair & Shoulders ── */}
      <pointLight
        position={[-0.45, 1.35, 0.20]}
        color="#ffaa3b"
        intensity={2.2}
        distance={2.0}
        decay={2}
      />
    </group>
  );
}

useGLTF.preload('/models/character.glb');
useGLTF.preload('/models/model.glb');
