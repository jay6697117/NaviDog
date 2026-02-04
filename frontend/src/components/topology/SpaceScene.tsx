import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { StarField } from './StarField';
import { CentralNode } from './CentralNode';
import { PlanetNode } from './PlanetNode';
import { OrbitLine } from './OrbitLine';
import { useStore } from '../../store';

const LoadingFallback: React.FC = () => (
  <mesh>
    <sphereGeometry args={[0.5, 16, 16]} />
    <meshBasicMaterial color="#1890ff" wireframe />
  </mesh>
);

export const SpaceScene: React.FC = () => {
  const { connections, activeContext } = useStore();

  const handleSelectConnection = (connectionId: string) => {
    console.log('Selected connection:', connectionId);
  };

  return (
    <div className="topology-canvas" style={{ width: '100%', height: '100%' }}>
      <Canvas style={{ background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000008 100%)' }}>
        <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={50} />
        <OrbitControls enablePan={false} minDistance={10} maxDistance={50} autoRotate autoRotateSpeed={0.3} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#722ed1" />
        <Suspense fallback={<LoadingFallback />}>
          <StarField count={2000} />
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
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SpaceScene;
