import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { Suspense } from 'react';
import { Lighting } from './Lighting';
import { Room } from './Room';
import { DeveloperAvatar } from './DeveloperAvatar';

export function SceneCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows
      camera={{ position: [5, 4, 8], fov: 45 }}
      style={{ background: '#050816' }}
    >
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        minDistance={4}
        maxDistance={12}
      />
      <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <Suspense fallback={null}>
        <Lighting />
        <Room />
        <DeveloperAvatar />
      </Suspense>
    </Canvas>
  );
}
