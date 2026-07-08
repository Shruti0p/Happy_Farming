import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import {
  createRockMesh,
  createFlowerMesh, createFenceMesh, createLanternMesh, createScarecrowMesh,
} from './Models';
import type { Object3DData } from '../types';

function GlbModel({ path, scale = 1, rotY = 0, posY = 0 }: { path: string; scale?: number; rotY?: number; posY?: number }) {
  const { scene: raw } = useGLTF(path);
  const scene = useMemo(() => raw.clone(true), [raw]);
  return <primitive object={scene} scale={scale} position={[0, posY, 0]} rotation={[0, rotY, 0]} castShadow receiveShadow />;
}

function GlbTree({ x, z }: { x: number; z: number }) {
  const variants = [
    '/models/stylized/CommonTree_1.gltf',
    '/models/stylized/CommonTree_2.gltf',
    '/models/stylized/CommonTree_3.gltf',
    '/models/stylized/CommonTree_4.gltf',
    '/models/stylized/CommonTree_5.gltf',
    '/models/stylized/TwistedTree_1.gltf',
    '/models/stylized/TwistedTree_2.gltf',
    '/models/stylized/Pine_1.gltf',
    '/models/stylized/Pine_2.gltf',
    '/models/stylized/DeadTree_1.gltf',
  ];
  const seed = Math.floor(x * 7 + z * 13) % variants.length;
  const path = variants[seed];
  const rotY = (x * 3 + z * 7) * 0.5;
  return <GlbModel path={path} scale={0.8} rotY={rotY} posY={-0.35} />;
}

function GlbBush({ x, z }: { x: number; z: number }) {
  const useFlowers = (Math.floor(x * 3 + z * 7) % 3 === 0);
  const path = useFlowers
    ? '/models/stylized/Bush_Common_Flowers.gltf'
    : '/models/stylized/Bush_Common.gltf';
  const rotY = (x * 5 + z * 11) * 0.3;
  return <GlbModel path={path} scale={0.5} rotY={rotY} posY={-0.15} />;
}

function GlbStone({ x, z }: { x: number; z: number }) {
  const variants = [
    '/models/stylized/Rock_Medium_1.gltf',
    '/models/stylized/Rock_Medium_2.gltf',
    '/models/stylized/Rock_Medium_3.gltf',
  ];
  const seed = Math.floor(x * 11 + z * 17) % variants.length;
  const path = variants[seed];
  const rotY = (x * 7 + z * 13) * 0.3;
  const scale = 0.25 + (seed * 0.1);
  return <GlbModel path={path} scale={scale} rotY={rotY} posY={-0.1} />;
}

function WorldObject({ obj }: { obj: Object3DData }) {
  const mesh = useMemo(() => {
    if (obj.cleared) return null;
    switch (obj.type) {
      case 'tree': return null;
      case 'rock': return createRockMesh();
      case 'bush': return null;
      case 'stone': return null;
      case 'flower': return createFlowerMesh(Math.random() > 0.5 ? 0xF15BB5 : 0xFEE440);
      case 'fence': return createFenceMesh();
      case 'lantern': return createLanternMesh();
      case 'scarecrow': return createScarecrowMesh();
      default: return null;
    }
  }, [obj.type, obj.cleared]);

  if (obj.type === 'tree') {
    return (
      <group position={[obj.x, 0, obj.z]}>
        <GlbTree x={obj.x} z={obj.z} />
      </group>
    );
  }

  if (obj.type === 'bush') {
    return (
      <group position={[obj.x, 0, obj.z]}>
        <GlbBush x={obj.x} z={obj.z} />
      </group>
    );
  }

  if (obj.type === 'stone') {
    return (
      <group position={[obj.x, 0, obj.z]}>
        <GlbStone x={obj.x} z={obj.z} />
      </group>
    );
  }

  if (!mesh) return null;

  return <primitive object={mesh} position={[obj.x, 0, obj.z]} />;
}

export function WorldObjects({ objects }: { objects: Object3DData[] }) {
  return (
    <group>
      {objects.map(obj => (
        <WorldObject key={obj.id} obj={obj} />
      ))}
    </group>
  );
}
