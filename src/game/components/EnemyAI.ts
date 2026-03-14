import { Component } from "../entities/Entity";
import { Vector3 } from "@babylonjs/core";
import type { Player } from "../entities/Player";

type AIState = "idle" | "chase" | "attack";
export type AttackType = "melee" | "ranged";

export class EnemyAI extends Component {
  target: Player | null = null;
  speed = 2;
  aggroRange = 15;   // distance at which enemy notices player

  /**
   * For melee enemies: attackRange is the distance at which they can hit.
   * For ranged enemies: attackRange is the *minimum* distance they prefer to stay at,
   *   and rangedAttackRange is the maximum distance they can fire from.
   */
  attackRange = 1.8;
  attackDamage = 10;
  attackCooldown = 1;

  attackType: AttackType = "melee";

  /** Ranged-only: max distance from which the enemy can shoot the player. */
  rangedAttackRange = 12;
  /** Ranged-only: 0–1 chance of a shot hitting; adds gameplay variability. */
  rangedAccuracy = 0.65;

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

    // ── State machine ──────────────────────────────────────────
    if (this.attackType === "melee") {
      // Melee: only attack when physically adjacent
      if (distance <= this.attackRange) {
        this.state = "attack";
      } else if (distance <= this.aggroRange) {
        this.state = "chase";
      } else {
        this.state = "idle";
      }
    } else {
      // Ranged: attack from afar; chase until within rangedAttackRange
      if (distance <= this.rangedAttackRange && distance > this.attackRange) {
        // Sweet spot — stand and shoot
        this.state = "attack";
      } else if (distance <= this.attackRange) {
        // Player got too close — back off by switching to idle (stop moving into player)
        this.state = "attack"; // still attack, just stop advancing
      } else if (distance <= this.aggroRange) {
        this.state = "chase";
      } else {
        this.state = "idle";
      }
    }

    // ── Execute state ──────────────────────────────────────────
    switch (this.state) {
      case "idle":
        this.doIdleBob(deltaTime);
        break;
      case "chase":
        this.doChase(dx, dz, distance, deltaTime);
        break;
      case "attack":
        this.tryAttack(distance);
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

    // Ranged enemies stop advancing once they're within rangedAttackRange
    if (this.attackType === "ranged" && len <= this.rangedAttackRange) return;

    const movement = new Vector3(
      (dx / len) * this.speed * deltaTime,
      0,
      (dz / len) * this.speed * deltaTime,
    );
    this.entity.mesh.position.addInPlace(movement);
    // BILLBOARDMODE_Y handles facing the camera — no lookAt needed
  }

  private tryAttack(distance: number): void {
    const now = performance.now() / 1000;
    if (now - this.lastAttackTime < this.attackCooldown) return;
    if (!this.target || this.target.health.isDead) return;

    if (this.attackType === "melee") {
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
