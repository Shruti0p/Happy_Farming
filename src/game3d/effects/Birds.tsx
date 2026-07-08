import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
const BIRD_COUNT = 15;

function VBird({ seed }: { seed: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const leftWingRef = useRef<THREE.Mesh>(null!);
  const rightWingRef = useRef<THREE.Mesh>(null!);

  const wingPhase = useRef(seed * 3 + 1);

  const speed = 0.6 + (seed % 4) * 0.3;
  const radius = 10 + (seed % 6) * 5;
  const height = 18 + (seed % 7) * 2;
  const cx = 15 + (seed % 70);
  const cz = 15 + (seed % 70);
  const offset = seed * 2.3;
  const dir = seed % 2 === 0 ? 1 : -1;

  const shade = 0.1 + (seed % 3) * 0.1;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = performance.now() / 1000 * speed * dir + offset;
    groupRef.current.position.x = cx + Math.cos(t) * radius;
    groupRef.current.position.z = cz + Math.sin(t) * radius;
    groupRef.current.position.y = height + Math.sin(t * 1.3) * 1.5;
    groupRef.current.rotation.y = -t + Math.PI / 2;

    wingPhase.current += delta * 6;
    const a = Math.sin(wingPhase.current) * 0.5 + 0.3;
    if (leftWingRef.current) leftWingRef.current.rotation.z = a;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -a;
  });

  const wingShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(1.2, 0.35);
    s.lineTo(1.4, 0);
    s.closePath();
    return s;
  }, []);

  return (
    <group ref={groupRef} scale={1.5}>
      <mesh ref={leftWingRef} position={[0, 0, 0]} rotation={[0, 0, 0.3]}>
        <shapeGeometry args={[wingShape]} />
        <meshBasicMaterial color={new THREE.Color(shade, shade, shade)} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={rightWingRef} position={[0, 0, 0]} rotation={[0, 0, -0.3]}>
        <shapeGeometry args={[wingShape]} />
        <meshBasicMaterial color={new THREE.Color(shade, shade, shade)} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
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
        <VBird key={i} seed={s} />
      ))}
    </group>
  );
}
