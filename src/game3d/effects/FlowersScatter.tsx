import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { MAP_SIZE } from '../types';

const FLOWER_PATHS = [
  '/models/stylized/Flower_3_Single.gltf',
  '/models/stylized/Flower_3_Group.gltf',
  '/models/stylized/Flower_4_Single.gltf',
  '/models/stylized/Flower_4_Group.gltf',
];

const FLOWERS_PER_TYPE = 80;

const FARM_X = 40, FARM_Z = 58, FARM_W = 20, FARM_H = 20;

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function isInFarmPlot(x: number, z: number): boolean {
  return x >= FARM_X && x < FARM_X + FARM_W && z >= FARM_Z && z < FARM_Z + FARM_H;
}

function useFlowerPositions(typeIndex: number): Float32Array {
  return useMemo(() => {
    const rng = seededRandom(typeIndex * 73 + 99);
    const positions = new Float32Array(FLOWERS_PER_TYPE * 3);
    let idx = 0;
    let attempts = 0;
    while (idx < FLOWERS_PER_TYPE && attempts < FLOWERS_PER_TYPE * 15) {
      const x = 1 + rng() * (MAP_SIZE - 2);
      const z = 1 + rng() * (MAP_SIZE - 2);
      attempts++;
      if (isInFarmPlot(Math.floor(x), Math.floor(z))) continue;
      if (z > MAP_SIZE / 3 - 3 && z < MAP_SIZE / 3 + 3) continue;

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = -0.14;
      positions[idx * 3 + 2] = z;
      idx++;
    }
    return positions;
  }, [typeIndex]);
}

function FlowerType({ typeIndex }: { typeIndex: number }) {
  const { scene: rawScene } = useGLTF(FLOWER_PATHS[typeIndex]);
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const positions = useFlowerPositions(typeIndex);

  const { geometry, material } = useMemo(() => {
    const scene = rawScene.clone(true);
    let geo: THREE.BufferGeometry | null = null;
    let mat: THREE.Material | null = null;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        geo = mesh.geometry;
        mat = mesh.material;
      }
    });
    return { geometry: geo!, material: mat! };
  }, [rawScene]);

  useEffect(() => {
    if (!meshRef.current || !geometry || !material) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < positions.length / 3; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];
      dummy.position.set(x, -0.14, z);
      const seed = Math.floor(x * 13 + z * 7);
      const rotY = seed * 0.5;
      const scale = 0.3 + (seed % 4) * 0.08;
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
  }, [geometry, material, positions]);

  if (!geometry || !material) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, positions.length / 3]}
      castShadow
      receiveShadow
    />
  );
}

export function FlowersScatter() {
  return (
    <group>
      {FLOWER_PATHS.map((_, i) => (
        <FlowerType key={i} typeIndex={i} />
      ))}
    </group>
  );
}
