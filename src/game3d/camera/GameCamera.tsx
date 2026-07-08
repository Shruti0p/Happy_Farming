import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BASE_DISTANCE = 18;
const MIN_DIST = 5;
const MAX_DIST = 60;
const ROTATE_SPEED = 0.005;
const FOLLOW_SPEED = 3;

export function GameCamera({ playerPos }: { playerPos: [number, number, number] }) {
  const { camera, gl } = useThree();
  const angle = useRef(Math.PI / 4);
  const elevation = useRef(Math.PI / 6);
  const distance = useRef(BASE_DISTANCE);
  const target = useRef(new THREE.Vector3(playerPos[0], 0, playerPos[2]));
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const currentAngle = useRef(Math.PI / 4);
  const currentElevation = useRef(Math.PI / 6);
  const currentDist = useRef(BASE_DISTANCE);
  const playerRef = useRef(playerPos);

  playerRef.current = playerPos;

  useEffect(() => {
    const dist = BASE_DISTANCE;
    const elev = Math.PI / 6;
    const ang = Math.PI / 4;
    camera.position.set(
      playerPos[0] + Math.sin(ang) * Math.cos(elev) * dist,
      Math.sin(elev) * dist,
      playerPos[2] + Math.cos(ang) * Math.cos(elev) * dist,
    );
    camera.lookAt(playerPos[0], 0, playerPos[2]);
  }, [camera, playerPos[0], playerPos[2]]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      distance.current = Math.max(MIN_DIST, Math.min(MAX_DIST, distance.current + e.deltaY * 0.01));
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      currentAngle.current -= dx * ROTATE_SPEED;
      currentElevation.current = Math.max(0.05, Math.min(Math.PI / 2.5, currentElevation.current + dy * ROTATE_SPEED));
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const px = playerRef.current[0];
    const pz = playerRef.current[2];

    target.current.x += (px - target.current.x) * delta * FOLLOW_SPEED;
    target.current.z += (pz - target.current.z) * delta * FOLLOW_SPEED;

    angle.current += (currentAngle.current - angle.current) * delta * 3;
    elevation.current += (currentElevation.current - elevation.current) * delta * 3;
    currentDist.current += (distance.current - currentDist.current) * delta * 3;

    const dist = currentDist.current;
    const elev = elevation.current;
    const ang = angle.current;

    const camX = target.current.x + Math.sin(ang) * Math.cos(elev) * dist;
    const camY = Math.sin(elev) * dist;
    const camZ = target.current.z + Math.cos(ang) * Math.cos(elev) * dist;

    camera.position.x += (camX - camera.position.x) * delta * 4;
    camera.position.z += (camZ - camera.position.z) * delta * 4;
    camera.position.y += (camY - camera.position.y) * delta * 4;
    camera.lookAt(target.current.x, 0, target.current.z);
  });

  return null;
}
