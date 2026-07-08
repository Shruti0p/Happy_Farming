import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MAP_SIZE } from '../types';

const BIRD_COUNT = 12;

function Bird({ seed }: { seed: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const leftWingRef = useRef<THREE.Mesh>(null!);
  const rightWingRef = useRef<THREE.Mesh>(null!);
  const wingPhase = useRef(seed * 2);

  const speed = 3 + (seed % 5) * 0.8;
  const radius = 5 + (seed % 4) * 3;
  const heightOffset = 8 + (seed % 6) * 2;
  const centerX = 20 + (seed % 60);
  const centerZ = 20 + (seed % 60);
  const angleOffset = seed * 1.3;

  const bodyColor = seed % 3 === 0 ? 0x444444 : seed % 3 === 1 ? 0x555555 : 0x333333;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = performance.now() / 1000 * speed + angleOffset;
    groupRef.current.position.x = centerX + Math.cos(t) * radius;
    groupRef.current.position.z = centerZ + Math.sin(t) * radius;
    groupRef.current.position.y = heightOffset + Math.sin(t * 2) * 1.5;
    groupRef.current.rotation.y = -t + Math.PI / 2;

    wingPhase.current += delta * 8;
    const wingAngle = Math.sin(wingPhase.current) * 0.6;
    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = wingAngle;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -wingAngle;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 0.06, 0.12]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh ref={leftWingRef} position={[-0.1, 0.03, 0]}>
        <planeGeometry args={[0.2, 0.06]} />
        <meshStandardMaterial color={bodyColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={rightWingRef} position={[0.1, 0.03, 0]}>
        <planeGeometry args={[0.2, 0.06]} />
        <meshStandardMaterial color={bodyColor} side={THREE.DoubleSide} />
      </mesh>
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
