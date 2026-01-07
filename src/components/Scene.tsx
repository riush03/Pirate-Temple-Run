'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Custom keyboard controls hook
function useGameControls() {
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
    shift: false,
    pause: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys(prev => ({
        ...prev,
        forward: key === 'w' || e.key === 'ArrowUp',
        backward: key === 's' || e.key === 'ArrowDown',
        left: key === 'a' || e.key === 'ArrowLeft',
        right: key === 'd' || e.key === 'ArrowRight',
        space: e.code === 'Space',
        shift: e.shiftKey,
        pause: e.code === 'KeyP' || e.code === 'Escape',
      }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys(prev => ({
        ...prev,
        forward: (key === 'w' || e.key === 'ArrowUp') ? false : prev.forward,
        backward: (key === 's' || e.key === 'ArrowDown') ? false : prev.backward,
        left: (key === 'a' || e.key === 'ArrowLeft') ? false : prev.left,
        right: (key === 'd' || e.key === 'ArrowRight') ? false : prev.right,
        space: e.code === 'Space' ? false : prev.space,
        shift: e.shiftKey ? false : prev.shift,
        pause: (e.code === 'KeyP' || e.code === 'Escape') ? false : prev.pause,
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}

// Load GLTF environment model
function GLTFModel() {
  const { scene } = useGLTF('/assets/environment/scene.gltf');
  const modelRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (scene) {
      console.log('Environment model loaded successfully');
      
      // Scale down the massive model
      scene.scale.set(0.01, 0.01, 0.01);
      scene.position.set(0, -5, 0);
      scene.rotation.y = Math.PI;
      
      // Enable shadows
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Improve material rendering
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: THREE.Material) => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.roughness = 0.7;
                  mat.metalness = 0.1;
                }
              });
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.roughness = 0.7;
              child.material.metalness = 0.1;
            }
          }
        }
      });
    }
  }, [scene]);
  
  if (!scene) return null;
  
  return <primitive ref={modelRef} object={scene} />;
}

