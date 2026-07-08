import { useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MAP_SIZE } from '../types';
import { getBridge } from '../state/GameStateBridge';
import { CROPS } from '../../game/types';

const RAYCASTER = new THREE.Raycaster();
const PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const INTERSECT_POINT = new THREE.Vector3();

function tileKey(x: number, z: number): string {
  return `${Math.floor(x)},${Math.floor(z)}`;
}

function toGrid(worldX: number, worldZ: number): [number, number] {
  return [Math.floor(worldX), Math.floor(worldZ)];
}

const FARM_PLOT_X = 40;
const FARM_PLOT_Z = 49;
const FARM_PLOT_W = 20;
const FARM_PLOT_H = 20;

function isInFarmPlot(gx: number, gz: number): boolean {
  return gx >= FARM_PLOT_X && gx < FARM_PLOT_X + FARM_PLOT_W &&
         gz >= FARM_PLOT_Z && gz < FARM_PLOT_Z + FARM_PLOT_H;
}

export function Interaction({ activeTool }: { activeTool: string }) {
  const { camera, gl } = useThree();

  const moveToClick = useCallback((worldX: number, worldZ: number) => {
    const moveFn = (window as any).__movePlayerTo;
    if (moveFn) moveFn(worldX, worldZ);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      RAYCASTER.setFromCamera(mouse, camera);
      const hit = RAYCASTER.ray.intersectPlane(PLANE, INTERSECT_POINT);
      if (!hit) return;

      const worldX = Math.max(0, Math.min(MAP_SIZE, INTERSECT_POINT.x));
      const worldZ = Math.max(0, Math.min(MAP_SIZE, INTERSECT_POINT.z));

      const [gx, gz] = toGrid(worldX, worldZ);
      const key = tileKey(gx, gz);
      const bridge = getBridge();
      if (!bridge) return;

      const state = bridge.getState();

      if (activeTool === 'hand') {
        const crop = state.crops?.[key];
        if (crop && crop.stage >= 3) {
          const cropType = CROPS[crop.cropId];
          const sellPrice = cropType?.sellPrice ?? 10;
          bridge.updateState(s => {
            if (s.crops[key]) {
              delete s.crops[key];
            }
            s.coins = (s.coins || 0) + sellPrice;
            s.xp = (s.xp || 0) + 20;
            if (s.xp >= s.level * 200) {
              s.xp -= s.level * 200;
              s.level += 1;
            }
          });
          return;
        }
        moveToClick(worldX, worldZ);
      } else if (activeTool === 'hoe') {
        if (isInFarmPlot(gx, gz)) {
          bridge.updateState(s => {
            s.tilledTiles = s.tilledTiles || {};
            if (!s.tilledTiles[key]) {
              s.tilledTiles[key] = { watered: false };
            }
          });
          return;
        }
        moveToClick(worldX, worldZ);
      } else if (activeTool === 'water_can') {
        const tilledTiles = state.tilledTiles || {};
        if (tilledTiles[key]) {
          bridge.updateState(s => {
            if (s.tilledTiles[key]) {
              s.tilledTiles[key] = { ...s.tilledTiles[key], watered: true };
            }
          });
          return;
        }
        const crop = state.crops?.[key];
        if (crop && !crop.watered) {
          bridge.updateState(s => {
            if (s.crops[key]) {
              s.crops[key] = { ...s.crops[key], watered: true };
            }
          });
          return;
        }
        moveToClick(worldX, worldZ);
      } else if (activeTool === 'axe' || activeTool === 'pickaxe') {
        const clearedKey = `${gx},${gz}`;
        const cleared = state.clearedObjects || [];
        if (!cleared.includes(clearedKey)) {
          bridge.updateState(s => {
            s.clearedObjects = [...(s.clearedObjects || []), clearedKey];
          });
          return;
        }
        moveToClick(worldX, worldZ);
      } else if (activeTool.endsWith('_seeds')) {
        const cropId = activeTool.replace('_seeds', '');
        const tilledTiles = state.tilledTiles || {};
        if (!tilledTiles[key]) {
          moveToClick(worldX, worldZ);
          return;
        }
        if (state.crops?.[key]) {
          moveToClick(worldX, worldZ);
          return;
        }
        const seedItem = state.inventory.find(i => i.id === activeTool);
        if (seedItem && seedItem.count > 0) {
          const cropDef = CROPS[cropId];
          if (cropDef && state.level < cropDef.level) {
            return;
          }
          bridge.updateState(s => {
            s.crops[key] = {
              cropId,
              stage: 0,
              watered: false,
              plantedAt: (s.day - 1) * 1440 + s.hour * 60 + s.minute,
              lastWateredAt: 0,
            };
            s.inventory = s.inventory.map(i =>
              i.id === activeTool ? { ...i, count: i.count - 1 } : i
            ).filter(i => i.count > 0);
          });
          return;
        }
        moveToClick(worldX, worldZ);
      }
    };

    gl.domElement.addEventListener('click', onClick);
    return () => gl.domElement.removeEventListener('click', onClick);
  }, [activeTool, camera, gl, moveToClick]);

  return null;
}
