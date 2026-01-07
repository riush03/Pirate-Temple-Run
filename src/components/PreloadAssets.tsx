// components/PreloadAssets.tsx
'use client';

import { useGLTF } from '@react-three/drei';

export default function PreloadAssets() {
  // Preload the bird model
  useGLTF.preload('/assets/bird/scene.gltf');
  
  // Add more assets to preload here
  return null;
}