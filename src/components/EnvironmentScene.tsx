// components/EnvironmentScene.tsx
'use client';

import { Sky, Clouds, Cloud, Stars, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

export default function EnvironmentScene() {
  return (
    <>
      {/* Sky and Atmosphere */}
      <Sky 
        distance={450000}
        sunPosition={[100, 20, 100]}
        inclination={0}
        azimuth={0.25}
      />
      
      {/* Clouds */}
      <Clouds material={THREE.MeshBasicMaterial} position={[0, 50, 0]}>
        <Cloud seed={1} bounds={[100, 10, 100]} volume={10} color="white" />
        <Cloud seed={2} bounds={[100, 10, 100]} volume={10} color="white" />
        <Cloud seed={3} bounds={[100, 10, 100]} volume={10} color="white" />
      </Clouds>
      
      {/* Stars at night */}
      <Stars radius={100} depth={50} count={5000} factor={4} fade />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* Environment Map */}
      <Environment preset="city" />
      
      {/* Terrain */}
      
      {/* Floating islands/obstacles */}
      <FloatingIslands />
    </>
  );
}

function FloatingIslands() {
  return (
    <group>
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 100,
            5 + Math.random() * 20,
            (Math.random() - 0.5) * 100
          ]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[3 + Math.random() * 5, 32, 32]} />
          <meshStandardMaterial color={`hsl(${Math.random() * 60 + 100}, 50%, 50%)`} />
          <mesh position={[0, 4, 0]}>
            <coneGeometry args={[2, 6, 8]} />
            <meshStandardMaterial color="green" />
          </mesh>
        </mesh>
      ))}
    </group>
  );
}