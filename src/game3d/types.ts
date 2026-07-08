import * as THREE from 'three';

export interface WorldTile {
  x: number;
  z: number;
  type: 'grass' | 'dirt' | 'path' | 'water' | 'bridge' | 'plowed_dry' | 'plowed_wet';
  height?: number;
}

export interface Object3DData {
  id: string;
  type: 'tree' | 'rock' | 'bush' | 'flower' | 'fence' | 'scarecrow' | 'lantern' | 'stone';
  x: number;
  z: number;
  cleared?: boolean;
}

export interface Crop3DData {
  key: string;
  cropId: string;
  stage: number;
  x: number;
  z: number;
  watered: boolean;
}

export interface Animal3DData {
  id: string;
  type: string;
  name: string;
  x: number;
  z: number;
}

export interface Building3DData {
  id: string;
  type: string;
  x: number;
  z: number;
  level?: number;
}

export interface GameWorldState {
  tiles: WorldTile[][];
  objects: Object3DData[];
  crops: Crop3DData[];
  animals: Animal3DData[];
  playerX: number;
  playerZ: number;
  day: number;
  hour: number;
  minute: number;
  season: string;
  weather: string;
}

export const TILE_SIZE = 1;
export const MAP_SIZE = 100;
export const MAP_CENTER = MAP_SIZE * TILE_SIZE / 2;
