import { Component } from "../entities/Entity";
import { Vector3 } from "@babylonjs/core";
import type { Player } from "../entities/Player";

type AIState = "idle" | "chase" | "attack";

export class EnemyAI extends Component {
  target: Player | null = null;
  speed = 2;
  aggroRange = 15;   // distance at which enemy notices player
  attackRange = 2;
  attackDamage = 10;
  attackCooldown = 1;
  private lastAttackTime = 0;
  private state: AIState = "idle";
  private idleTime = 0;
  private idleBobOriginY = 0;
  private idleBobInitialized = false;

  setTarget(target: Player): void {
    this.target = target;
  }

  update(deltaTime: number): void {
    if (!this.target || !this.entity?.mesh) return;

    if (this.target.health.isDead) {
      this.state = "idle";
      return;
    }

    const targetPos = this.target.getPosition();
    const myPos = this.entity.mesh.position;

    const dx = targetPos.x - myPos.x;
    const dz = targetPos.z - myPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // State transitions
    if (distance <= this.attackRange) {
      this.state = "attack";
    } else if (distance <= this.aggroRange) {
      this.state = "chase";
    } else {
      this.state = "idle";
    }

    switch (this.state) {
      case "idle":
        this.doIdleBob(deltaTime);
        break;
      case "chase":
        this.doChase(dx, dz, distance, deltaTime);
        break;
      case "attack":
        this.tryAttack();
        break;
    }
  }

  private doIdleBob(deltaTime: number): void {
    if (!this.entity?.mesh) return;
    if (!this.idleBobInitialized) {
      this.idleBobOriginY = this.entity.mesh.position.y;
      this.idleBobInitialized = true;
    }
    this.idleTime += deltaTime;
    // Gentle 0.1 unit bob at ~1Hz
    this.entity.mesh.position.y =
      this.idleBobOriginY + Math.sin(this.idleTime * Math.PI * 2) * 0.05;
  }

  private doChase(dx: number, dz: number, len: number, deltaTime: number): void {
    if (!this.entity?.mesh || len === 0) return;
    // Reset bob origin when transitioning from idle to chase
    this.idleBobInitialized = false;
    const movement = new Vector3(
      (dx / len) * this.speed * deltaTime,
      0,
      (dz / len) * this.speed * deltaTime,
    );
    this.entity.mesh.position.addInPlace(movement);
    // BILLBOARDMODE_Y handles facing the camera — no lookAt needed
  }

  private tryAttack(): void {
    const now = performance.now() / 1000;
    if (now - this.lastAttackTime < this.attackCooldown) return;

    if (this.target && !this.target.health.isDead) {
      this.target.takeDamage(this.attackDamage);
      this.lastAttackTime = now;
    }
  }
}
