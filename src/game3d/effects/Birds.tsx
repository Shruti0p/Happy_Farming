import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MAP_SIZE } from '../types';

const BIRD_COUNT = 10;

function AnimatedBird({ seed }: { seed: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const leftWingRef = useRef<THREE.Group>(null!);
  const rightWingRef = useRef<THREE.Group>(null!);

  const wingPhase = useRef(seed * 3);

  const speed = 0.5 + (seed % 3) * 0.3;
  const radius = 5 + (seed % 5) * 3;
  const heightOffset = 7 + (seed % 5) * 2;
  const centerX = 15 + (seed % 70);
  const centerZ = 15 + (seed % 70);
  const angleOffset = seed * 2.1;
  const invert = seed % 2 === 0 ? 1 : -1;

  const bodyColor = new THREE.Color().setHSL(0.05 + (seed % 8) * 0.02, 0.3, 0.35 + (seed % 4) * 0.08);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = performance.now() / 1000 * speed * invert + angleOffset;
    groupRef.current.position.x = centerX + Math.cos(t) * radius;
    groupRef.current.position.z = centerZ + Math.sin(t) * radius;
    groupRef.current.position.y = heightOffset + Math.sin(t * 2) * 0.5;
    groupRef.current.rotation.y = -t + Math.PI / 2;

    wingPhase.current += delta * 10;
    const wingAngle = Math.sin(wingPhase.current) * 0.8;
    if (leftWingRef.current) leftWingRef.current.rotation.x = wingAngle;
    if (rightWingRef.current) rightWingRef.current.rotation.x = -wingAngle;
  });

  return (
    <group ref={groupRef} scale={0.035}>
      <mesh position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.2, 4, 6]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0, 0.2, 0.05]} castShadow>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0, 0.22, 0.1]}>
        <coneGeometry args={[0.015, 0.06, 4]} />
        <meshStandardMaterial color={0xFF6600} />
      </mesh>
      <mesh position={[0, -0.02, -0.18]}>
        <coneGeometry args={[0.02, 0.08, 4]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <group ref={leftWingRef} position={[-0.1, 0.08, 0]}>
        <mesh>
          <planeGeometry args={[0.25, 0.07]} />
          <meshStandardMaterial color={bodyColor} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group ref={rightWingRef} position={[0.1, 0.08, 0]}>
        <mesh>
          <planeGeometry args={[0.25, 0.07]} />
          <meshStandardMaterial color={bodyColor} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

export function Birds() {
  const seeds = useMemo(() =>
    Array.from({ length: BIRD_COUNT }, (_, i) => i * 7 + 3),
  []);

  return (
    <group>
      {seeds.map((s, i) => (
        <AnimatedBird key={i} seed={s} />
      ))}
    </group>
  );
}
