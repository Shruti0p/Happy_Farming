import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MAP_SIZE, TILE_SIZE } from '../types';
import type { WorldTile } from '../types';

interface TerrainProps {
  tiles: WorldTile[][];
  playerX: number;
  playerZ: number;
}

function getTileColor(type: WorldTile['type']): THREE.Color {
  switch (type) {
    case 'grass': return new THREE.Color(0.42, 0.72, 0.27);
    case 'dirt': return new THREE.Color(0.68, 0.50, 0.35);
    case 'path': return new THREE.Color(0.85, 0.70, 0.51);
    case 'water': return new THREE.Color(0.23, 0.51, 0.81);
    case 'bridge': return new THREE.Color(0.56, 0.36, 0.21);
    case 'plowed_dry': return new THREE.Color(0.48, 0.31, 0.19);
    case 'plowed_wet': return new THREE.Color(0.29, 0.18, 0.11);
    default: return new THREE.Color(0.42, 0.72, 0.27);
  }
}

function hash2D(x: number, z: number): number {
  let h = x * 374761393 + z * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) & 0x7fffffff;
}

function smoothNoise(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const sx = fx * fx * (3 - 2 * fx);
  const sz = fz * fz * (3 - 2 * fz);
  const v00 = (hash2D(ix, iz) & 0xffff) / 65536;
  const v10 = (hash2D(ix + 1, iz) & 0xffff) / 65536;
  const v01 = (hash2D(ix, iz + 1) & 0xffff) / 65536;
  const v11 = (hash2D(ix + 1, iz + 1) & 0xffff) / 65536;
  const v0 = v00 + (v10 - v00) * sx;
  const v1 = v01 + (v11 - v01) * sx;
  return v0 + (v1 - v0) * sz;
}

function fbm(x: number, z: number): number {
  let value = 0;
  let amp = 0.5;
  let freq = 0.04;
  for (let i = 0; i < 4; i++) {
    value += amp * smoothNoise(x * freq, z * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return value;
}

function getTerrainHeight(x: number, z: number): number {
  return (fbm(x, z) - 0.5) * 0.2 - 0.08;
}

function WaterTile({ x, z, height }: { x: number; z: number; height: number }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (matRef.current) {
      matRef.current.opacity = 0.8 + Math.sin(Date.now() * 0.002 + x * 3 + z * 5) * 0.05;
    }
    if (meshRef.current) {
      meshRef.current.position.y = height + 0.01 + Math.sin(Date.now() * 0.0015 + x * 2 + z * 3) * 0.005;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[x, height + 0.01, z]}>
      <planeGeometry args={[TILE_SIZE * 0.95, TILE_SIZE * 0.95]} />
      <meshStandardMaterial ref={matRef} color={0x3A81CF} transparent opacity={0.85} roughness={0.1} metalness={0.3} />
    </mesh>
  );
}

export function Terrain({ tiles, playerX, playerZ }: TerrainProps) {
  const terrainData = useMemo(() => {
    if (!tiles || tiles.length === 0) {
      return null;
    }

    const viewRadius = 30;
    const px = Math.floor(playerX / TILE_SIZE);
    const pz = Math.floor(playerZ / TILE_SIZE);
    const zMin = Math.max(0, pz - viewRadius);
    const zMax = Math.min(tiles.length, pz + viewRadius);
    const xMin = Math.max(0, px - viewRadius);
    const xMax = Math.min(tiles[0].length, px + viewRadius);
    const cols = xMax - xMin;
    const rows = zMax - zMin;
    if (cols <= 0 || rows <= 0) return null;

    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const waterTiles: WorldTile[] = [];

    for (let z = zMin; z <= zMax; z++) {
      for (let x = xMin; x <= xMax; x++) {
        let height = getTerrainHeight(x + 0.5, z + 0.5);
        const tile = tiles[z]?.[x];
        const tileType = tile?.type || 'grass';

        if (tileType === 'water') {
          height = -0.1;
          waterTiles.push({ x, z, type: 'water', height: -0.1 });
        }

        vertices.push(x, height, z);
        const c = getTileColor(tileType);
        colors.push(c.r, c.g, c.b);
      }
    }

    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        const a = z * (cols + 1) + x;
        const b = z * (cols + 1) + x + 1;
        const c = (z + 1) * (cols + 1) + x;
        const d = (z + 1) * (cols + 1) + x + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return { geo, xMin, zMin, cols, rows, waterTiles };
  }, [tiles, playerX, playerZ]);

  if (!terrainData) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAP_SIZE / 2, -0.15, MAP_SIZE / 2]}>
        <planeGeometry args={[MAP_SIZE * 1.5, MAP_SIZE * 1.5]} />
        <meshStandardMaterial color={0x5A8B4A} roughness={1} />
      </mesh>
    );
  }

  const { geo, xMin, zMin, cols, rows, waterTiles } = terrainData;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAP_SIZE / 2, -0.15, MAP_SIZE / 2]} receiveShadow>
        <planeGeometry args={[MAP_SIZE * 1.5, MAP_SIZE * 1.5]} />
        <meshStandardMaterial color={0x5A8B4A} roughness={1} />
      </mesh>
      <mesh geometry={geo} position={[0, -0.05, 0]} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.9} />
      </mesh>
      {waterTiles.map(tile => (
        <WaterTile key={`w${tile.x},${tile.z}`} x={tile.x} z={tile.z} height={getTerrainHeight(tile.x + 0.5, tile.z + 0.5)} />
      ))}
    </group>
  );
}
