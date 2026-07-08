import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MAP_SIZE, TILE_SIZE } from '../types';
import type { WorldTile } from '../types';

const FARM_PLOT_X = 38;
const FARM_PLOT_Z = 30;
const FARM_PLOT_W = 20;
const FARM_PLOT_H = 24;

interface TerrainProps {
  tiles: WorldTile[][];
  playerX: number;
  playerZ: number;
  tilledTiles?: { [key: string]: { watered: boolean } };
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

function TilledTile({ x, z, watered }: { x: number; z: number; watered: boolean }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (meshRef.current && watered) {
      meshRef.current.position.y = 0.02 + Math.sin(Date.now() * 0.003 + x * 4 + z * 2) * 0.002;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.005, z]}>
      <planeGeometry args={[TILE_SIZE * 0.92, TILE_SIZE * 0.92]} />
      <meshStandardMaterial
        ref={matRef}
        color={watered ? 0x5B3A1A : 0x4A3520}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}

export function Terrain({ tiles, tilledTiles }: TerrainProps) {
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

  const tilledPositions = useMemo(() => {
    if (!tilledTiles) return [];
    return Object.entries(tilledTiles).map(([key, val]) => {
      const [x, z] = key.split(',').map(Number);
      return { x, z, watered: val.watered };
    });
  }, [tilledTiles]);

  const farmPlotFrame = useMemo(() => {
    const corners: { x: number; z: number }[] = [];
    for (let x = FARM_PLOT_X; x <= FARM_PLOT_X + FARM_PLOT_W; x++) {
      corners.push({ x, z: FARM_PLOT_Z }, { x, z: FARM_PLOT_Z + FARM_PLOT_H });
    }
    for (let z = FARM_PLOT_Z; z <= FARM_PLOT_Z + FARM_PLOT_H; z++) {
      corners.push({ x: FARM_PLOT_X, z }, { x: FARM_PLOT_X + FARM_PLOT_W, z });
    }
    return corners;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAP_SIZE / 2, -0.15, MAP_SIZE / 2]} receiveShadow>
        <planeGeometry args={[MAP_SIZE * 1.5, MAP_SIZE * 1.5]} />
        <meshStandardMaterial color={0x5A8B4A} roughness={1} />
      </mesh>

      {waterPositions.map(p => (
        <WaterTile key={`w${p.x},${p.z}`} x={p.x} z={p.z} />
      ))}

      {tilledPositions.map(p => (
        <TilledTile key={`t${p.x},${p.z}`} x={p.x} z={p.z} watered={p.watered} />
      ))}

      {farmPlotFrame.map((p, i) => (
        <mesh key={`fp${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[p.x, 0.002, p.z]}>
          <planeGeometry args={[0.08, 0.08]} />
          <meshBasicMaterial color={0xD4A574} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}
