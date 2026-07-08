import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MAP_SIZE } from '../types';

const ANIMAL_MODELS: Record<string, string> = {
  chicken: '/models/animals/chicken.glb',
  cow: '/models/animals/cow.glb',
  sheep: '/models/animals/sheep.glb',
  pig: '/models/animals/pig.glb',
  duck: '/models/animals/duck.glb',
  goat: '/models/animals/goat.glb',
  horse: '/models/animals/horse.glb',
  rabbit: '/models/animals/rabbit.glb',
  dog: '/models/animals/dog.glb',
  cat: '/models/animals/cat.glb',
};

const ANIMAL_SCALES: Record<string, number> = {
  chicken: 0.6, cow: 0.5, sheep: 0.5, pig: 0.5,
  duck: 0.6, goat: 0.5, horse: 0.6, rabbit: 0.5, dog: 0.5, cat: 0.4,
};

const ANIMAL_SPEEDS: Record<string, number> = {
  chicken: 0.8, duck: 0.8, rabbit: 0.8, horse: 1.2, cat: 0.9, dog: 0.9,
};

const FLOCK_TYPES = ['chicken', 'duck', 'rabbit'] as const;

function getSpeed(type: string): number {
  return ANIMAL_SPEEDS[type] ?? 0.4;
}

function playAnimalSound(type: string, playerDist: number) {
  if (playerDist > 12) return;
  const volume = Math.max(0.01, 0.05 * (1 - playerDist / 12));
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume, ctx.currentTime);

    switch (type) {
      case 'chicken':
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
        break;
      case 'duck':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
        break;
      case 'cow':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(); osc.stop(ctx.currentTime + 0.5);
        break;
      case 'sheep':
      case 'goat':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(); osc.stop(ctx.currentTime + 0.25);
        break;
      case 'pig':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(); osc.stop(ctx.currentTime + 0.35);
        break;
      case 'horse':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
        break;
      case 'rabbit':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
        break;
      case 'dog':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.2);
        osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(); osc.stop(ctx.currentTime + 0.5);
        break;
      case 'cat':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.2);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
        break;
    }
  } catch {}
}

const EMOTE_TYPES: Record<string, string[]> = {
  rabbit: ['bob', 'look', 'spin', 'hop'],
  dog: ['bob', 'spin', 'stretch', 'look'],
  cat: ['stretch', 'roll', 'look', 'spin'],
  chicken: ['peck', 'bob', 'spin'],
  duck: ['peck', 'bob', 'spin'],
  cow: ['bob', 'look', 'stretch'],
  sheep: ['bob', 'hop', 'look'],
  pig: ['spin', 'bob', 'look'],
  goat: ['bob', 'hop', 'look'],
  horse: ['bob', 'stretch', 'spin'],
};

const BASE_EMOTE_DURATION = 2.0;

interface EmoteState {
  active: boolean;
  type: string;
  phase: number;
  duration: number;
}

function runEmote(type: string, phase: number, duration: number, group: THREE.Group) {
  const t = phase / duration;
  const p = Math.sin(t * Math.PI);
  switch (type) {
    case 'bob':
      group.position.y = p * 0.12;
      break;
    case 'hop':
      group.position.y = p * 0.2;
      break;
    case 'peck':
      group.rotation.x = p * 0.3;
      break;
    case 'spin':
      group.rotation.y += 0.05;
      break;
    case 'stretch':
      group.scale.y = 1 + p * 0.3;
      group.scale.x = 1 - p * 0.1;
      group.scale.z = 1 - p * 0.1;
      break;
    case 'roll':
      group.rotation.z = p * 0.4;
      group.position.y = p * 0.08;
      break;
    case 'look':
      group.rotation.y += Math.sin(t * Math.PI * 2) * 0.2;
      break;
  }
}

function resetEmote(group: THREE.Group) {
  group.position.y = 0;
  group.rotation.x = 0;
  group.rotation.z = 0;
  group.scale.set(1, 1, 1);
}

