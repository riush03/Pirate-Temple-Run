// components/FlyingBird.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';

interface BirdProps {
  speed?: number;
}

export default function FlyingBird({ speed = 5 }: BirdProps) {
  const birdRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/assets/bird/scene.gltf');
  const { actions, mixer } = useAnimations(animations, birdRef);
  const [velocity, setVelocity] = useState(new THREE.Vector3(0, 0, 0));
  const [rotation, setRotation] = useState(new THREE.Euler(0, 0, 0));
  const [flapSpeed, setFlapSpeed] = useState(1);
  
  const keys = useKeyboardControls();
  const { camera } = useThree();

  // Initialize bird
  useEffect(() => {
    if (scene) {
      // Scale and position the bird
      scene.scale.set(0.5, 0.5, 0.5);
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }

    // Start flapping animation
    if (actions && animations.length > 0) {
      const flapAction = actions[Object.keys(actions)[0]];
      if (flapAction) {
        flapAction.play();
      }
    }

    return () => {
      mixer?.stopAllAction();
    };
  }, [scene, actions, animations, mixer]);

  useFrame((state, delta) => {
    if (!birdRef.current) return;

    // Movement input
    const moveVector = new THREE.Vector3(0, 0, 0);
    
    // Forward/backward
    if (keys.forward || keys.arrowUp) moveVector.z -= 1;
    if (keys.backward || keys.arrowDown) moveVector.z += 1;
    
    // Left/right (yaw)
    if (keys.left || keys.arrowLeft) moveVector.x -= 1;
    if (keys.right || keys.arrowRight) moveVector.x += 1;
    
    // Up/down
    if (keys.space) moveVector.y += 1;
    if (keys.shift) moveVector.y -= 1;

    // Normalize and apply speed
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(speed * delta);
      
      // Update velocity with damping
      setVelocity(v => {
        const newVelocity = v.clone().lerp(moveVector, 0.1);
        return newVelocity;
      });

      // Adjust flap speed based on forward movement
      const forwardSpeed = Math.abs(moveVector.z);
      setFlapSpeed(THREE.MathUtils.lerp(flapSpeed, 1 + forwardSpeed * 2, 0.1));
    } else {
      // Slow down when no input
      setVelocity(v => v.multiplyScalar(0.95));
    }

    // Apply velocity to position
    birdRef.current.position.x += velocity.x;
    birdRef.current.position.y += velocity.y;
    birdRef.current.position.z += velocity.z;

    // Calculate rotations
    const targetRotation = new THREE.Euler(
      // Pitch based on vertical velocity
      THREE.MathUtils.clamp(velocity.y * 0.5, -0.5, 0.5),
      // Yaw based on horizontal velocity
      Math.atan2(velocity.x, Math.abs(velocity.z) + 0.001),
      // Roll based on turning
      THREE.MathUtils.clamp(-velocity.x * 2, -1, 1)
    );

    // Smooth rotation
    setRotation(r => {
      r.x = THREE.MathUtils.lerp(r.x, targetRotation.x, 0.1);
      r.y = THREE.MathUtils.lerp(r.y, targetRotation.y, 0.1);
      r.z = THREE.MathUtils.lerp(r.z, targetRotation.z, 0.1);
      return r;
    });

    // Apply rotation
    birdRef.current.rotation.copy(rotation);

    // Update animation speed
    if (mixer) {
      mixer.timeScale = flapSpeed;
    }

    // Reset position with R key
    if (keys.r) {
      birdRef.current.position.set(0, 5, 0);
      setVelocity(new THREE.Vector3(0, 0, 0));
      setRotation(new THREE.Euler(0, 0, 0));
    }

    // Update UI stats
    updateStats();
  });

  const updateStats = () => {
    if (!birdRef.current) return;
    
    const speedElement = document.getElementById('speed');
    const altitudeElement = document.getElementById('altitude');
    const distanceElement = document.getElementById('distance');
    
    if (speedElement) {
      speedElement.textContent = `${velocity.length().toFixed(1)} m/s`;
    }
    if (altitudeElement) {
      altitudeElement.textContent = `${birdRef.current.position.y.toFixed(1)} m`;
    }
    if (distanceElement) {
      distanceElement.textContent = `${birdRef.current.position.length().toFixed(1)} m`;
    }
  };

  return (
    <group ref={birdRef} position={[0, 5, 0]}>
      {/* Bird Model */}
      <primitive 
        object={scene} 
        rotation={[0, Math.PI, 0]} // Face forward
      />
      
      {/* Trail effect */}
      <TrailEffect velocity={velocity} />
      
      {/* Speed indicator */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[0, 2, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {`${(velocity.length() * 20).toFixed(0)} km/h`}
        </Text>
      </Float>
    </group>
  );
}

// Trail Effect Component
function TrailEffect({ velocity }: { velocity: THREE.Vector3 }) {
  const trailRef = useRef<THREE.Points>(null);
  const points = useRef<THREE.Vector3[]>([]);
  
  useFrame(() => {
    if (trailRef.current && velocity.length() > 0.1) {
      const positions = trailRef.current.geometry.attributes.position.array as Float32Array;
      
      // Shift points
      for (let i = positions.length - 3; i >= 3; i -= 3) {
        positions[i] = positions[i - 3];
        positions[i + 1] = positions[i - 2];
        positions[i + 2] = positions[i - 1];
      }
      
      // Add new point at origin
      positions[0] = 0;
      positions[1] = 0;
      positions[2] = 0;
      
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={trailRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={20}
          array={new Float32Array(20 * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}