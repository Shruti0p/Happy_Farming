import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MAP_SIZE, TILE_SIZE } from '../types';
import type { WorldTile } from '../types';

const FARM_PLOT_X = 40;
const FARM_PLOT_Z = 58;
const FARM_PLOT_W = 20;
const FARM_PLOT_H = 20;

const GATE_Z = FARM_PLOT_Z + FARM_PLOT_H;
const GATE_X_START = FARM_PLOT_X + Math.floor(FARM_PLOT_W / 2) - 1;
const GATE_X_END = GATE_X_START + 3;

interface TerrainProps {
  tiles: WorldTile[][];
  playerX: number;
  playerZ: number;
  tilledTiles?: { [key: string]: { watered: boolean } };
}

function isGateTile(x: number, z: number): boolean {
  return z === GATE_Z && x >= GATE_X_START && x < GATE_X_END;
}

function isOnFencePerimeter(x: number, z: number): boolean {
  if (x < FARM_PLOT_X || x >= FARM_PLOT_X + FARM_PLOT_W) return false;
  if (z < FARM_PLOT_Z || z >= FARM_PLOT_Z + FARM_PLOT_H) return false;
  if (x === FARM_PLOT_X || x === FARM_PLOT_X + FARM_PLOT_W - 1) return true;
  if (z === FARM_PLOT_Z || z === FARM_PLOT_Z + FARM_PLOT_H - 1) return true;
  return false;
}

let _waterFrame = 0;
function WaterTile({ x, z }: { x: number; z: number }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    _waterFrame++;
    if (_waterFrame % 3 !== 0) return;
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

let _tilledFrame = 0;
function TilledTile({ x, z, watered }: { x: number; z: number; watered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    _tilledFrame++;
    if (_tilledFrame % 3 !== 0) return;
    if (meshRef.current && watered) {
      meshRef.current.position.y = 0.02 + Math.sin(Date.now() * 0.003 + x * 4 + z * 2) * 0.002;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.03, z]}>
      <planeGeometry args={[TILE_SIZE * 0.92, TILE_SIZE * 0.92]} />
      <meshStandardMaterial
        color={watered ? 0x5B3A1A : 0x4A3520}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}

function FencePost({ x, z }: { x: number; z: number }) {
  const postHeight = 0.6;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, postHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.06, postHeight, 0.06]} />
        <meshStandardMaterial color={0x6B4226} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.08, 0.03, 0.08]} />
        <meshStandardMaterial color={0x5C3A1E} roughness={0.8} />
      </mesh>
    </group>
  );
}

function FenceRail({ x1, z1, x2, z2 }: { x1: number; z1: number; x2: number; z2: number }) {
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);

  return (
    <group position={[cx, 0, cz]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.04, 0.03, len]} />
        <meshStandardMaterial color={0x7B5230} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.04, 0.03, len]} />
        <meshStandardMaterial color={0x7B5230} roughness={0.9} />
      </mesh>
    </group>
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

  const fenceElements = useMemo(() => {
    const posts: { x: number; z: number }[] = [];
    const rails: { x1: number; z1: number; x2: number; z2: number }[] = [];
    const step = 2;

    const addSegment = (fromX: number, fromZ: number, toX: number, toZ: number) => {
      const steps = Math.max(
        Math.ceil(Math.sqrt((toX - fromX) ** 2 + (toZ - fromZ) ** 2) / step),
        1
      );
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = fromX + (toX - fromX) * t;
        const pz = fromZ + (toZ - fromZ) * t;
        const gx = Math.round(px);
        const gz = Math.round(pz);
        if (!isGateTile(gx, gz)) {
          if (posts.findIndex(p => Math.abs(p.x - gx) < 0.1 && Math.abs(p.z - gz) < 0.1) === -1) {
            posts.push({ x: gx, z: gz });
          }
        }
      }
      const mgx = (fromX + toX) / 2 + 0.5;
      const mgz = (fromZ + toZ) / 2 + 0.5;
      if (!isGateTile(Math.round(mgx), Math.round(mgz))) {
        rails.push({ x1: fromX, z1: fromZ, x2: toX, z2: toZ });
      }
    };

    const minX = FARM_PLOT_X - 0.5;
    const maxX = FARM_PLOT_X + FARM_PLOT_W - 0.5;
    const minZ = FARM_PLOT_Z - 0.5;
    const maxZ = FARM_PLOT_Z + FARM_PLOT_H - 0.5;

    for (let x = minX; x < maxX; x += step) {
      const nx = Math.min(x + step, maxX);
      if (x >= GATE_X_START && x < GATE_X_END) continue;
      addSegment(x, minZ, nx, minZ);
    }
    for (let x = minX; x < maxX; x += step) {
      const nx = Math.min(x + step, maxX);
      addSegment(x, maxZ, nx, maxZ);
    }
    for (let z = minZ; z < maxZ; z += step) {
      const nz = Math.min(z + step, maxZ);
      addSegment(minX, z, minX, nz);
      addSegment(maxX, z, maxX, nz);
    }

    return { posts, rails };
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAP_SIZE / 2, -0.15, MAP_SIZE / 2]} receiveShadow>
        <planeGeometry args={[MAP_SIZE * 1.5, MAP_SIZE * 1.5]} />
        <meshStandardMaterial color={0x4A7A3A} roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[FARM_PLOT_X + FARM_PLOT_W / 2, -0.12, FARM_PLOT_Z + FARM_PLOT_H / 2]} receiveShadow>
        <planeGeometry args={[FARM_PLOT_W, FARM_PLOT_H]} />
        <meshStandardMaterial color={0x5C3A1E} roughness={1} />
      </mesh>

      {waterPositions.map(p => (
        <WaterTile key={`w${p.x},${p.z}`} x={p.x} z={p.z} />
      ))}

      {tilledPositions.map(p => (
        <TilledTile key={`t${p.x},${p.z}`} x={p.x} z={p.z} watered={p.watered} />
      ))}

      {fenceElements.posts.map((p, i) => (
        <FencePost key={`fp${i}`} x={p.x} z={p.z} />
      ))}
      {fenceElements.rails.map((r, i) => (
        <FenceRail key={`fr${i}`} x1={r.x1} z1={r.z1} x2={r.x2} z2={r.z2} />
      ))}
    </group>
  );
}
