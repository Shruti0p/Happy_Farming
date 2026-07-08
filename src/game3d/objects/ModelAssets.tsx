import React, { useMemo, useRef } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';

export const MODEL_PATHS = {
  farmer: '/models/characters/farmer.glb',
  cow: '/models/animals/cow.glb',
  chicken: '/models/animals/chicken.glb',
  sheep: '/models/animals/sheep.glb',
  pig: '/models/animals/pig.glb',
  duck: '/models/animals/duck.glb',
  goat: '/models/animals/goat.glb',
  horse: '/models/animals/horse.glb',
  rabbit: '/models/animals/rabbit.glb',
  dog: '/models/animals/dog.glb',
  cat: '/models/animals/cat.glb',
  barn: '/models/buildings/barn.glb',
  tree1: '/models/stylized/CommonTree_1.gltf',
  tree2: '/models/stylized/CommonTree_2.gltf',
  tree3: '/models/stylized/CommonTree_3.gltf',
  tree4: '/models/stylized/CommonTree_4.gltf',
  tree5: '/models/stylized/CommonTree_5.gltf',
  bush: '/models/stylized/Bush_Common.gltf',
  bushFlowers: '/models/stylized/Bush_Common_Flowers.gltf',
  rock1: '/models/stylized/Rock_Medium_1.gltf',
  rock2: '/models/stylized/Rock_Medium_2.gltf',
  rock3: '/models/stylized/Rock_Medium_3.gltf',
  pine1: '/models/stylized/Pine_1.gltf',
  pine2: '/models/stylized/Pine_2.gltf',
  pine3: '/models/stylized/Pine_3.gltf',
  pine4: '/models/stylized/Pine_4.gltf',
  pine5: '/models/stylized/Pine_5.gltf',
  twisted1: '/models/stylized/TwistedTree_1.gltf',
  twisted2: '/models/stylized/TwistedTree_2.gltf',
  twisted3: '/models/stylized/TwistedTree_3.gltf',
  twisted4: '/models/stylized/TwistedTree_4.gltf',
  twisted5: '/models/stylized/TwistedTree_5.gltf',
  dead1: '/models/stylized/DeadTree_1.gltf',
  dead2: '/models/stylized/DeadTree_2.gltf',
  dead3: '/models/stylized/DeadTree_3.gltf',
  dead4: '/models/stylized/DeadTree_4.gltf',
  dead5: '/models/stylized/DeadTree_5.gltf',
  flowerSingle: '/models/stylized/Flower_3_Single.gltf',
  flowerGroup: '/models/stylized/Flower_3_Group.gltf',
  flower4Single: '/models/stylized/Flower_4_Single.gltf',
  flower4Group: '/models/stylized/Flower_4_Group.gltf',
  grassShort: '/models/stylized/Grass_Common_Short.gltf',
  grassTall: '/models/stylized/Grass_Common_Tall.gltf',
} as const;

const TREE_VARIANTS = ['tree1', 'tree2', 'tree3', 'tree4', 'tree5'] as const;
const PINE_VARIANTS = ['pine1', 'pine2', 'pine3', 'pine4', 'pine5'] as const;
const ROCK_VARIANTS = ['rock1', 'rock2', 'rock3'] as const;

export function getTreePath(seed: number): string {
  return MODEL_PATHS[TREE_VARIANTS[seed % TREE_VARIANTS.length]];
}

export function getRockPath(seed: number): string {
  return MODEL_PATHS[ROCK_VARIANTS[seed % ROCK_VARIANTS.length]];
}

export function preloadModels() {
  const keys = Object.keys(MODEL_PATHS) as (keyof typeof MODEL_PATHS)[];
  keys.forEach(key => useGLTF.preload(MODEL_PATHS[key]));
}

const modelScales: Partial<Record<keyof typeof MODEL_PATHS, number>> = {
  farmer: 0.8,
  cow: 1.0,
  chicken: 1.0,
  sheep: 1.0,
  pig: 1.0,
  duck: 0.7,
  goat: 0.8,
  horse: 0.9,
  rabbit: 0.6,
  dog: 0.7,
  cat: 0.6,
  barn: 1.0,
  tree1: 0.8,
  tree2: 0.8,
  tree3: 0.8,
  tree4: 0.8,
  tree5: 0.8,
  bush: 0.5,
  bushFlowers: 0.5,
  rock1: 0.4,
  rock2: 0.4,
  rock3: 0.4,
  pine1: 0.6,
  pine2: 0.6,
  pine3: 0.6,
  pine4: 0.6,
  pine5: 0.6,
  twisted1: 0.7,
  twisted2: 0.7,
  twisted3: 0.7,
  twisted4: 0.7,
  twisted5: 0.7,
  dead1: 0.6,
  dead2: 0.6,
  dead3: 0.6,
  dead4: 0.6,
  dead5: 0.6,
  flowerSingle: 0.5,
  flowerGroup: 0.5,
  flower4Single: 0.5,
  flower4Group: 0.5,
  grassShort: 0.5,
  grassTall: 0.5,
};

const modelOffsets: Partial<Record<keyof typeof MODEL_PATHS, [number, number, number]>> = {
  rock1: [0, -0.05, 0],
  rock2: [0, -0.05, 0],
  rock3: [0, -0.05, 0],
};

export function InstancedModel({
  type,
  position,
  rotation,
  scale: extraScale,
}: {
  type: keyof typeof MODEL_PATHS;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const { scene } = useGLTF(MODEL_PATHS[type]);
  const baseScale = modelScales[type] ?? 1;
  const offset = modelOffsets[type] ?? [0, 0, 0];

  const finalScale = (extraScale ?? 1) * baseScale;
  const pos: [number, number, number] = [
    (position?.[0] ?? 0) + offset[0],
    (position?.[1] ?? 0) + offset[1],
    (position?.[2] ?? 0) + offset[2],
  ];

  return (
    <Clone
      object={scene}
      position={pos}
      rotation={rotation}
      scale={finalScale}
      castShadow
      receiveShadow
    />
  );
}

interface AnimatedPlayerModelProps {
  position?: [number, number, number];
  scale?: number;
  children?: React.ReactNode;
}

export const AnimatedPlayerModel = React.forwardRef<THREE.Group, AnimatedPlayerModelProps>(
  function AnimatedPlayerModel({ position, scale = 0.8, children }, ref) {
    const { scene } = useGLTF(MODEL_PATHS.farmer);
    const clonedScene = useMemo(() => scene.clone(true), [scene]);

    return (
      <group ref={ref} position={position} scale={scale}>
        <primitive object={clonedScene} castShadow receiveShadow />
        {children}
      </group>
    );
  }
);
