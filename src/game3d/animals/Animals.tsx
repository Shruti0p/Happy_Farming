import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MAP_SIZE } from '../types';

const ANIMAL_MODELS: Record<string, string> = {
  chicken: '/models/animals/chicken.glb',
  cow: '/models/animals/cow.glb',
  sheep: '/models/animals/sheep.glb',
  pig: '/models/animals/pig.glb',
};

const ANIMAL_SCALES: Record<string, number> = {
  chicken: 0.6,
  cow: 0.5,
  sheep: 0.5,
  pig: 0.5,
};

function AnimalMesh({ type }: { type: string }) {
  const url = ANIMAL_MODELS[type];
  if (!url) return null;

  const { scene: rawScene } = useGLTF(url);
  const scene = useMemo(() => rawScene.clone(true), [rawScene]);
  const scale = ANIMAL_SCALES[type] ?? 1;

  return <primitive object={scene} scale={scale} castShadow receiveShadow />;
}

interface AnimalProps {
  id: string;
  type: string;
  name: string;
  x: number;
  z: number;
}

function Animal({ type, x, z }: AnimalProps) {
  const ref = useRef<THREE.Group>(null!);
  const target = useRef(new THREE.Vector3(x, 0, z));
  const timer = useRef(Math.random() * 10);
  const walkPhase = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    timer.current -= delta;
    if (timer.current <= 0) {
      timer.current = 3 + Math.random() * 6;
      target.current.set(
        Math.random() * MAP_SIZE,
        0,
        Math.random() * MAP_SIZE,
      );
    }

    const dx = target.current.x - ref.current.position.x;
    const dz = target.current.z - ref.current.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.1) {
      const speed = type === 'chicken' ? 0.8 : 0.4;
      const vx = (dx / dist) * speed * delta;
      const vz = (dz / dist) * speed * delta;
      ref.current.position.x += vx;
      ref.current.position.z += vz;
      ref.current.rotation.y = Math.atan2(dx, dz);
      walkPhase.current += delta * 4;
      ref.current.position.y = Math.abs(Math.sin(walkPhase.current)) * 0.003;
    }
  });

  return (
    <group ref={ref} position={[x, 0, z]}>
      <AnimalMesh type={type} />
    </group>
  );
}

export function Animals({ animals }: { animals: AnimalProps[] }) {
  return (
    <group>
      {animals.map(a => (
        <Animal key={a.id} {...a} />
      ))}
    </group>
  );
}
