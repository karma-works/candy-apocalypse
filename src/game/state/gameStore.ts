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

export interface GameState {
  currentLevel: string | null;
  isLoading: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  health: number;
  maxHealth: number;
  ammo: Record<string, number>;
  score: number;

  setCurrentLevel: (level: string | null) => void;
  setLoading: (loading: boolean) => void;
  setPaused: (paused: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setHealth: (health: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  setAmmo: (type: string, count: number) => void;
  addAmmo: (type: string, count: number) => void;
  useAmmo: (type: string, count: number) => boolean;
  addScore: (points: number) => void;
  reset: () => void;
  startGame: () => void;
  endGame: () => void;
}

const initialState = {
  currentLevel: null,
  isLoading: false,
  isPaused: false,
  isPlaying: false,
  health: 100,
  maxHealth: 100,
  ammo: {
    shotgun: 20,
    pistol: 50,
    chaingun: 100,
  },
  score: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setCurrentLevel: (level) => set({ currentLevel: level }),
  setLoading: (loading) => set({ isLoading: loading }),
  setPaused: (paused) => set({ isPaused: paused }),
  setPlaying: (playing) => set({ isPlaying: playing }),

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

  reset: () => set(initialState),

  startGame: () => set({ isPlaying: true, isPaused: false }),

  endGame: () => set({ isPlaying: false }),
}));
