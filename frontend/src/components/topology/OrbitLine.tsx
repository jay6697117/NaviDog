import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbitLineProps {
  radius: number;
  color?: string;
  active?: boolean;
}

export const OrbitLine: React.FC<OrbitLineProps> = ({ radius, color = '#334155', active = false }) => {
  const lineRef = useRef<THREE.Line>(null);

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [radius]);

  const material = useMemo(() => {
    const mat = new THREE.LineDashedMaterial({
      color: active ? '#1890ff' : color,
      dashSize: active ? 0.5 : 1000,
      gapSize: active ? 0.3 : 0,
      transparent: true,
      opacity: active ? 0.8 : 0.3,
    });
    return mat;
  }, [active, color]);

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.computeLineDistances();
    }
  }, [geometry]);

  useFrame((state) => {
    if (active && lineRef.current) {
      const mat = lineRef.current.material as THREE.LineDashedMaterial;
      if (mat && 'dashOffset' in mat) {
        (mat as any).dashOffset = -state.clock.elapsedTime * 2;
      }
    }
  });

  return (
    <primitive object={new THREE.Line(geometry, material)} ref={lineRef} />
  );
};

export default OrbitLine;
