import {
  Color3,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

export function createTestLevel(scene: Scene): void {
  const floorMat = new StandardMaterial('floorMat', scene);
  // Toxic Slime floor
  floorMat.diffuseColor = new Color3(0.2, 1.0, 0.0);
  floorMat.emissiveColor = new Color3(0.05, 0.2, 0.0);

  const wallMat = new StandardMaterial('wallMat', scene);
  // Mystic Violet walls
  wallMat.diffuseColor = new Color3(0.6, 0.36, 0.9);
  wallMat.emissiveColor = new Color3(0.1, 0.05, 0.2);

  const floor = MeshBuilder.CreateGround(
    'floor',
    { width: 20, height: 20 },
    scene,
  );
  floor.material = floorMat;
  floor.checkCollisions = true;

  const createWall = (
    name: string,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    rotY = 0,
  ) => {
    const wall = MeshBuilder.CreateBox(name, { width, height, depth }, scene);
    wall.position = new Vector3(x, z, y);
    wall.rotation.y = rotY;
    wall.material = wallMat;
    wall.checkCollisions = true;
    return wall;
  };

  createWall('wall_n', 0, 10, 1.5, 20, 3, 0.4);
  createWall('wall_s', 0, -10, 1.5, 20, 3, 0.4);
  createWall('wall_e', 10, 0, 1.5, 0.4, 3, 20);
  createWall('wall_w', -10, 0, 1.5, 0.4, 3, 20);

  createWall('obstacle_1', 3, 3, 1.5, 2, 3, 0.4);
  createWall('obstacle_2', -4, -2, 1.5, 3, 3, 0.4, Math.PI / 4);
  createWall('obstacle_3', 5, -5, 1.5, 2, 3, 0.4);

  const pillarMat = new StandardMaterial('pillarMat', scene);
  // Hot Pink pillars
  pillarMat.diffuseColor = new Color3(1.0, 0.0, 0.5);
  pillarMat.emissiveColor = new Color3(0.3, 0.0, 0.1);

  const pillar1 = MeshBuilder.CreateCylinder(
    'pillar_1',
    { height: 3, diameter: 1 },
    scene,
  );
  pillar1.position = new Vector3(-5, 1.5, 5);
  pillar1.material = pillarMat;
  pillar1.checkCollisions = true;

  const pillar2 = MeshBuilder.CreateCylinder(
    'pillar_2',
    { height: 3, diameter: 1 },
    scene,
  );
  pillar2.position = new Vector3(6, 1.5, 4);
  pillar2.material = pillarMat;
  pillar2.checkCollisions = true;
}
