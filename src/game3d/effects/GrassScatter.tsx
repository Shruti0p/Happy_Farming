import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { MAP_SIZE } from '../types';

const TOTAL_BLADES = 4000;

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

export function GrassScatter() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  const { scene: rawScene } = useGLTF('/models/stylized/Grass_Common_Tall.gltf');

  const { geometry, material } = useMemo(() => {
    const scene = rawScene.clone(true);
    let geo: THREE.BufferGeometry | null = null;
    let mat: THREE.Material | null = null;
    scene.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        if (!geo) geo = m.geometry;
        if (!mat) mat = m.material;
      }
    });
    return { geometry: geo, material: mat };
  }, [rawScene]);

  const positions = useMemo(() => {
    const rng = seededRandom(42);
    const pos = new Float32Array(TOTAL_BLADES * 3);
    let idx = 0;
    let attempts = 0;
    while (idx < TOTAL_BLADES && attempts < TOTAL_BLADES * 10) {
      const x = 1 + rng() * (MAP_SIZE - 2);
      const z = 1 + rng() * (MAP_SIZE - 2);
      attempts++;
      if (isInFarmPlot(Math.floor(x), Math.floor(z))) continue;
      pos[idx * 3] = x;
      pos[idx * 3 + 1] = -0.14;
      pos[idx * 3 + 2] = z;
      idx++;
    }
    return pos;
  }, []);

  useEffect(() => {
    if (!meshRef.current || !geometry) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < TOTAL_BLADES; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];
      dummy.position.set(x, -0.14, z);
      const seed = Math.floor(x * 13 + z * 7);
      const rotY = seed * 0.7;
      const scale = 0.5 + (seed % 6) * 0.15;
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
  }, [geometry, positions]);

  if (!geometry || !material) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, TOTAL_BLADES]}
    />
  );
}
