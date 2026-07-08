import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MAP_SIZE, TILE_SIZE } from '../types';
import type { WorldTile } from '../types';

interface TerrainProps {
  tiles: WorldTile[][];
  playerX: number;
  playerZ: number;
}

function WaterTile({ x, z }: { x: number; z: number }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (matRef.current) {
      matRef.current.opacity = 0.8 + Math.sin(Date.now() * 0.002 + x * 3 + z * 5) * 0.05;
    }
    if (meshRef.current) {
      meshRef.current.position.y = 0.01 + Math.sin(Date.now() * 0.0015 + x * 2 + z * 3) * 0.005;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]}>
      <planeGeometry args={[TILE_SIZE * 0.95, TILE_SIZE * 0.95]} />
      <meshStandardMaterial ref={matRef} color={0x3A81CF} transparent opacity={0.85} roughness={0.1} metalness={0.3} />
    </mesh>
  );
}

export function Terrain({ tiles }: TerrainProps) {
  const waterPositions = useMemo(() => {
    if (!tiles) return [];
    const positions: { x: number; z: number }[] = [];
    for (let z = 0; z < tiles.length; z++) {
      for (let x = 0; x < (tiles[z]?.length || 0); x++) {
        if (tiles[z]?.[x]?.type === 'water') {
          positions.push({ x, z });
        }
      }
    }
    return positions;
  }, [tiles]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAP_SIZE / 2, -0.15, MAP_SIZE / 2]} receiveShadow>
        <planeGeometry args={[MAP_SIZE * 1.5, MAP_SIZE * 1.5]} />
        <meshStandardMaterial color={0x5A8B4A} roughness={1} />
      </mesh>
      {waterPositions.map(p => (
        <WaterTile key={`w${p.x},${p.z}`} x={p.x} z={p.z} />
      ))}
    </group>
  );
}
