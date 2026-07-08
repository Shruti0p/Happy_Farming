import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MAP_SIZE } from '../types';

function Rain() {
  const count = 2000;
  const meshRef = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() * MAP_SIZE;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = Math.random() * MAP_SIZE;
    }
    return pos;
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: 0x88BBFF,
    size: 0.02,
    transparent: true,
    opacity: 0.4,
  }), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= delta * 6;
      pos[i * 3] += Math.sin(Date.now() * 0.001 + i) * delta * 0.3;
      if (pos[i * 3 + 1] < -1) {
        pos[i * 3 + 1] = 7 + Math.random() * 2;
        pos[i * 3] = Math.random() * MAP_SIZE;
        pos[i * 3 + 2] = Math.random() * MAP_SIZE;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return <points ref={meshRef} geometry={geo} material={mat} />;
}

function Snow() {
  const count = 1000;
  const meshRef = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() * MAP_SIZE;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = Math.random() * MAP_SIZE;
    }
    return pos;
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.04,
    transparent: true,
    opacity: 0.6,
  }), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= delta * 2;
      pos[i * 3] += Math.sin(Date.now() * 0.0005 + i) * delta * 0.2;
      if (pos[i * 3 + 1] < -1) {
        pos[i * 3 + 1] = 7 + Math.random() * 2;
        pos[i * 3] = Math.random() * MAP_SIZE;
        pos[i * 3 + 2] = Math.random() * MAP_SIZE;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return <points ref={meshRef} geometry={geo} material={mat} />;
}

export function Weather({ weather }: { weather: string }) {
  return (
    <group>
      {weather === 'rain' && <Rain />}
      {weather === 'storm' && <Rain />}
      {weather === 'snow' && <Snow />}
    </group>
  );
}
