import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const CROP_COLORS: Record<string, number[]> = {
  wheat: [0x8B7355, 0x9B8B6A, 0x7BA05B, 0x5A8F3C, 0x4A7A2E, 0x6B8E23, 0xD4A017],
  carrot: [0x8B6914, 0x7B8A3C, 0x5A8A3C, 0x4A7A2E, 0x3A6A1E, 0x4A8A2E, 0xFF8C00],
  tomato: [0x5A7A2E, 0x4A6A1E, 0x3A5A0E, 0x2A5A0E, 0x3A7A2E, 0x4A8A3C, 0xFF4444],
  corn: [0x6B8E23, 0x5A7E1E, 0x4A6E18, 0x3A5E12, 0x4A7E18, 0x5A8E23, 0xFFD700],
  pumpkin: [0x6B8E23, 0x5A7E1E, 0x4A6E18, 0x5A7E28, 0x6B8E38, 0x7B9E48, 0xFF8C00],
  strawberry: [0x5A7A2E, 0x4A6A1E, 0x3A5A0E, 0x3A6A1E, 0x4A7A2E, 0x5A8A3C, 0xFF2222],
};

export function Crop3D({
  cropId,
  stage,
  x,
  z,
  watered,
}: {
  cropId: string;
  stage: number;
  x: number;
  z: number;
  watered: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const s = Math.min(stage, 6);

  const colors = CROP_COLORS[cropId] || CROP_COLORS.wheat;
  const mainColor = colors[s] || colors[colors.length - 1];
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: mainColor,
    roughness: 0.8,
  }), [mainColor]);

  const stemMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x4A7A2E,
    roughness: 0.9,
  }), []);

  useFrame(() => {
    if (!groupRef.current) return;
    const sway = Math.sin(Date.now() * 0.002 + x + z) * 0.02 * s;
    groupRef.current.rotation.z = sway * 0.1;
    groupRef.current.rotation.x = sway * 0.05;
  });

  const content = useMemo(() => {
    const parts: React.ReactElement[] = [];

    if (s === 0) {
      const geo = new THREE.BoxGeometry(0.06, 0.02, 0.06);
      parts.push(
        <mesh key="seed" geometry={geo} material={mat} position={[0, -0.01, 0]} />
      );
    } else if (s === 1) {
      const geo = new THREE.CylinderGeometry(0.01, 0.02, 0.06, 4);
      parts.push(
        <mesh key="sprout" geometry={geo} material={stemMat} position={[0, 0.03, 0]} castShadow />
      );
    } else if (s === 2) {
      const geo = new THREE.CylinderGeometry(0.01, 0.02, 0.1, 4);
      parts.push(
        <mesh key="stem" geometry={geo} material={stemMat} position={[0, 0.05, 0]} castShadow />
      );
      const leafGeo = new THREE.BoxGeometry(0.04, 0.005, 0.02);
      parts.push(
        <mesh key="leaf1" geometry={leafGeo} material={mat} position={[0.02, 0.06, 0]} rotation={[0, 0, 0.4]} />,
        <mesh key="leaf2" geometry={leafGeo} material={mat} position={[-0.02, 0.06, 0]} rotation={[0, 0, -0.4]} />
      );
    } else if (s >= 3 && s <= 4) {
      const geo = new THREE.CylinderGeometry(0.015, 0.03, 0.15 + s * 0.03, 5);
      parts.push(
        <mesh key="stem" geometry={geo} material={stemMat} position={[0, (0.15 + s * 0.03) / 2, 0]} castShadow />
      );
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const leafGeo = new THREE.BoxGeometry(0.05, 0.005, 0.03);
        parts.push(
          <mesh
            key={`leaf${i}`}
            geometry={leafGeo}
            material={mat}
            position={[Math.cos(angle) * 0.03, 0.08 + s * 0.02, Math.sin(angle) * 0.03]}
            rotation={[Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3]}
          />
        );
      }
    } else if (s === 5) {
      const geo = new THREE.CylinderGeometry(0.015, 0.035, 0.28, 5);
      parts.push(
        <mesh key="stem" geometry={geo} material={stemMat} position={[0, 0.14, 0]} castShadow />
      );
      const leafGeo = new THREE.BoxGeometry(0.06, 0.005, 0.03);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        parts.push(
          <mesh
            key={`leaf${i}`}
            geometry={leafGeo}
            material={mat}
            position={[Math.cos(angle) * 0.035, 0.1 + Math.random() * 0.06, Math.sin(angle) * 0.035]}
            rotation={[Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3]}
          />
        );
      }
    } else if (s === 6) {
      const geo = new THREE.CylinderGeometry(0.02, 0.04, 0.32, 5);
      parts.push(
        <mesh key="stem" geometry={geo} material={stemMat} position={[0, 0.16, 0]} castShadow />
      );
      const fruitMat = new THREE.MeshStandardMaterial({
        color: colors[colors.length - 1],
        roughness: 0.5,
      });
      const fruitGeo = new THREE.SphereGeometry(0.04, 6, 6);
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + 0.3;
        parts.push(
          <mesh
            key={`fruit${i}`}
            geometry={fruitGeo}
            material={fruitMat}
            position={[Math.cos(angle) * 0.05, 0.15 + Math.random() * 0.06, Math.sin(angle) * 0.05]}
            castShadow
          />
        );
      }
      if (cropId === 'wheat') {
        const wheatMat = new THREE.MeshStandardMaterial({ color: 0xD4A017, roughness: 0.7 });
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const wGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.06, 4);
          parts.push(
            <mesh
              key={`wheat${i}`}
              geometry={wGeo}
              material={wheatMat}
              position={[Math.cos(angle) * 0.035, 0.18, Math.sin(angle) * 0.035]}
            />
          );
        }
      }
    }

    return parts;
  }, [s, mat, stemMat, cropId, colors]);

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {content}
      {watered && (
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.06, 8]} />
          <meshBasicMaterial color={0x4488FF} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
