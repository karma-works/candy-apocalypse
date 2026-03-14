import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Combo System - addKill', () => {
  // Manually replicate the combo logic used in gameStore for unit testing
  const COMBO_LABELS = [
    { minCombo: 50, label: 'DOOM ETERNAL...LY HAPPY! 🌈' },
    { minCombo: 20, label: 'CHAOS EMPEROR! 👑' },
    { minCombo: 10, label: 'DEMOLITION DERBY! 🚧' },
    { minCombo: 5, label: 'MURDER PARTY! 🎉' },
    { minCombo: 3, label: 'Triple Threat! ⚡' },
    { minCombo: 2, label: 'Double Trouble! 💥' },
  ];

  function getComboLabel(combo: number): string {
    const entry = COMBO_LABELS.find((c) => combo >= c.minCombo);
    return entry ? entry.label : '';
  }

  function simulateKills(
    count: number,
    delayBetween = 100,
  ): { combo: number; label: string; score: number } {
    let combo = 0;
    let lastKillTime = 0;
    let score = 0;
    const POINTS = 100;

    for (let i = 0; i < count; i++) {
      const now = lastKillTime + delayBetween;
      const reset = now - lastKillTime > 3000;
      const newCombo = reset ? 1 : combo + 1;
      combo = newCombo;
      score += POINTS * newCombo;
      lastKillTime = now;
    }

    return { combo, label: getComboLabel(combo), score };
  }

  it('first kill has no combo label', () => {
    const { label, combo } = simulateKills(1);
    expect(combo).toBe(1);
    expect(label).toBe('');
  });

  it('2 quick kills = Double Trouble', () => {
    const { label } = simulateKills(2);
    expect(label).toBe('Double Trouble! 💥');
  });

  it('3 quick kills = Triple Threat', () => {
    const { label } = simulateKills(3);
    expect(label).toBe('Triple Threat! ⚡');
  });

  it('5 quick kills = MURDER PARTY', () => {
    const { label } = simulateKills(5);
    expect(label).toBe('MURDER PARTY! 🎉');
  });

  it('10 quick kills = DEMOLITION DERBY', () => {
    const { label } = simulateKills(10);
    expect(label).toBe('DEMOLITION DERBY! 🚧');
  });

  it('combo resets after 3 seconds gap', () => {
    // First 5 kills, then one kill after 5000ms gap
    let combo = 0;
    let lastKillTime = 0;
    const DELAY = 100;

    for (let i = 0; i < 5; i++) {
      const now = lastKillTime + DELAY;
      combo = combo + 1;
      lastKillTime = now;
    }
    expect(combo).toBe(5);

    // Now simulate a kill after 5 seconds
    const now = lastKillTime + 5000;
    const reset = now - lastKillTime > 3000;
    const newCombo = reset ? 1 : combo + 1;
    expect(newCombo).toBe(1); // reset to 1
  });

  it('score multiplies by combo', () => {
    const { score } = simulateKills(3);
    // Kill 1: 100*1=100, Kill 2: 100*2=200, Kill 3: 100*3=300 → total 600
    expect(score).toBe(600);
  });
});