// Load Pirate Model
function PirateModel({ position, onHit }: { position: [number, number, number], onHit: () => void }) {
  const { scene } = useGLTF('/assets/pirate/pirate.glb');
  const pirateRef = useRef<THREE.Group>(null);
  const [isHit, setIsHit] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  
  useEffect(() => {
    if (scene) {
      // Scale and position pirate
      scene.scale.set(0.5, 0.5, 0.5);
      scene.position.set(0, 0, 0);
      
      // Make pirate face the player (facing forward, not backwards)
      scene.rotation.y = 0; // Changed from Math.PI to 0
      
      // Enable shadows
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);
  
  useFrame((state) => {
    if (!pirateRef.current || isHit) return;
    
    // Animate pirate - bob up and down
    pirateRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    
    // Random attack animation
    if (Math.random() < 0.01 && !isAttacking) {
      setIsAttacking(true);
      setTimeout(() => setIsAttacking(false), 1000);
    }
    
    // Attack animation
    if (isAttacking) {
      pirateRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.1;
    }
  });
  
  if (!scene) return null;
  
  return (
    <group ref={pirateRef} position={position}>
      <primitive object={scene} />
      
      {/* Attack sword effect */}
      {isAttacking && (
        <mesh position={[0, 1, -1]}>
          <boxGeometry args={[0.1, 0.1, 1]} />
          <meshStandardMaterial 
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      
      {/* Hit effect */}
      {isHit && (
        <points position={[0, 1, 0]}>
          <sphereGeometry args={[1, 8, 6]} />
          <pointsMaterial 
            color="#ff9900" 
            size={0.2} 
            transparent 
            opacity={0.7}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  );
}

// Mario Player Model Component
function MarioPlayer() {
  const { scene } = useGLTF('/assets/player/mario.glb');
  const playerRef = useRef<THREE.Group>(null);
  const swordRef = useRef<THREE.Mesh>(null);
  const [velocity, setVelocity] = useState(new THREE.Vector3(0, 0, 0));
  const [isJumping, setIsJumping] = useState(false);
  const [lane, setLane] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [forwardSpeed, setForwardSpeed] = useState(15);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [hitCooldown, setHitCooldown] = useState(false);
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [animationMixer, setAnimationMixer] = useState<THREE.AnimationMixer | null>(null);
  const [currentAction, setCurrentAction] = useState<string>('idle');
  
  const keys = useGameControls();
  const { camera } = useThree();
  
  // Load and setup Mario model
  useEffect(() => {
    if (scene) {
      console.log('Mario model loaded successfully');
      
      // Scale down Mario to make him much smaller (0.1 scale)
      scene.scale.set(0.01, 0.01, 0.01);
      scene.position.set(0, -0.09, 0); // Adjusted position to make legs touch ground
      
      // FIXED: Rotate Mario to face forward (removed rotation)
      scene.rotation.y = 0; // Changed from Math.PI to 0
      
      // Enable shadows
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Setup animations if available
      if (scene.animations && scene.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(scene);
        setAnimationMixer(mixer);
        
        // Play idle animation by default
        const idleAction = mixer.clipAction(scene.animations[0]);
        idleAction.play();
        setCurrentAction('idle');
      }
    }
  }, [scene]);
  
  // Listen for game start
  useEffect(() => {
    const startButton = document.getElementById('start-button');
    const startScreen = document.getElementById('start-screen');
    
    const handleStart = () => {
      console.log('Game started!');
      setGameActive(true);
      setIsPaused(false);
      if (startScreen) {
        startScreen.style.display = 'none';
      }
    };
    
    if (startButton) {
      startButton.addEventListener('click', handleStart);
    }
    
    return () => {
      if (startButton) {
        startButton.removeEventListener('click', handleStart);
      }
    };
  }, []);
  
  // Handle pause functionality
  useEffect(() => {
    if (keys.pause && gameActive) {
      setIsPaused(!isPaused);
      console.log(isPaused ? 'Game resumed' : 'Game paused');
    }
  }, [keys.pause, gameActive]);
  
  // Update animations and game logic
  useFrame((state, delta) => {
    if (animationMixer) {
      animationMixer.update(delta);
    }
    
    if (!playerRef.current || !gameActive || isPaused) return;
    
    // Check if player reached the end of trail (-200 is the end position)
    if (playerRef.current.position.z <= -745) {
      gameOver('🎉 LEVEL COMPLETE!', 'green');
      return;
    }
    
    // Increase speed over time
    setForwardSpeed(prev => Math.min(prev + delta * 0.05, 25));
    
    // Lane switching - REVERSED CONTROLS
    if (keys.left && lane < 1) { // A moves RIGHT
      setLane(prev => prev + 1);
    }
    if (keys.right && lane > -1) { // D moves LEFT
      setLane(prev => prev - 1);
    }
    
    // Attack with spacebar
    if (keys.space && !hitCooldown) {
      setIsAttacking(true);
      setHitCooldown(true);
      
      // Attack animation
      setTimeout(() => setIsAttacking(false), 300);
      setTimeout(() => setHitCooldown(false), 500);
      
      // Check for pirate hits
      checkPirateHits();
      
      // Play attack animation if available
      if (animationMixer && scene?.animations && scene.animations.length > 1) {
        animationMixer.stopAllAction();
        const attackAction = animationMixer.clipAction(scene.animations[1]);
        attackAction.play();
        setCurrentAction('attack');
        
        // Return to idle after attack
        setTimeout(() => {
          if (animationMixer && scene?.animations) {
            animationMixer.stopAllAction();
            const idleAction = animationMixer.clipAction(scene.animations[0]);
            idleAction.play();
            setCurrentAction('idle');
          }
        }, 300);
      }
    }
    
    // Slide with S key
    if (keys.backward && !isJumping) {
      setIsSliding(true);
      // Play slide animation if available
      if (animationMixer && scene?.animations && scene.animations.length > 2 && currentAction !== 'slide') {
        animationMixer.stopAllAction();
        const slideAction = animationMixer.clipAction(scene.animations[2]);
        slideAction.play();
        setCurrentAction('slide');
      }
    } else if (currentAction === 'slide') {
      setIsSliding(false);
      // Return to idle
      if (animationMixer && scene?.animations) {
        animationMixer.stopAllAction();
        const idleAction = animationMixer.clipAction(scene.animations[0]);
        idleAction.play();
        setCurrentAction('idle');
      }
    }
    
    // Jump with W key
    if (keys.forward && !isJumping) {
      setVelocity(v => new THREE.Vector3(v.x, 6, v.z)); // Reduced jump height for smaller character
      setIsJumping(true);
      
      // Play jump animation if available
      if (animationMixer && scene?.animations && scene.animations.length > 3) {
        animationMixer.stopAllAction();
        const jumpAction = animationMixer.clipAction(scene.animations[3]);
        jumpAction.play();
        setCurrentAction('jump');
      }
    }
    
    // Apply gravity
    setVelocity(v => {
      v.y -= 18 * delta; // Reduced gravity for smaller character
      if (playerRef.current!.position.y <= 0) { // Adjusted ground level to 0 (path level is -4.9)
        v.y = 0;
        playerRef.current!.position.y = 0;
        setIsJumping(false);
        
        // Return to idle after landing
        if (isJumping && animationMixer && scene?.animations) {
          animationMixer.stopAllAction();
          const idleAction = animationMixer.clipAction(scene.animations[0]);
          idleAction.play();
          setCurrentAction('idle');
        }
      }
      return v;
    });
    
    // Update position
    const targetX = lane * 3;
    const currentX = playerRef.current.position.x;
    playerRef.current.position.x = THREE.MathUtils.lerp(currentX, targetX, 0.2);
    playerRef.current.position.y += velocity.y * delta;
    
    // Move player forward (negative Z direction)
    playerRef.current.position.z -= forwardSpeed * delta;
    
    // Update distance traveled
    setDistanceTraveled(prev => prev + forwardSpeed * delta);
    
    // Attack animation for sword
    if (swordRef.current) {
      if (isAttacking) {
        swordRef.current.visible = true;
        swordRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 20) * 0.5;
      } else {
        swordRef.current.visible = false;
      }
    }
    
    // Walking animation when moving
    if (!isJumping && !isSliding && forwardSpeed > 0) {
      // Simple walking bounce
      playerRef.current.position.y = Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
    
    // Camera follow - adjusted for much smaller character
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerRef.current.position.x * 0.5, 0.1);
    camera.position.z = playerRef.current.position.z + 10; // Camera behind player
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, playerRef.current.position.y + 2, 0.1);
    camera.lookAt(
      playerRef.current.position.x,
      playerRef.current.position.y + 0.5,
      playerRef.current.position.z - 3 // Look ahead of player
    );
    
    // Update game UI
    updateGameUI(distanceTraveled, forwardSpeed, score, health, isPaused);
    
    // Check for collisions with pirates
    checkPirateCollisions();
  });
  
  const checkPirateHits = () => {
    setScore(prev => prev + 50);
    console.log('Pirate hit! +50 points');
  };
  
  const checkPirateCollisions = () => {
    if (Math.random() < 0.01 && health > 0) {
      setHealth(prev => Math.max(0, prev - 5));
      
      if (health <= 0) {
        gameOver('🏴‍☠️ GAME OVER!', 'red');
      }
    }
  };
  
  const gameOver = (title: string, color: string) => {
    setGameActive(false);
    setIsPaused(false);
    
    const gameOverScreen = document.createElement('div');
    gameOverScreen.id = 'game-over-screen';
    gameOverScreen.className = 'absolute inset-0 z-50 flex items-center justify-center bg-black/90';
    
    const colorClass = color === 'green' ? 'from-green-900 to-green-800' : 'from-red-900 to-red-800';
    
    gameOverScreen.innerHTML = `
      <div class="bg-gradient-to-b ${colorClass} p-10 rounded-2xl text-center max-w-md">
        <h1 class="text-4xl font-bold text-white mb-4">${title}</h1>
        ${color === 'green' 
          ? '<p class="text-xl text-green-200 mb-6">You reached the end of the trail!</p>' 
          : '<p class="text-xl text-red-200 mb-6">You were defeated by pirates!</p>'}
        <p class="text-lg text-yellow-200 mb-4">Final Score: ${score}</p>
        <p class="text-lg text-yellow-200 mb-8">Distance: ${Math.floor(distanceTraveled)}m</p>
        <div class="flex gap-4 justify-center">
          <button onclick="window.location.reload()" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold px-8 py-3 rounded-xl 
                  hover:from-blue-500 hover:to-purple-500 transition-all transform hover:scale-105 active:scale-95">
            PLAY AGAIN
          </button>
          <button onclick="document.getElementById('game-over-screen').remove();" class="bg-gradient-to-r from-gray-600 to-gray-700 text-white text-xl font-bold px-8 py-3 rounded-xl 
                  hover:from-gray-500 hover:to-gray-600 transition-all transform hover:scale-105 active:scale-95">
            CLOSE
          </button>
        </div>
      </div>
    `;
    document.querySelector('main')?.appendChild(gameOverScreen);
  };
  
  const updateGameUI = (distance: number, speed: number, currentScore: number, currentHealth: number, paused: boolean) => {
    const scoreElement = document.getElementById('score');
    const distanceElement = document.getElementById('distance');
    const healthElement = document.getElementById('health');
    const speedBar = document.getElementById('speed-bar');
    const pauseElement = document.getElementById('pause-indicator');
    
    if (scoreElement) scoreElement.textContent = currentScore.toString();
    if (distanceElement) distanceElement.textContent = `${Math.floor(distance)}m`;
    if (healthElement) {
      healthElement.textContent = `${currentHealth}%`;
      healthElement.className = `text-3xl font-bold ${currentHealth > 50 ? 'text-green-400' : currentHealth > 20 ? 'text-yellow-400' : 'text-red-400'}`;
    }
    if (speedBar) {
      const speedPercent = Math.min(speed, 25) / 25 * 100;
      speedBar.style.height = `${speedPercent}%`;
    }
    if (pauseElement) {
      pauseElement.style.display = paused ? 'block' : 'none';
    }
  };
  
  // Show pause screen
  useEffect(() => {
    if (isPaused) {
      const pauseScreen = document.createElement('div');
      pauseScreen.id = 'pause-screen';
      pauseScreen.className = 'absolute inset-0 z-40 flex items-center justify-center bg-black/70';
      pauseScreen.innerHTML = `
        <div class="bg-gradient-to-b from-blue-900 to-blue-800 p-10 rounded-2xl text-center max-w-md">
          <h1 class="text-4xl font-bold text-white mb-4">⏸️ GAME PAUSED</h1>
          <p class="text-xl text-blue-200 mb-6">Press P or ESC to resume</p>
          <div class="text-lg text-yellow-200 mb-4">
            <p>Current Score: ${score}</p>
            <p>Distance: ${Math.floor(distanceTraveled)}m</p>
            <p>Health: ${health}%</p>
          </div>
          <div class="flex gap-4 justify-center mt-6">
            <button onclick="document.getElementById('pause-screen').remove(); setIsPaused(false);" class="bg-gradient-to-r from-green-600 to-teal-600 text-white text-xl font-bold px-8 py-3 rounded-xl 
                    hover:from-green-500 hover:to-teal-500 transition-all transform hover:scale-105 active:scale-95">
              RESUME
            </button>
            <button onclick="window.location.reload()" class="bg-gradient-to-r from-red-600 to-orange-600 text-white text-xl font-bold px-8 py-3 rounded-xl 
                    hover:from-red-500 hover:to-orange-500 transition-all transform hover:scale-105 active:scale-95">
              RESTART
            </button>
          </div>
        </div>
      `;
      if (!document.getElementById('pause-screen')) {
        document.querySelector('main')?.appendChild(pauseScreen);
      }
    } else {
      const pauseScreen = document.getElementById('pause-screen');
      if (pauseScreen) {
        pauseScreen.remove();
      }
    }
  }, [isPaused, score, distanceTraveled, health]);
  
  if (!scene) return null;
  
  return (
    <group ref={playerRef} position={[0, 0, 0]}>
      <primitive object={scene} />
      
      {/* Attack sword - position adjusted for forward-facing character */}
      <mesh 
        ref={swordRef} 
        position={[0, 0.3, 0.2]} // Changed from -0.2 to 0.2 (in front instead of behind)
        rotation={[Math.PI / 4, 0, 0]}
        scale={[0.5, 0.5, 0.5]}
        visible={false}
      >
        <boxGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Health aura when low */}
      {health < 30 && (
        <points position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.5, 8, 6]} />
          <pointsMaterial 
            color="#ff0000" 
            size={0.1} 
            transparent 
            opacity={0.3}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  );
}

// Preload models
function PreloadModels() {
  useGLTF.preload('/assets/environment/scene.gltf');
  useGLTF.preload('/assets/pirate/pirate.glb');
  useGLTF.preload('/assets/player/mario.glb');
  return null;
}

// World with sandy path (no blue stripes)
function GameWorld() {
  const [gameActive] = useState(true);
  
  return (
    <group>
      {/* GLTF Terrain in background */}
      <GLTFModel />
      
      {/* Sandy path */}
      <SandyPath />
      
      {/* Side terrain */}
      <SideTerrain />
      
      {/* End of trail marker */}
      {gameActive && (
        <mesh position={[0, 2, -200]}>
          <boxGeometry args={[6, 0.3, 0.3]} />
          <meshStandardMaterial 
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={0.5}
          />
          <pointLight color="#00ff00" intensity={1} distance={5} />
        </mesh>
      )}
    </group>
  );
}

function SandyPath() {
  return (
    <>
      {/* Main sandy path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.9, -200]} receiveShadow>
        <planeGeometry args={[6, 400, 20, 40]} />
        <meshStandardMaterial 
          color="#d4a574"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Path borders */}
      <mesh position={[-3, -4, -200]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 1, 400]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[3, -4, -200]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 1, 400]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* End of trail visual marker */}
      <mesh position={[0, -4.5, -200]}>
        <boxGeometry args={[6.5, 0.1, 0.5]} />
        <meshStandardMaterial 
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
    </>
  );
}

function SideTerrain() {
  return (
    <>
      {/* Left side terrain - green grass */}
      <mesh position={[-20, -5, -200]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 400]} />
        <meshStandardMaterial color="#228B22" roughness={0.9} />
      </mesh>
      
      {/* Right side terrain - green grass */}
      <mesh position={[20, -5, -200]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 400]} />
        <meshStandardMaterial color="#228B22" roughness={0.9} />
      </mesh>
    </>
  );
}

