import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MAP_SIZE } from '../types';

const BIRD_COUNT = 8;

function Bird({ seed }: { seed: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene: rawScene } = useGLTF('/models/animals/sparrow.glb');
  const scene = useMemo(() => rawScene.clone(true), [rawScene]);

  const speed = 0.8 + (seed % 4) * 0.3;
  const radius = 6 + (seed % 5) * 4;
  const heightOffset = 8 + (seed % 6) * 2;
  const centerX = 15 + (seed % 70);
  const centerZ = 15 + (seed % 70);
  const angleOffset = seed * 1.7;
  const invert = seed % 2 === 0 ? 1 : -1;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = performance.now() / 1000 * speed * invert + angleOffset;
    groupRef.current.position.x = centerX + Math.cos(t) * radius;
    groupRef.current.position.z = centerZ + Math.sin(t) * radius;
    groupRef.current.position.y = heightOffset + Math.sin(t * 1.5) * 1.0;
    groupRef.current.rotation.y = -t + Math.PI / 2;
  });

  return (
    <group ref={groupRef} scale={0.5}>
      <primitive object={scene} castShadow />
    </group>
  );
}

export function Birds() {
  const seeds = useMemo(() => {
    return Array.from({ length: BIRD_COUNT }, (_, i) => i * 7 + 3);
  }, []);

  return (
    <group>
      {seeds.map((s, i) => (
        <Bird key={i} seed={s} />
      ))}
    </group>
  );
}
