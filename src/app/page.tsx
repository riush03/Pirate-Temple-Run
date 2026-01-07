'use client';
import { useState, useEffect } from 'react';
import Scene from '../components/Scene';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-sky-800 to-cyan-900 overflow-hidden">
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900">
          <div className="text-center max-w-md">
            <div className="relative w-64 h-64 mx-auto mb-8">
              {/* Animated Pirate Ship */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl animate-bounce">🚢</div>
              </div>
              {/* Compass Spinner */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-5xl animate-spin" style={{ animationDuration: '3s' }}>🧭</div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-yellow-400 mb-4">🏴‍☠️ LOADING PIRATE TEMPLE RUN</h1>
            <p className="text-xl text-yellow-200 mb-8">Preparing your adventure...</p>
            
            {/* Loading Bar */}
            <div className="w-full bg-gray-800 rounded-full h-6 mb-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-yellow-600 to-amber-600 h-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Loading assets...</span>
              <span>{loadingProgress}%</span>
            </div>
            
            <div className="mt-8 text-yellow-100">
              <p className="mb-2">⚓ Loading 3D models...</p>
              <p className="mb-2">🗺️ Setting up the pirate world...</p>
              <p>💰 Placing treasures...</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Game */}
      <main className="h-screen relative">
        <Scene />
        
        {/* Game UI Overlay */}
        <div className="absolute top-0 left-0 right-0 z-50 p-6">
          <div className="flex justify-between items-center">
            <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-xl">
              <h1 className="text-2xl font-bold text-yellow-400">🏴‍☠️ Pirate Temple Run</h1>
            </div>
            
            <div className="flex gap-6">
              <div className="bg-black/70 backdrop-blur-sm px-5 py-3 rounded-xl">
                <div className="text-gray-300 text-sm">SCORE</div>
                <div id="score" className="text-3xl font-bold text-white">0</div>
              </div>
              
              <div className="bg-black/70 backdrop-blur-sm px-5 py-3 rounded-xl">
                <div className="text-gray-300 text-sm">COINS</div>
                <div id="coins" className="text-3xl font-bold text-yellow-400">0</div>
              </div>
              
              <div className="bg-black/70 backdrop-blur-sm px-5 py-3 rounded-xl">
                <div className="text-gray-300 text-sm">DISTANCE</div>
                <div id="distance" className="text-3xl font-bold text-green-400">0m</div>
              </div>

              <div className="bg-black/70 backdrop-blur-sm px-5 py-3 rounded-xl">
                <div className="text-gray-300 text-sm">HEALTH</div>
                <div id="health" className="text-3xl font-bold text-red-400">100%</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* SPEED BAR - MOVED TO LEFT */}
        <div className="absolute top-1/2 left-6 transform -translate-y-1/2 z-50">
          <div className="bg-black/70 backdrop-blur-sm p-4 rounded-xl">
            <div className="text-white font-bold mb-2">SPEED</div>
            <div className="w-4 h-64 bg-gray-800 rounded-full overflow-hidden">
              <div id="speed-bar" className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all duration-300" 
                   style={{ height: '50%' }}></div>
            </div>
          </div>
        </div>
        
        {/* CONTROLS - MOVED TO RIGHT */}
        <div className="absolute bottom-6 right-6 z-50">
          <div className="bg-black/70 backdrop-blur-sm p-4 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-3">CONTROLS</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                <span className="text-white">LEFT</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold">D</div>
                <span className="text-white">RIGHT</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold">W</div>
                <span className="text-white">JUMP</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                <span className="text-white">SHARP LEFT</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold">R</div>
                <span className="text-white">SHARP RIGHT</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold">SPACE</div>
                <span className="text-white">JUMP</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-400 text-sm">💰 Collect coins for points</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-red-400 text-sm">⚔️ Avoid obstacles - lose health</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-green-400 text-sm">🏥 Hit coins for health</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Game Start Screen */}
        <div id="start-screen" className="absolute inset-0 z-40 flex items-center justify-center bg-black/80">
          <div className="bg-gradient-to-b from-amber-900 to-yellow-900 p-10 rounded-2xl text-center max-w-2xl">
            <h1 className="text-5xl font-bold text-yellow-400 mb-4">🏴‍☠️ PIRATE TEMPLE RUN</h1>
            <p className="text-xl text-yellow-200 mb-8">Navigate through ancient pirate islands and collect treasures!</p>
            
            <div className="space-y-4 mb-10">
              <div className="flex items-center justify-center gap-3 text-yellow-100">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">💎</div>
                <span>Collect coins to increase score and health</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-yellow-100">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">⚡</div>
                <span>Avoid obstacles - they reduce your health</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-yellow-100">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">🏥</div>
                <span>Some coins give +10 health</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-yellow-100">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">🏁</div>
                <span>Reach 740m to complete the level!</span>
              </div>
            </div>
            
            <button id="start-button" className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white text-2xl font-bold px-12 py-4 rounded-xl 
                    hover:from-yellow-500 hover:to-amber-500 transition-all transform hover:scale-105 active:scale-95">
              START RUN
            </button>
            
            <p className="text-gray-300 mt-6">
              Use A/D for normal movement | R/S for sharp turns<br/>
              W/SPACE to jump | Stay between the trail borders!<br/>
              Collect coins: +50 points, +10 health | Avoid obstacles: -20 health
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}