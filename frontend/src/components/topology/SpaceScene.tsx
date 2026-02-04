import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { StarField } from './StarField';
import { CentralNode } from './CentralNode';
import { PlanetNode } from './PlanetNode';
import { OrbitLine } from './OrbitLine';
import { TableNode } from './TableNode'; // Import New Component
import { useStore } from '../../store';
import { useTopologyData, TopologyNode } from './useTopologyData';
import { Spin } from 'antd';

const LoadingFallback: React.FC = () => (
  <Html center>
     <Spin tip="Loading Universe..." />
  </Html>
);

export const SpaceScene: React.FC = () => {
    const { connections, activeContext, addTab } = useStore();
    const { nodes: tableNodes, links: tableLinks, loading: tableLoading, error } = useTopologyData();

    // ... (rest of code) ...


    // Layout Logic for Tables
    const tablePositions = useMemo(() => {
         const positions: Record<string, [number, number, number]> = {};
         const count = tableNodes.length;

         if (count === 0) return {};

         // Use a flat ring layout for fewer nodes (better visibility)
         if (count < 20) {
             const radius = 12; // Tightened from 15
             tableNodes.forEach((node, i) => {
                 const angle = (i / count) * Math.PI * 2;
                 const x = Math.cos(angle) * radius;
                 const z = Math.sin(angle) * radius;
                 positions[node.id] = [x, 0, z];
             });
         } else {
             // Fibonacci Sphere for many nodes
             const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
             tableNodes.forEach((node, i) => {
                 const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
                 const radius = Math.sqrt(1 - y * y); // radius at y
                 const theta = phi * i; // golden angle increment

                 const r = 20; // Sphere radius
                 const x = Math.cos(theta) * radius * r;
                 const z = Math.sin(theta) * radius * r;

                 // Avoid NaN for single node (covered by count < 20, but safe to keep)
                 if (count === 1) { positions[node.id] = [0, 0, 0]; }
                 else { positions[node.id] = [x, y * r, z]; }
             });
         }
         return positions;
    }, [tableNodes]);

    const handleTableClick = (node: TopologyNode) => {
         if (!activeContext) return;
         const { connectionId, dbName } = activeContext;

         // Match Sidebar Logic for ID and Title
         addTab({
            id: `${connectionId}-${dbName}-${node.name}`,
            title: node.name,
            type: 'table',
            connectionId: connectionId,
            dbName: dbName,
            tableName: node.name,
         });
    };

    const handleSelectConnection = (connectionId: string) => {
         // Maybe switch context?
         console.log('Selected connection:', connectionId);
    };

    // Mode determination
    const isTableMode = !!activeContext && tableNodes.length > 0;

    return (
        <div className="topology-canvas" style={{ width: '100%', height: '100%' }}>
        <Canvas style={{ background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000008 100%)' }}>
            {/* Adjusted Camera for steeper look */}
            <PerspectiveCamera makeDefault position={[0, 35, 30]} fov={50} />
            <OrbitControls
                enablePan={true}
                minDistance={10}
                maxDistance={100}
                autoRotate={!isTableMode} // Only rotate in galaxy mode, table mode better static or slow
                autoRotateSpeed={0.5}
            />
            <ambientLight intensity={0.4} />
            <pointLight position={[20, 20, 20]} intensity={1} />
            <pointLight position={[-20, -20, -20]} intensity={0.5} color="#722ed1" />

            <Suspense fallback={<LoadingFallback />}>
                <StarField count={3000} />

                {isTableMode ? (
                     <group>
                         {/* Central Database Sun Node */}
                         <mesh position={[0,0,0]}>
                             <sphereGeometry args={[4, 32, 32]} />
                             <meshStandardMaterial
                                color="#faad14"
                                emissive="#faad14"
                                emissiveIntensity={0.6}
                                roughness={0.2}
                             />
                         </mesh>
                         <Html position={[0, 5, 0]} center>
                            <div style={{
                                color: '#faad14',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                textShadow: '0 0 10px rgba(0,0,0,0.8)',
                                background: 'rgba(0,0,0,0.6)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                pointerEvents: 'none'
                            }}>
                                {activeContext?.dbName || 'Database'}
                            </div>
                         </Html>

                         {/* Table Nodes */}
                         {tableNodes.map(node => (
                             <TableNode
                                key={node.id}
                                node={node}
                                position={tablePositions[node.id] || [0,0,0]}
                                onClick={() => handleTableClick(node)}
                             />
                         ))}

                         {/* Links (Foreign Keys) */}
                         {tableLinks.map((link, i) => {
                             const start = tablePositions[link.source];
                             const end = tablePositions[link.target];
                             if (!start || !end) return null;

                             return (
                                 <Line
                                    key={i}
                                    points={[start, end]}
                                    color="#1890ff"
                                    opacity={0.2}
                                    transparent
                                    lineWidth={1}
                                />
                             );
                         })}
                     </group>
                ) : (
                    <group>
                        {/* Old Connection Galaxy View */}
                        <CentralNode />
                        {connections.map((conn, i) => {
                            const orbitRadius = 6 + i * 2.5;
                            const isActive = activeContext?.connectionId === conn.id;
                            return (
                            <group key={conn.id}>
                                <OrbitLine radius={orbitRadius} active={isActive} />
                                <PlanetNode connection={conn} orbitRadius={orbitRadius} orbitSpeed={0.2 / (i + 1)} isActive={isActive} onSelect={() => handleSelectConnection(conn.id)} />
                            </group>
                            );
                        })}
                    </group>
                )}

            </Suspense>
        </Canvas>

        {/* Error Overlay */}
        {isTableMode && error && (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.5)',
                zIndex: 10,
                color: '#ff4d4f',
                fontSize: '16px',
                fontWeight: 'bold',
                flexDirection: 'column',
                gap: 10
            }}>
                <div style={{ fontSize: '24px' }}>⚠️</div>
                <div>Topology Error</div>
                <div style={{ fontSize: '12px', fontWeight: 'normal', opacity: 0.8 }}>{error}</div>
            </div>
        )}

        {/* Error Overlay */}
        {isTableMode && error && (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.5)',
                zIndex: 10,
                color: '#ff4d4f',
                fontSize: '16px',
                fontWeight: 'bold',
                flexDirection: 'column',
                gap: 10
            }}>
                <div style={{ fontSize: '24px' }}>⚠️</div>
                <div>Topology Error</div>
                <div style={{ fontSize: '12px', fontWeight: 'normal', opacity: 0.8 }}>{error}</div>
            </div>
        )}

        {/* Loading Overlay for Table Mode */}
        {isTableMode && tableLoading && (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.5)',
                zIndex: 10,
                color: '#1890ff',
                fontSize: '16px',
                fontWeight: 'bold',
                flexDirection: 'column',
                gap: 10
            }}>
                <Spin size="large" />
                <div>Loading Table Galaxy...</div>
            </div>
        )}
        </div>
    );
};

export default SpaceScene;