// Pirates along the path - scaled down to match smaller Mario
function Pirates() {
  const piratesRef = useRef<THREE.Group>(null);
  const [piratePositions] = useState(() => {
    const positions = [];
    for (let i = 0; i < 8; i++) {
      positions.push({
        id: i,
        x: (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.5 ? 2 : 0.5),
        z: -i * 50 - 50,
        health: 100,
        active: true
      });
    }
    return positions;
  });
  
  return (
    <group ref={piratesRef}>
      {piratePositions.map((pirate) => (
        <PirateModel 
          key={pirate.id} 
          position={[pirate.x, 0, pirate.z]} 
          onHit={() => console.log(`Pirate ${pirate.id} hit!`)}
        />
      ))}
    </group>
  );
}

// Obstacles on the sandy path - scaled down
function Obstacles() {
  const obstaclesRef = useRef<THREE.Group>(null);
  
  const obstacles = [
    { x: -2, z: -80, type: 'barrel', color: '#8B4513', scale: 0.6 },
    { x: 1.5, z: -120, type: 'crate', color: '#654321', scale: 0.6 },
    { x: 0, z: -160, type: 'barrel', color: '#8B4513', scale: 0.6 },
    { x: 2, z: -200, type: 'crate', color: '#654321', scale: 0.6 },
    { x: -1.5, z: -240, type: 'barrel', color: '#8B4513', scale: 0.6 },
    { x: 0.5, z: -280, type: 'crate', color: '#654321', scale: 0.6 },
  ];
  
  useFrame((state) => {
    if (!obstaclesRef.current) return;
    
    // Animate obstacles
    obstaclesRef.current.children.forEach((child, index) => {
      child.rotation.y = state.clock.elapsedTime * 0.5;
      child.position.y = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1 + 0.3;
    });
  });
  
  return (
    <group ref={obstaclesRef}>
      {obstacles.map((obs, index) => (
        <mesh 
          key={index} 
          position={[obs.x, 0.3, obs.z]} 
          scale={[obs.scale, obs.scale, obs.scale]}
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={obs.color}
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Treasure coins to collect - scaled down
function TreasureCoins() {
  const coinsRef = useRef<THREE.Group>(null);
  
  const coinPositions = [];
  for (let i = 0; i < 25; i++) {
    coinPositions.push({
      id: i,
      x: (Math.random() - 0.5) * 4,
      z: -i * 15 - 30,
    });
  }
  
  useFrame((state) => {
    if (!coinsRef.current) return;
    
    // Animate coins
    coinsRef.current.children.forEach((child, index) => {
      child.rotation.y = state.clock.elapsedTime * 2;
      child.position.y = Math.sin(state.clock.elapsedTime * 3 + index) * 0.1 + 0.2;
    });
  });
  
  return (
    <group ref={coinsRef}>
      {coinPositions.map((coin) => (
        <mesh 
          key={coin.id} 
          position={[coin.x, 0.2, coin.z]}
          scale={[0.5, 0.5, 0.5]}
        >
          <torusGeometry args={[0.15, 0.04, 8, 16]} />
          <meshStandardMaterial 
            color="#ffd700"
            emissive="#ffaa00"
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.1}
          />
          <pointLight color="#ffaa00" intensity={0.2} distance={1} />
        </mesh>
      ))}
    </group>
  );
}

// Pause UI Component
function PauseIndicator() {
  return (
    <div id="pause-indicator" className="absolute top-4 right-4 hidden">
      <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
        ⏸️ PAUSED
      </div>
    </div>
  );
}

// Main Scene Component
export default function Scene() {
  return (
    <>
      <PreloadModels />
      <PauseIndicator />
      <Canvas
        shadows
        camera={{ position: [0, 3, 15], fov: 60 }}
        className="touch-none"
      >
        {/* Scene Setup */}
        <color attach="background" args={['#87CEEB']} />
        <fog attach="fog" args={['#87CEEB', 10, 150]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        {/* Environment */}
        <Sky
          distance={450000}
          sunPosition={[100, 20, 100]}
          inclination={0}
          azimuth={0.25}
        />
        <Stars radius={100} depth={50} count={3000} factor={4} />
        <Environment preset="sunset" />
        
        {/* Game Elements */}
        <MarioPlayer />
        <GameWorld />
        <Pirates />
        <Obstacles />
        <TreasureCoins />
      </Canvas>
    </>
  );
}