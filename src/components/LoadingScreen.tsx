// components/LoadingScreen.tsx
'use client';

import {  useProgress } from '@react-three/drei';

export default function LoadingScreen() {
  const { progress } = useProgress();
  
  return (
  
      <div className="flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-white">Loading Bird Flight Simulator</h2>
        <p className="text-gray-300 mb-4">Preparing your flying experience...</p>
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-4 text-lg font-semibold text-white">{progress.toFixed(0)}%</p>
      </div>
    
  );
}