import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

export const CentralNode: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[1.5, 32, 32]}>
        <meshStandardMaterial color="#1890ff" emissive="#1890ff" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
      </Sphere>
      <Sphere ref={glowRef} args={[1.8, 32, 32]}>
        <meshBasicMaterial color="#1890ff" transparent opacity={0.15} />
      </Sphere>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.03, 16, 64]} />
        <meshBasicMaterial color="#1890ff" transparent opacity={0.4} />
      </mesh>
      <Text position={[0, -2.8, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        GoNavi
      </Text>
    </group>
  );
};

export default CentralNode;