function RiggedAnimal({ type, isMoving }: { type: string; isMoving: boolean }) {
  const url = ANIMAL_MODELS[type];
  const { scene: rawScene, animations } = useGLTF(url);
  const scene = useMemo(() => rawScene.clone(true), [rawScene]);
  const scale = ANIMAL_SCALES[type] ?? 1;

  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const actions = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const currentAnim = useRef<string>('');

  useEffect(() => {
    if (!scene) return;
    mixer.current = new THREE.AnimationMixer(scene);
    for (const clip of animations || []) {
      const action = mixer.current.clipAction(clip);
      actions.current.set(clip.name.toLowerCase(), action);
    }
    return () => { if (mixer.current) mixer.current.stopAllAction(); };
  }, [scene, animations]);

  useFrame((_, delta) => {
    if (!mixer.current) return;
    mixer.current.update(delta);
    const animName = isMoving ? 'walk' : 'idle';
    const prev = currentAnim.current;
    if (animName !== prev) {
      currentAnim.current = animName;
      const walkAction = findAction(actions.current, ['walk', 'run', 'gallop', 'move']);
      const idleAction = findAction(actions.current, ['idle', 'stand', 'still', 'rest']);
      if (isMoving && walkAction) {
        if (idleAction) idleAction.fadeOut(0.3);
        walkAction.reset().fadeIn(0.3).play();
      } else if (!isMoving && idleAction) {
        if (walkAction) walkAction.fadeOut(0.3);
        idleAction.reset().fadeIn(0.3).play();
      } else {
        const anyAction = walkAction || idleAction;
        if (anyAction && anyAction !== actions.current.get(prev)) {
          anyAction.reset().play();
        }
      }
    }
  });

  return <primitive object={scene} scale={scale} castShadow receiveShadow />;
}

function findAction(map: Map<string, THREE.AnimationAction>, names: string[]): THREE.AnimationAction | undefined {
  for (const n of names) {
    for (const [key, action] of map) {
      if (key.includes(n)) return action;
    }
  }
  return undefined;
}

function ProceduralAnimal({ type }: { type: string }) {
  const url = ANIMAL_MODELS[type];
  const { scene: rawScene } = useGLTF(url);
  const scene = useMemo(() => rawScene.clone(true), [rawScene]);
  const scale = ANIMAL_SCALES[type] ?? 1;
  return <primitive object={scene} scale={scale} castShadow receiveShadow />;
}

const ANIMATED_TYPES = ['chicken', 'cow', 'sheep', 'pig', 'horse', 'rabbit', 'dog', 'cat'];

function getIsAnimated(type: string): boolean {
  return ANIMATED_TYPES.includes(type);
}

interface AnimalProps {
  id: string;
  type: string;
  name: string;
  x: number;
  z: number;
}

