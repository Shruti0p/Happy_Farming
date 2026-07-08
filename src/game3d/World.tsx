import React, { useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { Terrain } from './terrain/Terrain';
import { Player } from './player/Player';
import { WorldObjects } from './objects/WorldObjects';
import { Crop3D } from './crops/Crop';
import { Buildings } from './buildings/Buildings';
import { Animals } from './animals/Animals';
import { GameCamera } from './camera/GameCamera';
import { Lighting, Sky } from './effects/Lighting';
import { Weather } from './effects/Weather';
import { Clouds } from './effects/Clouds';
import { Birds } from './effects/Birds';
import { AmbientSound } from './effects/AmbientSound';
import { Interaction } from './physics/Interaction';
import { Environment } from '@react-three/drei';
import { MAP_SIZE, MAP_CENTER, TILE_SIZE } from './types';
import type { SavedGameState } from '../game/types';
import type { WorldTile, Object3DData, Building3DData } from './types';

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  let state = Math.abs(hash);
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function generateTiles(seed: string): WorldTile[][] {
  const tiles: WorldTile[][] = [];
  const streamZ = Math.floor(MAP_SIZE / 3);
  const rng = seededRandom(seed);

  for (let z = 0; z < MAP_SIZE; z++) {
    const row: WorldTile[] = [];
    for (let x = 0; x < MAP_SIZE; x++) {
      let type: WorldTile['type'] = 'grass';
      const h = rng() * 0.04;

      if (z >= streamZ - 1 && z <= streamZ + 1 && x > MAP_SIZE * 0.3 && x < MAP_SIZE * 0.7) {
        type = 'water';
      }

      if (z === Math.floor(MAP_SIZE / 2) && x >= Math.floor(MAP_SIZE * 0.3) && x <= Math.floor(MAP_SIZE * 0.7)) {
        type = 'path';
      }
      if (z === Math.floor(MAP_SIZE / 2) + 1 && x >= Math.floor(MAP_SIZE * 0.3) && x <= Math.floor(MAP_SIZE * 0.7)) {
        type = 'path';
      }

      const center = MAP_SIZE / 2;
      const dx = x - center;
      const dz = z - center;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 5) {
        type = 'dirt';
      }

      row.push({ x, z, type, height: h });
    }
    tiles.push(row);
  }
  return tiles;
}

function generateObjects(seed: string, clearedObjects: string[]): Object3DData[] {
  const objects: Object3DData[] = [];
  const objectTypes: Object3DData['type'][] = ['tree', 'tree', 'tree', 'rock', 'bush', 'bush', 'flower', 'flower', 'stone', 'stone'];
  const rng = seededRandom(seed + '_objects');
  let idCounter = 0;

  for (let z = 3; z < MAP_SIZE - 3; z += 2) {
    for (let x = 3; x < MAP_SIZE - 3; x += 2) {
      if (rng() > 0.12) continue;

      const center = MAP_SIZE / 2;
      const dx = x - center;
      const dz = z - center;
      if (Math.sqrt(dx * dx + dz * dz) < 6) continue;

      if (z >= MAP_SIZE / 3 - 2 && z <= MAP_SIZE / 3 + 2 && x > MAP_SIZE * 0.3 && x < MAP_SIZE * 0.7) continue;
      if (x >= 40 && x < 60 && z >= 49 && z < 69) continue;

      const key = `${x},${z}`;
      if (clearedObjects.includes(key)) continue;

      const type = objectTypes[Math.floor(rng() * objectTypes.length)];
      objects.push({ id: `obj_${idCounter++}`, type, x, z });
    }
  }
  return objects;
}

interface WorldProps {
  gameState: SavedGameState;
  onPlayerMove: (x: number, z: number) => void;
  activeTool?: string;
}

