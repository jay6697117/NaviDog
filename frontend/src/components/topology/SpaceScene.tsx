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
    const { nodes: tableNodes, links: tableLinks, loading: tableLoading } = useTopologyData();

    // Layout Logic for Tables
    // Simple spherical distribution for now to avoid complex d3-force in 3D (though that would be better later)
    const tablePositions = useMemo(() => {
         const positions: Record<string, [number, number, number]> = {};
         const count = tableNodes.length;
         const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

         tableNodes.forEach((node, i) => {
             const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
             const radius = Math.sqrt(1 - y * y); // radius at y
             const theta = phi * i; // golden angle increment

             const r = 20; // Sphere radius
             const x = Math.cos(theta) * radius * r;
             const z = Math.sin(theta) * radius * r;

             // Avoid NaN for single node
             if (count === 1) { positions[node.id] = [0, 0, 0]; }
             else { positions[node.id] = [x, y * r, z]; }
         });
         return positions;
    }, [tableNodes]);

    const handleTableClick = (node: TopologyNode) => {
         if (!activeContext) return;
         // Open Table Tab
         const { connectionId, dbName } = activeContext;
         addTab({
            id: `design-${connectionId}-${dbName}-${node.name}`,
            title: `表结构 (${node.name})`,
            type: 'design',
            connectionId: connectionId,
            dbName: dbName,
            tableName: node.name,
            initialTab: 'data', // Directly open data view
            readOnly: false
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
            <PerspectiveCamera makeDefault position={[0, 20, 40]} fov={50} />
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

                         {/* Central Sun for Context (Optional) */}
                         <mesh position={[0,0,0]}>
                             <sphereGeometry args={[2, 32, 32]} />
                             <meshBasicMaterial color="#ffec3d" transparent opacity={0.1} />
                         </mesh>
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
