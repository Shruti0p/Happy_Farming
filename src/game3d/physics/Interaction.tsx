import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MAP_SIZE } from '../types';
import { getBridge } from '../state/GameStateBridge';

const RAYCASTER = new THREE.Raycaster();
const PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const INTERSECT_POINT = new THREE.Vector3();

function tileKey(x: number, z: number): string {
  return `${Math.floor(x)},${Math.floor(z)}`;
}

function toGrid(worldX: number, worldZ: number): [number, number] {
  return [Math.floor(worldX), Math.floor(worldZ)];
}

export function Interaction({ activeTool }: { activeTool: string }) {
  const { camera, gl } = useThree();

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

      const moveToClick = () => {
        const moveFn = (window as any).__movePlayerTo;
        if (moveFn) moveFn(worldX, worldZ);
      };

      if (activeTool === 'hand') {
        const crop = state.crops?.[key];
        if (crop && crop.stage >= 3) {
          bridge.updateState(s => {
            if (s.crops[key]) {
              delete s.crops[key];
            }
          });
          return;
        }
        moveToClick();
      } else if (activeTool === 'hoe') {
        moveToClick();
      } else if (activeTool === 'water_can') {
        if (state.crops?.[key] && !state.crops[key].watered) {
          bridge.updateState(s => {
            if (s.crops[key]) {
              s.crops[key] = { ...s.crops[key], watered: true };
            }
          });
          return;
        }
        moveToClick();
      } else if (activeTool === 'axe' || activeTool === 'pickaxe') {
        const clearedKey = `${gx},${gz}`;
        const cleared = state.clearedObjects || [];
        if (!cleared.includes(clearedKey)) {
          bridge.updateState(s => {
            s.clearedObjects = [...(s.clearedObjects || []), clearedKey];
          });
          return;
        }
        moveToClick();
      } else if (activeTool.endsWith('_seeds')) {
        const cropId = activeTool.replace('_seeds', '');
        if (!state.crops?.[key]) {
          const seedItem = state.inventory.find(i => i.id === activeTool);
          if (seedItem && seedItem.count > 0) {
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
        }
        moveToClick();
      }
    };

    gl.domElement.addEventListener('click', onClick);
    return () => gl.domElement.removeEventListener('click', onClick);
  }, [activeTool, camera, gl]);

  return null;
}
