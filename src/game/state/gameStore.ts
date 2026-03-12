import { create } from "zustand";

export interface SpawnPoint {
  type: string;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export interface LevelConfig {
  name: string;
  model: string;
  spawns: SpawnPoint[];
  ambient?: {
    music?: string;
    fog?: {
      mode: "none" | "linear" | "exp";
      start?: number;
      end?: number;
      density?: number;
      color?: [number, number, number];
    };
  };
}

const COMBO_LABELS: Array<{ minCombo: number; label: string }> = [
  { minCombo: 50, label: "DOOM ETERNAL...LY HAPPY! 🌈" },
  { minCombo: 20, label: "CHAOS EMPEROR! 👑" },
  { minCombo: 10, label: "DEMOLITION DERBY! 🚧" },
  { minCombo: 5, label: "MURDER PARTY! 🎉" },
  { minCombo: 3, label: "Triple Threat! ⚡" },
  { minCombo: 2, label: "Double Trouble! 💥" },
];

export interface GameState {
  currentLevel: string | null;
  isLoading: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  isVictory: boolean;
  currentWeapon: string | null;
  health: number;
  maxHealth: number;
  ammo: Record<string, number>;
  score: number;
  kills: number;
  killCombo: number;
  comboLabel: string;
  lastKillTime: number;

  setCurrentLevel: (level: string | null) => void;
  setLoading: (loading: boolean) => void;
  setPaused: (paused: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setVictory: (victory: boolean) => void;
  setCurrentWeapon: (weapon: string | null) => void;
  setHealth: (health: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  setAmmo: (type: string, count: number) => void;
  addAmmo: (type: string, count: number) => void;
  useAmmo: (type: string, count: number) => boolean;
  addScore: (points: number) => void;
  addKill: (points?: number) => void;
  clearComboLabel: () => void;
  reset: () => void;
  startGame: () => void;
  endGame: () => void;
}

const initialState = {
  currentLevel: null,
  isLoading: false,
  isPaused: false,
  isPlaying: false,
  isVictory: false,
  currentWeapon: null as string | null,
  health: 100,
  maxHealth: 100,
  ammo: {
    shotgun: 20,
    pistol: 50,
    chaingun: 100,
  },
  score: 0,
  kills: 0,
  killCombo: 0,
  comboLabel: "",
  lastKillTime: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setCurrentLevel: (level) => set({ currentLevel: level }),
  setLoading: (loading) => set({ isLoading: loading }),
  setPaused: (paused) => set({ isPaused: paused }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentWeapon: (weapon) => set({ currentWeapon: weapon }),

  setHealth: (health) =>
    set({ health: Math.max(0, Math.min(get().maxHealth, health)) }),

  takeDamage: (amount) =>
    set((state) => ({
      health: Math.max(0, state.health - amount),
    })),

  heal: (amount) =>
    set((state) => ({
      health: Math.min(state.maxHealth, state.health + amount),
    })),

  setAmmo: (type, count) =>
    set((state) => ({
      ammo: { ...state.ammo, [type]: Math.max(0, count) },
    })),

  addAmmo: (type, count) =>
    set((state) => ({
      ammo: { ...state.ammo, [type]: (state.ammo[type] ?? 0) + count },
    })),

  useAmmo: (type, count) => {
    const state = get();
    if ((state.ammo[type] ?? 0) >= count) {
      set({ ammo: { ...state.ammo, [type]: state.ammo[type] - count } });
      return true;
    }
    return false;
  },

  addScore: (points) => set((state) => ({ score: state.score + points })),

  addKill: (points = 100) => {
    const state = get();
    const now = performance.now();
    const timeSinceLast = now - state.lastKillTime;
    const comboReset = timeSinceLast > 3000;
    const newCombo = comboReset ? 1 : state.killCombo + 1;
    const comboEntry = COMBO_LABELS.find((c) => newCombo >= c.minCombo);
    const comboLabel = comboEntry ? comboEntry.label : "";
    set({
      kills: state.kills + 1,
      score: state.score + points * newCombo,
      killCombo: newCombo,
      comboLabel,
      lastKillTime: now,
    });
  },

  clearComboLabel: () => set({ comboLabel: "" }),

  reset: () => set(initialState),

  startGame: () => set({ isPlaying: true, isPaused: false, isVictory: false }),

  setVictory: (victory) => {
    set({ isVictory: victory, isPlaying: !victory });
    if (victory) {
      document.exitPointerLock?.();
    }
  },

  endGame: () => set({ isPlaying: false }),
}));
