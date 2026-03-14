import { Entity } from "./Entity";
import { Transform } from "../components/Transform";
import { Health } from "../components/Health";
import { EnemyAI } from "../components/EnemyAI";
import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
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
  /** Height of the billboard plane — used to offset Y so bottom sits on ground */
  private meshHeight = 1.5;

  constructor(id: string, enemyType: EnemyType = "demon") {
    super(id, `Enemy_${enemyType}`);

    this.enemyType = enemyType;
    this.transform = this.addComponent(new Transform());

    const healthMap: Record<EnemyType, number> = {
      demon: 30,
      imp: 25,
      cacodemon: 50,
    };

    this.health = this.addComponent(new Health(healthMap[enemyType]));
    this.ai = this.addComponent(new EnemyAI());

    const speedMap: Record<EnemyType, number> = {
      demon: 3,
      imp: 4,
      cacodemon: 2,
    };

    const damageMap: Record<EnemyType, number> = {
      demon: 15, // melee — only matters when right on top of player
      imp: 8, // ranged — fires repeatedly from a distance
      cacodemon: 20, // ranged — slow heavy shots
    };

    this.ai.speed = speedMap[enemyType];
    this.ai.attackDamage = damageMap[enemyType];

    // ── Attack type configuration ──────────────────────────────
    if (enemyType === "demon") {
      // Demon: pure melee charger — must be right on top of you to deal damage
      this.ai.attackType = "melee";
      this.ai.attackRange = 1.8;
      this.ai.attackCooldown = 0.8;
    } else if (enemyType === "imp") {
      // Imp: ranged shooter — fires fireball-like shots from up to 10 units
      this.ai.attackType = "ranged";
      this.ai.attackRange = 1.5; // won't advance closer than this
      this.ai.rangedAttackRange = 10;
      this.ai.rangedAccuracy = 0.7;
      this.ai.attackCooldown = 1.2;
    } else if (enemyType === "cacodemon") {
      // Cacodemon: slow heavy ranged — long range, lower accuracy, big hits
      this.ai.attackType = "ranged";
      this.ai.attackRange = 2.0;
      this.ai.rangedAttackRange = 14;
      this.ai.rangedAccuracy = 0.55;
      this.ai.attackCooldown = 2.0;
    }
  }

  createMesh(scene: Scene, textureManager: TextureManager | null = null): void {
    this.scene = scene;

    const sizeMap: Record<EnemyType, { height: number; width: number }> = {
      demon: { height: 1.95, width: 1.95 },
      imp: { height: 2.34, width: 2.34 },
      cacodemon: { height: 2.6, width: 2.6 },
    };

    const colorMap: Record<EnemyType, Color3> = {
      demon: new Color3(0.8, 0.2, 0.2),
      imp: new Color3(0.6, 0.4, 0.2),
      cacodemon: new Color3(0.4, 0.6, 0.4),
    };

    const { height, width } = sizeMap[this.enemyType];
    const mesh = MeshBuilder.CreatePlane(this.id, { height, width }, scene);

    // Make enemies face the camera
    mesh.billboardMode = Mesh.BILLBOARDMODE_Y;

    // Store height so setPosition can offset correctly
    this.meshHeight = height;

    // Do NOT bake y offset here — setPosition will apply it correctly
    // (previously mesh.position.y = height / 2 was overwritten by EntityManager.setPosition)

    const material = new StandardMaterial(`${this.id}_mat`, scene);

    let appliedTexture = false;
    if (textureManager) {
      // e.g "demon" -> "enemy-demon" or whatever the SVG symbol ID is.
      // Need to map the proper name if it differs, but let's try direct mapping.
      // The product design says "happy_imp", "cheerful_zombie", "party_demon"
      // or similar. Let's map our generic IDs to the actual SVG names if applicable.
      let texName = `enemy-${this.enemyType}`;
      if (this.enemyType === "demon") {
        texName = "party_demon";
      }
      if (this.enemyType === "imp") {
        texName = "happy_imp";
      }
      if (this.enemyType === "cacodemon") {
        texName = "disco_cacodemon";
      }

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

  /** Override to add height/2 so the bottom of the sprite sits on the floor. */
  setPosition(x: number, y: number, z: number): void {
    if (this.mesh) {
      this.mesh.position.set(x, y + this.meshHeight / 2, z);
    }
  }

  takeDamage(amount: number): void {
    this.health.takeDamage(amount);
  }

  dispose(): void {
    super.dispose();
  }
}
