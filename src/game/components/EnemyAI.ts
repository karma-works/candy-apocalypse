import { Component } from "../entities/Entity";
import { Vector3 } from "@babylonjs/core";
import type { Player } from "../entities/Player";

export class EnemyAI extends Component {
  target: Player | null = null;
  speed = 2;
  attackRange = 2;
  attackDamage = 10;
  attackCooldown = 1;
  private lastAttackTime = 0;

  setTarget(target: Player): void {
    this.target = target;
  }

  update(deltaTime: number): void {
    if (!this.target || !this.entity?.mesh) return;

    if (this.target.health.isDead) {
      return;
    }

    const targetPos = this.target.getPosition();
    const myPos = this.entity.mesh.position;

    const distance = Vector3.Distance(targetPos, myPos);

    if (distance > this.attackRange) {
      const direction = targetPos.subtract(myPos).normalize();
      direction.y = 0;

      const movement = direction.scale(this.speed * deltaTime);
      this.entity.mesh.position.addInPlace(movement);

      this.entity.mesh.lookAt(new Vector3(targetPos.x, myPos.y, targetPos.z));
    } else {
      this.tryAttack();
    }
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
