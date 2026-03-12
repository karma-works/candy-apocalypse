/**
 * Procedural GLB Level Generator
 * Creates a simple test level with walls, floor, and spawn points
 *
 * Note: For GLB export, install @babylonjs/serializers
 */

import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
} from "@babylonjs/core";

export interface LevelConfig {
  name: string;
  size: { width: number; depth: number; height: number };
  walls: Array<{
    x: number;
    z: number;
    width: number;
    height: number;
    rotation?: number;
  }>;
  spawnPoint: { x: number; y: number; z: number };
  enemySpawns: Array<{ x: number; y: number; z: number; type: string }>;
  pickupSpawns: Array<{ x: number; y: number; z: number; type: string }>;
}

export class LevelGenerator {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Creates a simple test level with walls and floor
   */
  createSimpleLevel(): void {
    const config: LevelConfig = {
      name: "Test Level",
      size: { width: 20, depth: 20, height: 3 },
      walls: [
        { x: 0, z: 10, width: 20, height: 3 },
        { x: 0, z: -10, width: 20, height: 3 },
        { x: 10, z: 0, width: 0.5, height: 3 },
        { x: -10, z: 0, width: 0.5, height: 3 },
        { x: 3, z: 3, width: 2, height: 3 },
        { x: -4, z: -2, width: 3, height: 3, rotation: Math.PI / 4 },
        { x: 5, z: -5, width: 2, height: 3 },
      ],
      spawnPoint: { x: 0, y: 1.7, z: 0 },
      enemySpawns: [
        { x: 5, y: 0, z: 5, type: "demon" },
        { x: -5, y: 0, z: 5, type: "demon" },
        { x: 7, y: 0, z: -3, type: "imp" },
      ],
      pickupSpawns: [
        { x: -3, y: 0.5, z: -3, type: "health" },
        { x: 4, y: 0.5, z: -4, type: "ammo_pistol" },
        { x: -5, y: 0.5, z: 5, type: "ammo_shotgun" },
      ],
    };

    this.generateLevel(config);
  }

  /**
   * Generate a level from configuration
   */
  generateLevel(config: LevelConfig): void {
    const floorMat = new StandardMaterial("floorMat", this.scene);
    // Toxic Slime floor
    floorMat.diffuseColor = new Color3(0.2, 1.0, 0.0);
    floorMat.emissiveColor = new Color3(0.05, 0.2, 0.0);

    const wallMat = new StandardMaterial("wallMat", this.scene);
    // Mystic Violet walls
    wallMat.diffuseColor = new Color3(0.6, 0.36, 0.9);
    wallMat.emissiveColor = new Color3(0.1, 0.05, 0.2);

    const floor = MeshBuilder.CreateGround(
      "floor",
      {
        width: config.size.width,
        height: config.size.depth,
      },
      this.scene,
    );
    floor.material = floorMat;
    floor.checkCollisions = true;

    config.walls.forEach((wallConfig, index) => {
      const wall = MeshBuilder.CreateBox(
        `wall_${index}`,
        {
          width: wallConfig.width,
          height: wallConfig.height,
          depth: 0.5,
        },
        this.scene,
      );

      wall.position = new Vector3(
        wallConfig.x,
        wallConfig.height / 2,
        wallConfig.z,
      );

      if (wallConfig.rotation) {
        wall.rotation.y = wallConfig.rotation;
      }

      wall.material = wallMat;
      wall.checkCollisions = true;
    });

    const pillarMat = new StandardMaterial("pillarMat", this.scene);
    // Hot Pink pillars
    pillarMat.diffuseColor = new Color3(1.0, 0.0, 0.5);
    pillarMat.emissiveColor = new Color3(0.3, 0.0, 0.1);

    const pillar1 = MeshBuilder.CreateCylinder(
      "pillar_1",
      { height: 3, diameter: 1 },
      this.scene,
    );
    pillar1.position = new Vector3(-5, 1.5, 5);
    pillar1.material = pillarMat;
    pillar1.checkCollisions = true;

    const pillar2 = MeshBuilder.CreateCylinder(
      "pillar_2",
      { height: 3, diameter: 1 },
      this.scene,
    );
    pillar2.position = new Vector3(6, 1.5, 4);
    pillar2.material = pillarMat;
    pillar2.checkCollisions = true;
  }

  /**
   * Export the current scene to GLB format
   * Note: Requires @babylonjs/serializers package
   * Install with: pnpm add @babylonjs/serializers
   * Then use: GLTF2Export.GLTFAsync(this.scene, filename)
   */
  async exportToGLB(filename: string = "test-level.glb"): Promise<void> {
    console.warn("GLB export requires @babylonjs/serializers package");
    console.warn("Install with: pnpm add @babylonjs/serializers");
    console.warn(
      "Then use: import { GLTF2Export } from '@babylonjs/serializers'",
    );
    console.warn(
      `And call: await GLTF2Export.GLTFAsync(this.scene, '${filename}')`,
    );
  }
}

/**
 * Usage in browser console:
 *
 * import { LevelGenerator } from './engine/LevelGenerator'
 * const generator = new LevelGenerator(scene)
 * generator.createSimpleLevel()
 * await generator.exportToGLB('test-level.glb')
 */
