import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MAP_SIZE } from '../types';

const GRASS_PATHS = [
  '/models/stylized/Grass_Common_Short.gltf',
  '/models/stylized/Grass_Common_Tall.gltf',
  '/models/stylized/Grass_Wispy_Short.gltf',
  '/models/stylized/Grass_Wispy_Tall.gltf',
];

const GRASS_COUNT_PER_TYPE = 600;
const TOTAL_COUNT = GRASS_COUNT_PER_TYPE * GRASS_PATHS.length;

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

function useGrassPositions(typeIndex: number): Float32Array {
  return useMemo(() => {
    const rng = seededRandom(typeIndex * 137 + 42);
    const positions = new Float32Array(GRASS_COUNT_PER_TYPE * 3);
    let idx = 0;
    let attempts = 0;
    while (idx < GRASS_COUNT_PER_TYPE && attempts < GRASS_COUNT_PER_TYPE * 10) {
      const x = 1 + rng() * (MAP_SIZE - 2);
      const z = 1 + rng() * (MAP_SIZE - 2);
      attempts++;
      if (isInFarmPlot(Math.floor(x), Math.floor(z))) continue;

      if (typeIndex === 2 || typeIndex === 3) {
        const isNearWater = z > MAP_SIZE / 3 - 4 && z < MAP_SIZE / 3 + 4 && x > MAP_SIZE * 0.25 && x < MAP_SIZE * 0.75;
        if (!isNearWater && rng() > 0.3) continue;
      }

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = -0.14;
      positions[idx * 3 + 2] = z;
      idx++;
    }
    return positions;
  }, [typeIndex]);
}

function GrassType({ typeIndex }: { typeIndex: number }) {
  const { scene: rawScene } = useGLTF(GRASS_PATHS[typeIndex]);
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const positions = useGrassPositions(typeIndex);

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
      const rotY = seed * 0.7;
      const scale = 0.3 + (seed % 5) * 0.1;
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
  }, [geometry, material, positions]);

  if (!geometry || !material) return null;

  const mat = material as THREE.MeshStandardMaterial;
  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, mat, positions.length / 3]}
      castShadow
      receiveShadow
    />
  );
}

export function GrassScatter() {
  return (
    <group>
      {GRASS_PATHS.map((_, i) => (
        <GrassType key={i} typeIndex={i} />
      ))}
    </group>
  );
}