function Animal({ type, x, z }: AnimalProps) {
  const ref = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Group>(null!);
  const target = useRef(new THREE.Vector3(x, 0, z));
  const timer = useRef(Math.random() * 10);
  const walkPhase = useRef(0);
  const jumpTimer = useRef(0);
  const isJumping = useRef(false);
  const jumpHeight = useRef(0);
  const soundTimer = useRef(5 + Math.random() * 10);
  const isMoving = useRef(false);

  const emote = useRef<EmoteState>({ active: false, type: '', phase: 0, duration: 2 });
  const emoteTimer = useRef(3 + Math.random() * 6);

  const isFlock = FLOCK_TYPES.includes(type as any);
  const isAnimated = getIsAnimated(type);

  const skipCounter = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current || !innerRef.current) return;

    skipCounter.current++;
    if (skipCounter.current % 2 !== 0) return;

    const px = (window as any).__playerPos?.x ?? 50;
    const pz = (window as any).__playerPos?.z ?? 50;
    const dxp = ref.current.position.x - px;
    const dzp = ref.current.position.z - pz;
    const playerDist = Math.sqrt(dxp * dxp + dzp * dzp);

    timer.current -= delta;
    if (timer.current <= 0) {
      timer.current = 2 + Math.random() * 5;
      const range = isFlock ? 5 : 15;
      target.current.set(
        Math.max(2, Math.min(MAP_SIZE - 2, ref.current.position.x + (Math.random() - 0.5) * range * 2)),
        0,
        Math.max(2, Math.min(MAP_SIZE - 2, ref.current.position.z + (Math.random() - 0.5) * range * 2)),
      );
    }

    soundTimer.current -= delta;
    if (soundTimer.current <= 0) {
      soundTimer.current = 8 + Math.random() * 15;
      playAnimalSound(type, playerDist);
    }

    jumpTimer.current -= delta;
    if (jumpTimer.current <= 0 && !isJumping.current) {
      if (Math.random() < 0.3) {
        isJumping.current = true;
        jumpHeight.current = 0;
      }
      jumpTimer.current = 3 + Math.random() * 5;
    }

    if (isJumping.current) {
      jumpHeight.current += delta * 6;
      ref.current.position.y = Math.sin(jumpHeight.current) * 0.15;
      if (jumpHeight.current >= Math.PI) {
        isJumping.current = false;
        jumpHeight.current = 0;
        ref.current.position.y = 0;
      }
    }

    emoteTimer.current -= delta;
    if (emoteTimer.current <= 0 && !emote.current.active) {
      const possible = EMOTE_TYPES[type];
      if (possible && possible.length > 0 && playerDist < 20) {
        const idx = Math.floor(Math.random() * possible.length);
        emote.current = { active: true, type: possible[idx], phase: 0, duration: BASE_EMOTE_DURATION * (0.8 + Math.random() * 0.4) };
      }
      emoteTimer.current = 5 + Math.random() * 8;
    }

    if (emote.current.active) {
      emote.current.phase += delta;
      if (emote.current.phase >= emote.current.duration) {
        emote.current.active = false;
        emote.current.phase = 0;
        resetEmote(innerRef.current);
      } else {
        runEmote(emote.current.type, emote.current.phase, emote.current.duration, innerRef.current);
      }
    }

    const dx = target.current.x - ref.current.position.x;
    const dz = target.current.z - ref.current.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const moving = dist > 0.1;
    isMoving.current = moving;

    if (moving) {
      const speed = getSpeed(type);
      const vx = (dx / dist) * speed * delta;
      const vz = (dz / dist) * speed * delta;
      ref.current.position.x += vx;
      ref.current.position.z += vz;
      ref.current.rotation.y = Math.atan2(dx, dz);
      if (!isJumping.current && !isAnimated) {
        walkPhase.current += delta * 4;
        ref.current.position.y = Math.abs(Math.sin(walkPhase.current)) * 0.003;
      }
    }
  });

  return (
    <group ref={ref} position={[x, 0, z]}>
      <group ref={innerRef}>
        {isAnimated ? (
          <RiggedAnimal type={type} isMoving={isMoving.current} />
        ) : (
          <ProceduralAnimal type={type} />
        )}
      </group>
    </group>
  );
}

function seedRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function generateWildAnimals(gameStateAnimals: { id: string; type: string; name: string; x: number; z: number }[]) {
  const wildTypes = ['chicken', 'duck', 'rabbit', 'sheep', 'pig', 'cat', 'dog', 'goat'];
  const rng = seedRandom(42);
  const wild: AnimalProps[] = [];
  const count = 20;

  const existingKeys = new Set(gameStateAnimals.map(a => `${Math.round(a.x)},${Math.round(a.z)}`));

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let wx: number, wz: number, key: string;
    do {
      if (i < 8) {
        wx = 30 + Math.floor(rng() * 40);
        wz = 30 + Math.floor(rng() * 40);
      } else {
        wx = 5 + Math.floor(rng() * (MAP_SIZE - 10));
        wz = 5 + Math.floor(rng() * (MAP_SIZE - 10));
      }
      key = `${wx},${wz}`;
      attempts++;
    } while ((existingKeys.has(key) || (wx >= 38 && wx < 62 && wz >= 56 && wz < 80)) && attempts < 30);

    const type = wildTypes[Math.floor(rng() * wildTypes.length)];
    wild.push({
      id: `wild_${i}`,
      type,
      name: `Wild ${type}`,
      x: wx,
      z: wz,
    });
  }
  return wild;
}

interface AnimalsProps {
  animals: AnimalProps[];
}

export function Animals({ animals }: AnimalsProps) {
  const wildAnimals = useMemo(() => generateWildAnimals(animals), [animals]);
  const allAnimals = useMemo(() => [...animals, ...wildAnimals], [animals, wildAnimals]);

  return (
    <group>
      {allAnimals.map(a => (
        <Animal key={a.id} {...a} />
      ))}
    </group>
  );
}
