import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

interface BuildingMeshProps {
  type: string;
  x: number;
  z: number;
  level?: number;
}

const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.9 });
const roofMatRed = new THREE.MeshStandardMaterial({ color: 0xAA4A44, roughness: 0.8 });
const roofMatBrown = new THREE.MeshStandardMaterial({ color: 0x6B4226, roughness: 0.9 });
const wallMatWhite = new THREE.MeshStandardMaterial({ color: 0xF5F0E1, roughness: 0.8 });
const wallMatCream = new THREE.MeshStandardMaterial({ color: 0xF5E6D3, roughness: 0.8 });
const wallMatBarn = new THREE.MeshStandardMaterial({ color: 0x8B2020, roughness: 0.8 });
const doorMat = new THREE.MeshStandardMaterial({ color: 0x5C3A21, roughness: 0.9 });
const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
const thatchMat = new THREE.MeshStandardMaterial({ color: 0xC4A66B, roughness: 1.0 });

function FarmHouse({ x, z, level = 1 }: { x: number; z: number; level: number }) {
  const group = useMemo(() => {
    const g = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.0), wallMatWhite);
    base.position.y = 0.25;
    base.castShadow = true;
    base.receiveShadow = true;
    g.add(base);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.3, 4), roofMatRed);
    roof.position.y = 0.55;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.02), doorMat);
    door.position.set(0, 0.15, 0.501);
    g.add(door);

    const winMat = new THREE.MeshStandardMaterial({ color: 0x87CEEB, roughness: 0.1 });
    for (let side = 0; side < 4; side++) {
      const angle = (side / 4) * Math.PI * 2;
      const wx = Math.cos(angle) * 0.5;
      const wz = Math.sin(angle) * 0.5;
      if (Math.abs(wx) < 0.1 && Math.abs(wz) > 0.48) continue;
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.02), winMat);
      win.position.set(wx * 0.8, 0.3, wz * 0.8);
      win.lookAt(0, 0.3, 0);
      g.add(win);
    }

    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.1), chimneyMat);
    chimney.position.set(0.3, 0.6, -0.3);
    g.add(chimney);

    if (level >= 2) {
      const ext = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.4), wallMatCream);
      ext.position.set(0, 0.125, -0.7);
      ext.castShadow = true;
      g.add(ext);
      const extRoof = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.15, 4), roofMatRed);
      extRoof.position.set(0, 0.325, -0.7);
      extRoof.rotation.y = Math.PI / 4;
      g.add(extRoof);
    }

    return g;
  }, [level]);

  return <primitive object={group} position={[x, 0, z]} />;
}

function GlbBarn({ x, z }: { x: number; z: number }) {
  const { scene: raw } = useGLTF('/models/buildings/barn.glb');
  const scene = useMemo(() => raw.clone(true), [raw]);
  return <primitive object={scene} position={[x, 0, z]} scale={1.2} castShadow receiveShadow />;
}

function Barn({ x, z }: { x: number; z: number }) {
  return <GlbBarn x={x} z={z} />;
}

function Coop({ x, z }: { x: number; z: number }) {
  const group = useMemo(() => {
    const g = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.6), wallMatCream);
    base.position.y = 0.15;
    base.castShadow = true;
    g.add(base);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.2, 4), thatchMat);
    roof.position.y = 0.35;
    roof.rotation.y = Math.PI / 4;
    g.add(roof);

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.01), doorMat);
    door.position.set(0, 0.1, 0.301);
    g.add(door);

    return g;
  }, []);

  return <primitive object={group} position={[x, 0, z]} />;
}

function Windmill({ x, z }: { x: number; z: number }) {
  const gRef = React.useRef<THREE.Group>(null!);

  const group = useMemo(() => {
    const g = new THREE.Group();

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.7, 8), wallMatWhite);
    base.position.y = 0.35;
    base.castShadow = true;
    g.add(base);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.18, 8), roofMatRed);
    roof.position.y = 0.7;
    g.add(roof);

    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xF5E6D3, roughness: 0.7 });
    const hub = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), bladeMat);
    hub.position.set(0, 0.65, 0.3);
    g.add(hub);

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.25, 0.03), bladeMat);
      blade.position.set(Math.sin(angle) * 0.12, 0.65 + Math.cos(angle) * 0.12, 0.3);
      blade.rotation.z = angle;
      blade.rotation.x = -0.2;
      g.add(blade);
    }

    return g;
  }, []);

  return <primitive ref={gRef} object={group} position={[x, 0, z]} />;
}

function Shop({ x, z }: { x: number; z: number }) {
  const group = useMemo(() => {
    const g = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.8), wallMatCream);
    base.position.y = 0.225;
    base.castShadow = true;
    g.add(base);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.25, 4), roofMatRed);
    roof.position.y = 0.5;
    roof.rotation.y = Math.PI / 4;
    g.add(roof);

    const signMat = new THREE.MeshStandardMaterial({ color: 0x2E5B82, roughness: 0.7 });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.01), signMat);
    sign.position.set(0, 0.25, 0.401);
    g.add(sign);

    return g;
  }, []);

  return <primitive object={group} position={[x, 0, z]} />;
}

const BUILDING_COMPONENTS: Record<string, React.FC<{ x: number; z: number; level?: number }>> = {
  farmhouse: FarmHouse,
  barn: Barn,
  coop: Coop,
  windmill: Windmill,
  shop: Shop,
};

export function Buildings({ buildings }: { buildings: { id: string; type: string; x: number; z: number; level?: number }[] }) {
  return (
    <group>
      {buildings.map(b => {
        const Comp = BUILDING_COMPONENTS[b.type];
        if (!Comp) return null;
        return <Comp key={b.id} x={b.x} z={b.z} level={b.level} />;
      })}
    </group>
  );
}
