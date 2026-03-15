import { Component } from '../entities/Entity';
import { Ray, Scene, Vector3 } from '@babylonjs/core';
import type { Player } from '../entities/Player';

type AIState = 'idle' | 'chase' | 'attack';
export type AttackType = 'melee' | 'ranged';

export class EnemyAI extends Component {
  target: Player | null = null;
  speed = 2;
  aggroRange = 15;
  activationRange = 25;

  attackRange = 1.8;
  attackDamage = 10;
  attackCooldown = 1;

  attackType: AttackType = 'melee';

  rangedAttackRange = 12;
  rangedAccuracy = 0.65;

  private lastAttackTime = 0;
  private state: AIState = 'idle';
  private idleTime = 0;
  private idleBobOriginY = 0;
  private idleBobInitialized = false;
  private scene: Scene | null = null;
  private activated = false;

  setScene(scene: Scene): void {
    this.scene = scene;
  }

  activate(): void {
    this.activated = true;
  }

  isActivated(): boolean {
    return this.activated;
  }

  setTarget(target: Player): void {
    this.target = target;
  }

  update(deltaTime: number): void {
    if (!this.target || !this.entity?.mesh) {
      return;
    }

    if (this.target.health.isDead) {
      this.state = 'idle';
      return;
    }

    const targetPos = this.target.getPosition();
    const myPos = this.entity.mesh.position;

    const dx = targetPos.x - myPos.x;
    const dz = targetPos.z - myPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (!this.activated && distance <= this.aggroRange) {
      this.activated = true;
    }

    if (!this.activated) {
      this.state = 'idle';
    } else if (this.attackType === 'melee') {
      if (distance <= this.attackRange) {
        this.state = 'attack';
      } else {
        this.state = 'chase';
      }
    } else {
      if (distance <= this.rangedAttackRange && distance > this.attackRange) {
        this.state = 'attack';
      } else if (distance <= this.attackRange) {
        this.state = 'attack';
      } else {
        this.state = 'chase';
      }
    }

    // ── Execute state ──────────────────────────────────────────
    switch (this.state) {
    case 'idle':
      this.doIdleBob(deltaTime);
      break;
    case 'chase':
      this.doChase(dx, dz, distance, deltaTime);
      break;
    case 'attack':
      this.tryAttack(distance);
      break;
    }
  }

  private doIdleBob(deltaTime: number): void {
    if (!this.entity?.mesh) {
      return;
    }
    if (!this.idleBobInitialized) {
      this.idleBobOriginY = this.entity.mesh.position.y;
      this.idleBobInitialized = true;
    }
    this.idleTime += deltaTime;
    // Gentle 0.1 unit bob at ~1Hz
    this.entity.mesh.position.y =
      this.idleBobOriginY + Math.sin(this.idleTime * Math.PI * 2) * 0.05;
  }

  private doChase(
    dx: number,
    dz: number,
    len: number,
    deltaTime: number,
  ): void {
    if (!this.entity?.mesh || len === 0) {
      return;
    }
    this.idleBobInitialized = false;

    if (this.attackType === 'ranged' && len <= this.rangedAttackRange) {
      return;
    }

    const dirX = dx / len;
    const dirZ = dz / len;
    const moveDistance = this.speed * deltaTime;

    if (this.scene && this.entity.mesh) {
      const origin = this.entity.mesh.position.clone();
      origin.y = 0.5;
      const direction = new Vector3(dirX, 0, dirZ);
      const ray = new Ray(origin, direction, moveDistance + 0.5);
      const hit = this.scene.pickWithRay(ray, (mesh) => {
        if (mesh === this.entity?.mesh) {
          return false;
        }
        return mesh.checkCollisions && mesh.isEnabled();
      });

      if (hit?.hit) {
        return;
      }
    }

    const movement = new Vector3(dirX * moveDistance, 0, dirZ * moveDistance);
    this.entity.mesh.position.addInPlace(movement);
  }

  private tryAttack(distance: number): void {
    const now = performance.now() / 1000;
    if (now - this.lastAttackTime < this.attackCooldown) {
      return;
    }
    if (!this.target || this.target.health.isDead) {
      return;
    }

    if (this.attackType === 'melee') {
      // Melee: only deal damage if close enough
      if (distance <= this.attackRange) {
        this.target.takeDamage(this.attackDamage);
        this.lastAttackTime = now;
      }
    } else {
      // Ranged: fire a shot; apply accuracy roll so it doesn't always hit
      if (distance <= this.rangedAttackRange) {
        const hit = Math.random() < this.rangedAccuracy;
        if (hit) {
          this.target.takeDamage(this.attackDamage);
        }
        // Always advance the cooldown so the enemy "fired" even on a miss
        this.lastAttackTime = now;
      }
    }
  }
}
