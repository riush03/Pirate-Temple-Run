// components/GameContainer.tsx
'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload, Stats, AdaptiveEvents } from '@react-three/drei';
import FlyingBird from './FlyingBird';
import EnvironmentScene from './EnvironmentScene';
import LoadingScreen from './LoadingScreen';

export default function GameContainer() {
  return (
    <div className="absolute inset-0">
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          shadows
          camera={{ position: [0, 5, 15], fov: 60 }}
          className="touch-none"
        >
          <color attach="background" args={['#87CEEB']} />
          
          {/* Performance Optimizations */}
          <AdaptiveEvents />
          <Preload all />
          
          {/* Scene Components */}
          <EnvironmentScene />
          <FlyingBird />
        
          
          {/* Debug */}
          {process.env.NODE_ENV === 'development' && <Stats />}
        </Canvas>
      </Suspense>
    </div>
  );
}