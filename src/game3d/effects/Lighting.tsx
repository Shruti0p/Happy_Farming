import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Sky as DreiSky } from '@react-three/drei';

const DAY_DURATION = 120;

function getSunAngle(hour: number, minute: number): number {
  const t = (hour + minute / 60) / 24;
  return t * Math.PI * 2 - Math.PI / 2;
}

function getSunColor(hour: number, minute: number): THREE.Color {
  const t = (hour + minute / 60) / 24;
  const morning = 0.25;
  const noon = 0.5;
  const evening = 0.75;

  const color = new THREE.Color();

  if (t < morning || t > evening + 0.05) {
    color.setHex(0x1a1a3e);
    return color;
  }

  if (t < noon) {
    const p = (t - morning) / (noon - morning);
    color.lerpColors(new THREE.Color(0xFF8844), new THREE.Color(0xFFFFEE), p);
  } else {
    const p = (t - noon) / (evening - noon);
    color.lerpColors(new THREE.Color(0xFFFFEE), new THREE.Color(0xFF6633), p);
  }

  return color;
}

function getAmbientIntensity(hour: number, minute: number): number {
  const t = (hour + minute / 60) / 24;

  if (t < 0.08 || t > 0.92) return 0.08;

  if (t < 0.22) {
    const p = (t - 0.08) / (0.22 - 0.08);
    return 0.08 + p * 0.82;
  }

  if (t < 0.5) {
    const p = (t - 0.22) / (0.5 - 0.22);
    return 0.9 + p * 0.1;
  }

  if (t < 0.78) {
    const p = (t - 0.5) / (0.78 - 0.5);
    return 1.0 - p * 0.1;
  }

  const p = (t - 0.78) / (0.92 - 0.78);
  return 0.9 - p * 0.82;
}

interface LightingProps {
  hour: number;
  minute: number;
  isRaining?: boolean;
  isSnowing?: boolean;
}

export function Lighting({ hour, minute, isRaining, isSnowing }: LightingProps) {
  const sunRef = useRef<THREE.DirectionalLight>(null!);
  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const hemiRef = useRef<THREE.HemisphereLight>(null!);

  const weatherDim = isRaining || isSnowing ? 0.6 : 1.0;

  useFrame(() => {
    if (!sunRef.current || !ambientRef.current || !hemiRef.current) return;

    const angle = getSunAngle(hour, minute);
    const dist = 30;
    sunRef.current.position.set(
      Math.cos(angle) * dist,
      Math.sin(angle) * dist + 5,
      Math.cos(angle) * dist * 0.5,
    );

    const color = getSunColor(hour, minute);
    sunRef.current.color.copy(color);

    const intensity = Math.max(0, Math.sin(angle)) * 1.2 * weatherDim;
    sunRef.current.intensity = intensity;

    const ambIntensity = getAmbientIntensity(hour, minute) * weatherDim;
    ambientRef.current.intensity = ambIntensity * 0.8;

    const skyColor = new THREE.Color(
      ambIntensity * 0.5 + 0.3,
      ambIntensity * 0.6 + 0.3,
      ambIntensity * 0.7 + 0.35,
    );
    hemiRef.current.color.copy(skyColor);

    if (intensity > 0.1) {
      sunRef.current.castShadow = true;
    } else {
      sunRef.current.castShadow = false;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={getAmbientIntensity(hour, minute) * 0.5 * weatherDim} color={0xB0C4DE} />
      <hemisphereLight
        ref={hemiRef}
        args={[0x87CEEB, 0x5A8B4A, 0.4 * weatherDim]}
      />
      <directionalLight
        ref={sunRef}
        position={[15, 25, 15]}
        intensity={1.2 * weatherDim}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
    </>
  );
}

export function Sky({ hour, minute, isRaining, isSnowing }: LightingProps) {
  const { scene } = useThree();
  const angle = getSunAngle(hour, minute);
  const dist = 30;

  const sunPosition: [number, number, number] = [
    Math.cos(angle) * dist,
    Math.sin(angle) * dist + 5,
    Math.cos(angle) * dist * 0.5,
  ];

  const ambIntensity = getAmbientIntensity(hour, minute);
  const wd = isRaining || isSnowing ? 0.6 : 1.0;
  const isNight = ambIntensity < 0.3;

  const turbidity = isNight ? 20 : 8 - ambIntensity * 3;
  const rayleigh = isNight ? 4 : 1 + ambIntensity * 1.5;
  const mieCoefficient = isNight ? 0.1 : 0.003;
  const mieDirectionalG = isNight ? 0.3 : 0.85;

  const bg = useMemo(() => new THREE.Color(0x87CEEB), []);

  useFrame(() => {
    bg.setHSL(
      0.58 - ambIntensity * 0.06,
      0.15 + ambIntensity * 0.25,
      Math.max(0.08, (ambIntensity * 0.5 + 0.3) * wd),
    );
    scene.background = bg;
  });

  if (isNight) {
    return null;
  }

  return (
    <DreiSky
      distance={290}
      sunPosition={sunPosition}
      turbidity={turbidity}
      rayleigh={rayleigh}
      mieCoefficient={mieCoefficient}
      mieDirectionalG={mieDirectionalG}
    />
  );
}
