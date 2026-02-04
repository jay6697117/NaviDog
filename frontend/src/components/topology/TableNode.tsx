import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { TopologyNode } from './useTopologyData';

interface TableNodeProps {
    node: TopologyNode;
    position: [number, number, number];
    onClick: () => void;
}

export const TableNode: React.FC<TableNodeProps> = ({ node, position, onClick }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Dynamic scale based on row count (logarithmic scale)
    // Base size 1.0, max size around 3.0
    const scale = Math.max(1, Math.min(3, 1 + Math.log10(node.rowCount + 1) * 0.4));

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            if (hovered) {
                meshRef.current.rotation.x += 0.01;
            }
        }
    });

    const color = hovered ? '#40a9ff' : '#1890ff';

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                scale={[scale, scale, scale]}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.8 : 0.4}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            {/* Label */}
            <Html distanceFactor={15} position={[0, scale + 0.5, 0]} center>
                <div style={{
                    background: 'rgba(0,0,0,0.6)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    backdropFilter: 'blur(4px)',
                    border: hovered ? '1px solid #1890ff' : '1px solid transparent',
                    pointerEvents: 'none'
                }}>
                    <div style={{ fontWeight: 'bold' }}>{node.name}</div>
                    <div style={{ fontSize: '10px', color: '#ccc' }}>{node.rowCount.toLocaleString()} rows</div>
                </div>
            </Html>

            {/* Simple Rings for visual flair on large tables */}
            {node.rowCount > 10000 && (
                 <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[scale * 1.4, scale * 1.5, 64]} />
                    <meshBasicMaterial color="#40a9ff" opacity={0.3} transparent side={THREE.DoubleSide} />
                 </mesh>
            )}
        </group>
    );
};