export function World({ gameState, onPlayerMove, activeTool = 'hand' }: WorldProps) {
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([
    gameState.playerPos?.x ?? MAP_CENTER,
    0,
    gameState.playerPos?.y ?? MAP_CENTER,
  ]);

  const tiles = useMemo(() => generateTiles(gameState.seed), [gameState.seed]);
  const objects = useMemo(
    () => generateObjects(gameState.seed, gameState.clearedObjects || []),
    [gameState.seed, gameState.clearedObjects]
  );

  const crops3D = useMemo(() => {
    if (!gameState.crops) return [];
    return Object.entries(gameState.crops).map(([key, c]) => {
      const [cx, cz] = key.split(',').map(Number);
      return {
        key,
        cropId: c.cropId,
        stage: c.stage,
        x: cx,
        z: cz,
        watered: c.watered,
      };
    });
  }, [gameState.crops]);

  const structures = useMemo(() => {
    if (!gameState.structures) return [];
    return Object.entries(gameState.structures).map(([key, s]) => ({
      id: s.id,
      type: s.type as Object3DData['type'],
      x: s.x,
      z: s.y,
    }));
  }, [gameState.structures]);

  const buildingsList: Building3DData[] = useMemo(() => {
    const list: Building3DData[] = [];
    const center = MAP_SIZE / 2;
    const placements: Record<string, { x: number; z: number; offsetX: number; offsetZ: number }> = {
      farmhouse: { x: center, z: center, offsetX: 0, offsetZ: -6 },
      barn: { x: center, z: center, offsetX: 8, offsetZ: 3 },
      coop: { x: center, z: center, offsetX: 4, offsetZ: 7 },
      shed: { x: center, z: center, offsetX: -5, offsetZ: 8 },
      windmill: { x: center, z: center, offsetX: -7, offsetZ: -4 },
      greenhouse: { x: center, z: center, offsetX: -8, offsetZ: 1 },
    };

    Object.entries(gameState.buildings || {}).forEach(([key, b]) => {
      const p = placements[key];
      if (p) {
        list.push({
          id: b.id,
          type: key,
          x: p.x + p.offsetX,
          z: p.z + p.offsetZ,
          level: b.level || 1,
        });
      }
    });

    return list;
  }, [gameState.buildings]);

  const animals = useMemo(() => {
    if (!gameState.animals) return [];
    return gameState.animals.map(a => ({
      id: a.id,
      type: a.type,
      name: a.name,
      x: a.x ?? (MAP_CENTER + (Math.random() - 0.5) * 10),
      z: a.y ?? (MAP_CENTER + (Math.random() - 0.5) * 10),
    }));
  }, [gameState.animals]);

  const handlePlayerMove = useCallback((x: number, z: number) => {
    setPlayerPos([x, 0, z]);
    onPlayerMove(x, z);
  }, [onPlayerMove]);

  return (
    <>
      <Sky
        hour={gameState.hour}
        minute={gameState.minute}
        isRaining={gameState.weather === 'Rain' || gameState.weather === 'Storm'}
        isSnowing={false}
      />
      <Lighting
        hour={gameState.hour}
        minute={gameState.minute}
        isRaining={gameState.weather === 'Rain' || gameState.weather === 'Storm'}
        isSnowing={false}
      />
      <Weather weather={gameState.weather.toLowerCase()} />
      <Environment preset="park" />
      <fog attach="fog" args={[0x87CEEB, 40, 120]} />

      <Terrain tiles={tiles} playerX={playerPos[0]} playerZ={playerPos[2]} tilledTiles={gameState.tilledTiles} />
      <Clouds />
      <Birds />
      <AmbientSound />
      <WorldObjects objects={[...objects, ...structures]} />
      <Buildings buildings={buildingsList} />

      {crops3D.map(c => (
        <Crop3D key={c.key} {...c} />
      ))}

      <Animals animals={animals} />

      <Player position={playerPos} onPositionChange={handlePlayerMove} />

      <GameCamera playerPos={playerPos} />
      <Interaction activeTool={activeTool} />
    </>
  );
}
