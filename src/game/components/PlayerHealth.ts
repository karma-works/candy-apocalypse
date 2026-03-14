import { Component } from "../entities/Entity";
import { useGameStore } from "../state/gameStore";
import { DebugFlags } from "../debug/DebugFlags";

export class PlayerHealth extends Component {
  current: number;
  max: number;
  isDead = false;

  constructor(maxHealth = 100) {
    super();
    this.max = maxHealth;
    this.current = maxHealth;
  }

  takeDamage(amount: number): void {
    if (this.isDead) return;
    if (DebugFlags.godMode) return;  // ← god mode: ignore all damage

    this.current = Math.max(0, this.current - amount);

    useGameStore.getState().takeDamage(amount);

    if (this.current <= 0) {
      this.isDead = true;
      this.onDeath();
    }
  }


  heal(amount: number): void {
    if (this.isDead) return;
    this.current = Math.min(this.max, this.current + amount);
    useGameStore.getState().heal(amount);
  }

  setMax(max: number): void {
    this.max = max;
    this.current = Math.min(this.current, this.max);
    useGameStore.getState().maxHealth = max;
  }

  getPercent(): number {
    return this.current / this.max;
  }

  protected onDeath(): void {
    useGameStore.getState().endGame();
  }

  reset(): void {
    this.current = this.max;
    this.isDead = false;
    useGameStore.getState().setHealth(this.max);
  }
}
