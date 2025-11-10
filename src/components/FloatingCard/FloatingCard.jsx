import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import './FloatingCard.css';

function Card() {
  const meshRef = useRef();

  // Rotating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[2, 3, 0.1]} />
      <meshStandardMaterial
        color="#1a1a2e"
        metalness={0.8}
        roughness={0.2}
      />

      {/* Front face - User Info */}
      <mesh position={[0, 0, 0.051]}>
        <planeGeometry args={[1.9, 2.9]} />
        <meshBasicMaterial color="#667eea" />
      </mesh>

      {/* Decorative elements */}
      <mesh position={[0, 0.8, 0.052]}>
        <boxGeometry args={[1.8, 0.5, 0.01]} />
        <meshBasicMaterial color="#764ba2" />
      </mesh>
    </mesh>
  );
}

export default function FloatingCard() {
  return (
    <div className="floating-card-wrapper">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        <Card />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
