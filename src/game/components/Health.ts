import { Component } from '../entities/Entity';
import { playSound } from '../../engine/audio/GameAudio';

export class Health extends Component {
  current: number;
  max: number;
  isDead = false;

  constructor(maxHealth = 100) {
    super();
    this.max = maxHealth;
    this.current = maxHealth;
  }

  takeDamage(amount: number): void {
    if (this.isDead) {
      return;
    }

    this.current = Math.max(0, this.current - amount);
    playSound('enemy_hurt');

    if (this.current <= 0) {
      this.isDead = true;
      playSound('enemy_death');
      this.onDeath();
    }
  }

  heal(amount: number): void {
    if (this.isDead) {
      return;
    }
    this.current = Math.min(this.max, this.current + amount);
  }

  setMax(max: number): void {
    this.max = max;
    this.current = Math.min(this.current, this.max);
  }

  getPercent(): number {
    return this.current / this.max;
  }

  protected onDeath(): void {
    playSound('enemy_death');
  }

  reset(): void {
    this.current = this.max;
    this.isDead = false;
  }
}
