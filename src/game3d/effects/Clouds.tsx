import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MAP_SIZE } from '../types';

const CLOUD_COUNT = 8;

function CloudCluster({ seed, baseX, baseZ }: { seed: number; baseX: number; baseZ: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const speed = 0.02 + (seed % 5) * 0.01;
  const startX = baseX;

  const spheres = useMemo(() => {
    const count = 3 + (seed % 4);
    const parts: { offset: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < count; i++) {
      const r = seed * 7 + i * 13;
      parts.push({
        offset: [
          ((r * 1.1) % 3) - 1.5,
          0.2 + ((r * 2.3) % 1.5),
          ((r * 3.7) % 2) - 1,
        ],
        scale: 0.6 + ((r * 0.7) % 0.8),
      });
    }
    return parts;
  }, [seed]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.x += speed * delta;
    if (groupRef.current.position.x > MAP_SIZE + 20) {
      groupRef.current.position.x = -20;
    }
  });

  return (
    <group ref={groupRef} position={[startX, 8 + (seed % 3) * 2, baseZ]}>
      {spheres.map((s, i) => (
        <mesh key={i} position={s.offset} scale={s.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={0xffffff} transparent opacity={0.7} roughness={1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

export function Clouds() {
  const clusters = useMemo(() => {
    const arr: { seed: number; x: number; z: number }[] = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
      arr.push({
        seed: i * 17 + 3,
        x: Math.random() * MAP_SIZE,
        z: Math.random() * MAP_SIZE * 0.6 + MAP_SIZE * 0.2,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {clusters.map((c, i) => (
        <CloudCluster key={i} seed={c.seed} baseX={c.x} baseZ={c.z} />
      ))}
    </group>
  );
}
