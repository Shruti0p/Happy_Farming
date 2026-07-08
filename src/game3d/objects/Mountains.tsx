import React, { useMemo } from 'react';
import * as THREE from 'three';
import { MAP_SIZE } from '../types';

interface MountainData {
  x: number;
  z: number;
  height: number;
  radius: number;
  color: THREE.Color;
  snowLine: number;
}

function Mountain({ data }: { data: MountainData }) {
  const mesh = useMemo(() => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: 0.8,
      flatShading: true,
    });
    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.6,
      flatShading: true,
    });

    const geo = new THREE.ConeGeometry(data.radius, data.height, 7);
    const main = new THREE.Mesh(geo, mat);
    main.position.y = data.height / 2;
    main.castShadow = true;
    main.receiveShadow = true;
    group.add(main);

    const snowH = data.height * 0.3;
    const snowGeo = new THREE.ConeGeometry(data.radius * 0.4, snowH, 7);
    const snow = new THREE.Mesh(snowGeo, snowMat);
    snow.position.y = data.height - snowH / 2;
    snow.castShadow = true;
    group.add(snow);

    return group;
  }, [data]);

  return <primitive object={mesh} position={[data.x, 0, data.z]} />;
}

export function Mountains() {
  const mountains = useMemo(() => {
    const list: MountainData[] = [];
    const colors = [0x6B705C, 0x5A6B4A, 0x7B8A6B, 0x4A5B3A];
    const ringDist = MAP_SIZE * 0.55;
    const count = 30;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i * 0.3);
      const spread = 5 + Math.sin(i * 2.7) * 3;
      const dist = ringDist + spread;
      const height = 6 + Math.sin(i * 3.1) * 3 + Math.cos(i * 1.7) * 2;
      const radius = 3 + Math.sin(i * 2.3) * 1.5;

      list.push({
        x: MAP_SIZE / 2 + Math.cos(angle) * dist,
        z: MAP_SIZE / 2 + Math.sin(angle) * dist,
        height: Math.max(3, height),
        radius: Math.max(1.5, radius),
        color: new THREE.Color(colors[i % colors.length]),
        snowLine: height * 0.6,
      });
    }

    return list;
  }, []);

  return (
    <group>
      {mountains.map((m, i) => (
        <Mountain key={i} data={m} />
      ))}
    </group>
  );
}
