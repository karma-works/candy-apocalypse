import { Entity } from "./Entity";
import { Transform } from "../components/Transform";
import { Health } from "../components/Health";
import { EnemyAI } from "../components/EnemyAI";
import {
  Vector3,
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Mesh,
} from "@babylonjs/core";
import type { Player } from "./Player";
import { TextureManager } from "../../engine/assets/TextureManager";

export type EnemyType = "demon" | "imp" | "cacodemon";

export class Enemy extends Entity {
  transform: Transform;
  health: Health;
  ai: EnemyAI;
  enemyType: EnemyType;
  private scene: Scene | null = null;

  constructor(id: string, enemyType: EnemyType = "demon") {
    super(id, `Enemy_${enemyType}`);

    this.enemyType = enemyType;
    this.transform = this.addComponent(new Transform());

    const healthMap: Record<EnemyType, number> = {
      demon: 60,
      imp: 40,
      cacodemon: 100,
    };

    this.health = this.addComponent(new Health(healthMap[enemyType]));
    this.ai = this.addComponent(new EnemyAI());

    const speedMap: Record<EnemyType, number> = {
      demon: 3,
      imp: 4,
      cacodemon: 2,
    };

    const damageMap: Record<EnemyType, number> = {
      demon: 15,
      imp: 10,
      cacodemon: 25,
    };

    this.ai.speed = speedMap[enemyType];
    this.ai.attackDamage = damageMap[enemyType];
  }

  createMesh(scene: Scene, textureManager: TextureManager | null = null): void {
    this.scene = scene;

    const sizeMap: Record<EnemyType, { height: number; width: number }> = {
      demon: { height: 1.5, width: 1.5 },
      imp: { height: 1.8, width: 1.8 },
      cacodemon: { height: 2, width: 2 },
    };

    const colorMap: Record<EnemyType, Color3> = {
      demon: new Color3(0.8, 0.2, 0.2),
      imp: new Color3(0.6, 0.4, 0.2),
      cacodemon: new Color3(0.4, 0.6, 0.4),
    };

    const { height, width } = sizeMap[this.enemyType];
    const mesh = MeshBuilder.CreatePlane(
      this.id,
      { height, width },
      scene,
    );

    // Make enemies face the camera
    mesh.billboardMode = Mesh.BILLBOARDMODE_Y;

    // Lift the plane so its bottom is on the ground
    // But since transformations in Babylon use center origin by default,
    // we just offset the position's Y in EntityManager, or bake it here:
    mesh.position.y = height / 2;

    const material = new StandardMaterial(`${this.id}_mat`, scene);

    let appliedTexture = false;
    if (textureManager) {
      // e.g "demon" -> "enemy-demon" or whatever the SVG symbol ID is.
      // Need to map the proper name if it differs, but let's try direct mapping.
      // The product design says "happy_imp", "cheerful_zombie", "party_demon"
      // or similar. Let's map our generic IDs to the actual SVG names if applicable.
      let texName = `enemy-${this.enemyType}`;
      if (this.enemyType === "demon") texName = "party_demon";
      if (this.enemyType === "imp") texName = "happy_imp";
      if (this.enemyType === "cacodemon") texName = "disco_cacodemon";

      const texture = textureManager.getTexture(texName);
      if (texture) {
        texture.hasAlpha = true;
        material.diffuseTexture = texture;
        material.useAlphaFromDiffuseTexture = true;
        material.emissiveColor = new Color3(0.8, 0.8, 0.8); // Make it bright and lively
        material.backFaceCulling = false; // Fix visibility inversion with BILLBOARDMODE_Y
        appliedTexture = true;
      }
    }

    if (!appliedTexture) {
      material.diffuseColor = colorMap[this.enemyType];
    }

    mesh.material = material;
    mesh.checkCollisions = true;
    mesh.isPickable = true;

    this.setMesh(mesh);
  }

  setTarget(target: Player): void {
    this.ai.setTarget(target);
  }

  update(deltaTime: number): void {
    super.update(deltaTime);

    if (this.health.isDead) {
      this.isActive = false;
      if (this.mesh) {
        this.mesh.setEnabled(false);
      }
      return;
    }
  }

  takeDamage(amount: number): void {
    this.health.takeDamage(amount);
  }

  dispose(): void {
    super.dispose();
  }
}
