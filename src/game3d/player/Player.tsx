import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { TILE_SIZE, MAP_SIZE } from '../types';
import { getBridge } from '../state/GameStateBridge';

const WALK_SPEED = 2.5;
const RUN_SPEED = 4.0;

interface PlayerProps {
  position: [number, number, number];
  onPositionChange: (x: number, z: number) => void;
}

export function Player({ position, onPositionChange }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const keys = useRef<Set<string>>(new Set());
  const vel = useRef<[number, number]>([0, 0]);
  const currentDir = useRef<'down' | 'up' | 'left' | 'right'>('down');
  const walkPhase = useRef(0);

  const camera = useThree(s => s.camera);

  const { scene: rawScene } = useGLTF('/models/characters/farmer.glb');
  const scene = React.useMemo(() => rawScene.clone(true), [rawScene]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys.current.add(e.key.toLowerCase());
      e.preventDefault();
    };
    const onUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  const moveToward = useCallback((targetX: number, targetZ: number) => {
    const dx = targetX - groupRef.current.position.x;
    const dz = targetZ - groupRef.current.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > 0.1) {
      const speed = WALK_SPEED;
      vel.current[0] = (dx / dist) * speed;
      vel.current[1] = (dz / dist) * speed;
    }
  }, []);

  (window as any).__movePlayerTo = moveToward;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const shift = keys.current.has('shift');
    const speed = shift ? RUN_SPEED : WALK_SPEED;
    const fwd = keys.current.has('w') || keys.current.has('arrowup');
    const bwd = keys.current.has('s') || keys.current.has('arrowdown');
    const left = keys.current.has('a') || keys.current.has('arrowleft');
    const right = keys.current.has('d') || keys.current.has('arrowright');

    let mx = 0, mz = 0;
    if (fwd) mz -= 1;
    if (bwd) mz += 1;
    if (left) mx -= 1;
    if (right) mx += 1;

    if (mx !== 0 && mz !== 0) {
      mx *= 0.707;
      mz *= 0.707;
    }

    vel.current[0] += (mx * speed - vel.current[0]) * delta * 10;
    vel.current[1] += (mz * speed - vel.current[1]) * delta * 10;

    const newX = groupRef.current.position.x + vel.current[0] * delta;
    const newZ = groupRef.current.position.z + vel.current[1] * delta;

    if (newX >= 0 && newX <= MAP_SIZE && newZ >= 0 && newZ <= MAP_SIZE) {
      groupRef.current.position.x = newX;
      groupRef.current.position.z = newZ;
      onPositionChange(newX, newZ);
    }

    const moving = mx !== 0 || mz !== 0;
    if (moving) {
      walkPhase.current += delta * (shift ? 1.8 : 1);

      if (Math.abs(mx) > Math.abs(mz)) {
        currentDir.current = mx < 0 ? 'left' : 'right';
      } else {
        currentDir.current = mz < 0 ? 'up' : 'down';
      }

      const bob = Math.abs(Math.sin(walkPhase.current * 6)) * 0.02;
      groupRef.current.position.y = bob;

      const dirAngle = currentDir.current === 'down' ? 0 :
        currentDir.current === 'up' ? Math.PI :
          currentDir.current === 'left' ? Math.PI / 2 : -Math.PI / 2;
      groupRef.current.rotation.y += (dirAngle - groupRef.current.rotation.y) * delta * 8;
    } else {
      vel.current[0] *= 0.85;
      vel.current[1] *= 0.85;
      groupRef.current.position.y += (0 - groupRef.current.position.y) * 0.1;
      walkPhase.current = 0;
    }
  });

  useEffect(() => {
    if (groupRef.current && position) {
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [position[0], position[1], position[2]]);

  return (
    <group ref={groupRef} position={position} scale={0.6}>
      <primitive object={scene} castShadow receiveShadow />
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 12]} />
        <meshBasicMaterial color={0x000000} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
