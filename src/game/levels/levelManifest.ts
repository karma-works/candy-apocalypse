import type { LevelConfig } from '../state/gameStore';

export interface LevelManifest {
  levels: Record<string, LevelConfig>;
  defaultLevel: string;
}

let manifest: LevelManifest | null = null;

export async function loadManifest(): Promise<LevelManifest> {
  if (manifest) {
    return manifest;
  }

  const response = await fetch('/assets/levels/manifest.json');
  const data: LevelManifest = await response.json();
  manifest = data;
  return manifest;
}

export function getLevelConfig(
  levelId: string,
  manifest: LevelManifest,
): LevelConfig | undefined {
  return manifest.levels[levelId];
}

export function getDefaultLevel(manifest: LevelManifest): string {
  return manifest.defaultLevel;
}
