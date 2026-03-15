import { Entity } from './Entity';
import { Transform } from '../components/Transform';
import { Health } from '../components/Health';
import { EnemyAI } from '../components/EnemyAI';
import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import type { Player } from './Player';
import { TextureManager } from '../../engine/assets/TextureManager';

export type EnemyType = 'demon' | 'imp' | 'cacodemon' | 'pigeon' | 'sheep';

export class Enemy extends Entity {
  transform: Transform;
  health: Health;
  ai: EnemyAI;
  enemyType: EnemyType;
  private scene: Scene | null = null;
  /** Height of the billboard plane — used to offset Y so bottom sits on ground */
  private meshHeight = 1.5;

  constructor(id: string, enemyType: EnemyType = 'demon') {
    super(id, `Enemy_${enemyType}`);

    this.enemyType = enemyType;
    this.transform = this.addComponent(new Transform());

    const healthMap: Record<EnemyType, number> = {
      demon: 30,
      imp: 25,
      cacodemon: 50,
      pigeon: 15,
      sheep: 40,
    };

    this.health = this.addComponent(new Health(healthMap[enemyType]));
    this.ai = this.addComponent(new EnemyAI());

    const speedMap: Record<EnemyType, number> = {
      demon: 3,
      imp: 4,
      cacodemon: 2,
      pigeon: 6,
      sheep: 2.5,
    };

    const damageMap: Record<EnemyType, number> = {
      demon: 15,
      imp: 8,
      cacodemon: 20,
      pigeon: 5,
      sheep: 50,
    };

    this.ai.speed = speedMap[enemyType];
    this.ai.attackDamage = damageMap[enemyType];

    // ── Attack type configuration ──────────────────────────────
    if (enemyType === 'demon') {
      // Demon: pure melee charger — must be right on top of you to deal damage
      this.ai.attackType = 'melee';
      this.ai.attackRange = 1.8;
      this.ai.attackCooldown = 0.8;
    } else if (enemyType === 'imp') {
      // Imp: ranged shooter — fires fireball-like shots from up to 10 units
      this.ai.attackType = 'ranged';
      this.ai.attackRange = 1.5; // won't advance closer than this
      this.ai.rangedAttackRange = 10;
      this.ai.rangedAccuracy = 0.7;
      this.ai.attackCooldown = 1.2;
    } else if (enemyType === 'cacodemon') {
      this.ai.attackType = 'ranged';
      this.ai.attackRange = 2.0;
      this.ai.rangedAttackRange = 14;
      this.ai.rangedAccuracy = 0.55;
      this.ai.attackCooldown = 2.0;
    } else if (enemyType === 'pigeon') {
      this.ai.attackType = 'melee';
      this.ai.attackRange = 1.2;
      this.ai.attackCooldown = 0.4;
    } else if (enemyType === 'sheep') {
      this.ai.attackType = 'melee';
      this.ai.attackRange = 1.5;
      this.ai.attackCooldown = 3.0;
    }
  }

  createMesh(scene: Scene, textureManager: TextureManager | null = null): void {
    this.scene = scene;

    const sizeMap: Record<EnemyType, { height: number; width: number }> = {
      demon: { height: 1.95, width: 1.95 },
      imp: { height: 2.34, width: 2.34 },
      cacodemon: { height: 2.6, width: 2.6 },
      pigeon: { height: 1.5, width: 1.5 },
      sheep: { height: 2.0, width: 2.0 },
    };

    const colorMap: Record<EnemyType, Color3> = {
      demon: new Color3(0.8, 0.2, 0.2),
      imp: new Color3(0.6, 0.4, 0.2),
      cacodemon: new Color3(0.4, 0.6, 0.4),
      pigeon: new Color3(0.6, 0.36, 0.9),
      sheep: new Color3(1, 0.7, 0.8),
    };

    const { height, width } = sizeMap[this.enemyType];
    const mesh = MeshBuilder.CreatePlane(this.id, { height, width }, scene);

    mesh.billboardMode = Mesh.BILLBOARDMODE_Y;

    this.meshHeight = height;

    const material = new StandardMaterial(`${this.id}_mat`, scene);

    let appliedTexture = false;
    if (textureManager) {
      let texName = `enemy-${this.enemyType}`;
      if (this.enemyType === 'demon') {
        texName = 'party_demon';
      }
      if (this.enemyType === 'imp') {
        texName = 'happy_imp';
      }
      if (this.enemyType === 'cacodemon') {
        texName = 'disco_cacodemon';
      }
      if (this.enemyType === 'pigeon') {
        texName = 'pigeon_possessed';
      }
      if (this.enemyType === 'sheep') {
        texName = 'suicide_sheep';
      }

      const texture = textureManager.getTexture(texName);
      if (texture) {
        texture.hasAlpha = true;
        material.diffuseTexture = texture;
        material.useAlphaFromDiffuseTexture = true;
        material.emissiveColor = new Color3(0.8, 0.8, 0.8);
        material.backFaceCulling = false;
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

    this.ai.setScene(scene);
  }

  setTarget(target: Player): void {
    this.ai.setTarget(target);
  }

  update(deltaTime: number): void {
    super.update(deltaTime);

    if (this.health.isDead) {
      if (this.isActive) {
        window.dispatchEvent(
          new CustomEvent('enemyDeath', {
            detail: {
              position: this.getPosition(),
              enemyType: this.enemyType,
            },
          }),
        );
      }
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
