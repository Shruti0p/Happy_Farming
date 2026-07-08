import * as THREE from 'three';

export function createTreeMesh(): THREE.Group {
  const group = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.6, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.3;
  trunk.castShadow = true;
  group.add(trunk);

  const colors = [0x2D6A4F, 0x40916C, 0x52B788];
  const foliagePositions = [
    { x: 0, y: 0.65, z: 0, r: 0.35 },
    { x: -0.2, y: 0.5, z: 0.15, r: 0.28 },
    { x: 0.2, y: 0.5, z: -0.1, r: 0.28 },
    { x: 0, y: 0.4, z: -0.2, r: 0.25 },
    { x: -0.15, y: 0.85, z: -0.05, r: 0.22 },
  ];
  foliagePositions.forEach((p, i) => {
    const geo = new THREE.SphereGeometry(p.r, 7, 7);
    const mat = new THREE.MeshStandardMaterial({
      color: colors[i % colors.length],
      roughness: 0.8,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(p.x, p.y, p.z);
    mesh.castShadow = true;
    group.add(mesh);
  });

  return group;
}

export function createRockMesh(): THREE.Mesh {
  const geo = new THREE.DodecahedronGeometry(0.15, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0x7A828A, roughness: 0.9 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.08;
  mesh.scale.set(1, 0.6, 0.8);
  mesh.rotation.set(Math.random(), Math.random(), 0);
  mesh.castShadow = true;
  return mesh;
}

export function createBushMesh(): THREE.Group {
  const group = new THREE.Group();
  const colors = [0x38B000, 0x4CCD00, 0x2D9300];
  for (let i = 0; i < 4; i++) {
    const geo = new THREE.SphereGeometry(0.08 + Math.random() * 0.05, 6, 6);
    const mat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 0.2,
      0.06 + Math.random() * 0.08,
      (Math.random() - 0.5) * 0.2
    );
    group.add(mesh);
  }
  return group;
}

export function createFlowerMesh(color: number = 0xF15BB5): THREE.Group {
  const group = new THREE.Group();
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x38B000 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 4), stemMat);
  stem.position.y = 0.06;
  group.add(stem);
  const petalMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.03, 5, 5), petalMat);
    petal.position.set(Math.cos(angle) * 0.035, 0.12, Math.sin(angle) * 0.035);
    group.add(petal);
  }
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xFEE440 });
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.02, 5, 5), centerMat);
  center.position.y = 0.12;
  group.add(center);
  return group;
}

export function createFenceMesh(): THREE.Group {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.9 });

  const postGeo = new THREE.BoxGeometry(0.04, 0.2, 0.04);
  const postL = new THREE.Mesh(postGeo, woodMat);
  postL.position.set(-0.2, 0.1, 0);
  group.add(postL);
  const postR = new THREE.Mesh(postGeo, woodMat);
  postR.position.set(0.2, 0.1, 0);
  group.add(postR);

  const railMat = new THREE.MeshStandardMaterial({ color: 0xA06D3B, roughness: 0.9 });
  const railGeo = new THREE.BoxGeometry(0.4, 0.02, 0.02);
  const railB = new THREE.Mesh(railGeo, railMat);
  railB.position.set(0, 0.08, 0);
  group.add(railB);
  const railT = new THREE.Mesh(railGeo, railMat);
  railT.position.set(0, 0.16, 0);
  group.add(railT);

  return group;
}

export function createLanternMesh(): THREE.Group {
  const group = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0x5C3A21, roughness: 0.9 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.25, 6), postMat);
  post.position.y = 0.125;
  group.add(post);

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xFFEA00,
    emissive: 0xFFAA00,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.7,
  });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.06), glassMat);
  glass.position.y = 0.25;
  group.add(glass);

  return group;
}

export function createScarecrowMesh(): THREE.Group {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.9 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.3, 6), woodMat);
  post.position.y = 0.15;
  group.add(post);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.02), woodMat);
  arm.position.set(0, 0.22, 0);
  group.add(arm);

  const clothMat = new THREE.MeshStandardMaterial({ color: 0xD4A373, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), clothMat);
  body.position.set(0, 0.18, 0);
  group.add(body);

  const headMat = new THREE.MeshStandardMaterial({ color: 0xF5E6D3 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), headMat);
  head.position.set(0, 0.28, 0);
  group.add(head);

  return group;
}
