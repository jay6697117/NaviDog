import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SavedConnection } from '../../types';

interface PlanetNodeProps {
  connection: SavedConnection;
  orbitRadius: number;
  orbitSpeed: number;
  isActive: boolean;
  onSelect: () => void;
}

const DB_COLORS: Record<string, string> = {
  mysql: '#00758F',
  postgresql: '#336791',
  sqlite: '#003B57',
  default: '#722ed1',
};

export const PlanetNode: React.FC<PlanetNodeProps> = ({ connection, orbitRadius, orbitSpeed, isActive, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const dbType = connection.config.type || 'default';
  const color = DB_COLORS[dbType] || DB_COLORS.default;

  useFrame((_, delta) => {
    if (groupRef.current) {
      angleRef.current += orbitSpeed * delta;
      groupRef.current.position.x = Math.cos(angleRef.current) * orbitRadius;
      groupRef.current.position.z = Math.sin(angleRef.current) * orbitRadius;
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere
        args={[0.6, 24, 24]}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 0.8 : hovered ? 0.5 : 0.2} metalness={0.6} roughness={0.3} />
      </Sphere>
      {isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.05, 16, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      )}
      {(hovered || isActive) && (
        <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div className="planet-tooltip">
            <strong>{connection.name}</strong>
            <span>{dbType}://{connection.config.host}</span>
          </div>
        </Html>
      )}
    </group>
  );
};

export default PlanetNode;
