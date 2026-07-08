import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MAP_SIZE } from '../types';

interface CloudData {
  x: number;
  y: number;
  z: number;
  scale: number;
  seed: number;
}

function Cloud({ data }: { data: CloudData }) {
  const ref = useRef<THREE.Group>(null!);
  const speed = 0.1 + data.seed * 0.05;

  const mesh = useMemo(() => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.4,
      metalness: 0,
    });

    const count = 4 + (data.seed % 3);
    for (let i = 0; i < count; i++) {
      const size = 1 + (data.seed * (i + 1)) % 5 * 0.5;
      const geo = new THREE.SphereGeometry(size, 7, 7);
      geo.scale(1, 0.4, 1);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(
        (i - count / 2) * size * 0.6,
        (data.seed * (i + 1)) % 3 * 0.2,
        ((data.seed * (i + 3)) % 5 - 2) * 0.3,
      );
      group.add(m);
    }
    return group;
  }, [data.seed]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.x += speed * delta;
    if (ref.current.position.x > MAP_SIZE + 20) {
      ref.current.position.x = -20;
    }
  });

  return <primitive ref={ref} object={mesh} position={[data.x, data.y, data.z]} scale={data.scale} />;
}

export function Clouds() {
  const cloudData = useMemo(() => {
    const clouds: CloudData[] = [];
    for (let i = 0; i < 20; i++) {
      clouds.push({
        x: Math.random() * (MAP_SIZE + 40) - 20,
        y: 12 + Math.random() * 6,
        z: Math.random() * (MAP_SIZE + 40) - 20,
        scale: 0.8 + Math.random() * 1.5,
        seed: i * 7 + 3,
      });
    }
    return clouds;
  }, []);

  return (
    <group>
      {cloudData.map((d, i) => (
        <Cloud key={i} data={d} />
      ))}
    </group>
  );
}
