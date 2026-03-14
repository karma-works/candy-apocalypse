import type { LevelParams } from './LevelLayout';

export interface ProceduralLevelMeta {
  params: LevelParams;
  label: string;
  description: string;
}

/**
 * 10 levels with increasing length, difficulty, and complexity.
 * Deterministic — same params always generate the same level.
 */
export const PROCEDURAL_LEVELS: ProceduralLevelMeta[] = [
  {
    params: { length: 2, difficulty: 1, complexity: 2 },
    label: 'BABY STEPS',
    description: 'Tiny map. Almost friendly.',
  },
  {
    params: { length: 3, difficulty: 2, complexity: 2 },
    label: 'SCOUT',
    description: 'Small and manageable.',
  },
  {
    params: { length: 3, difficulty: 3, complexity: 3 },
    label: 'ROOKIE',
    description: 'Things are getting warmer.',
  },
  {
    params: { length: 4, difficulty: 3, complexity: 4 },
    label: 'TRAINEE',
    description: 'More rooms to explore.',
  },
  {
    params: { length: 5, difficulty: 4, complexity: 4 },
    label: 'SOLDIER',
    description: 'Mid-tier. Stay alert.',
  },
  {
    params: { length: 5, difficulty: 5, complexity: 5 },
    label: 'FIGHTER',
    description: 'Balanced chaos.',
  },
  {
    params: { length: 6, difficulty: 6, complexity: 6 },
    label: 'VETERAN',
    description: 'Larger. Nastier. Faster.',
  },
  {
    params: { length: 7, difficulty: 7, complexity: 7 },
    label: 'SERGEANT',
    description: 'Cacodemons join the party.',
  },
  {
    params: { length: 8, difficulty: 8, complexity: 8 },
    label: 'NIGHTMARE',
    description: 'You will respawn. A lot.',
  },
  {
    params: { length: 10, difficulty: 10, complexity: 10 },
    label: 'ULTRAKILL',
    description: 'Maximum everything. Good luck.',
  },
];
