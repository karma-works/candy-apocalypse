/**
 * BabylonJS builder layer — turns a GeneratedLevel data structure into scene meshes.
 * Keep this as the only file that imports from @babylonjs/core in the procedural pipeline.
 */

import { Color3, MeshBuilder, Scene, StandardMaterial } from '@babylonjs/core';
import type { GeneratedLevel } from './LevelLayout';
import { WALL_H } from './LevelLayout';
import { CloudCeiling } from '../effects/CloudCeiling';

const WALL_T = 0.4;

export interface BuiltLevel {
  cloudCeiling: CloudCeiling;
}

function hslToRgb(h: number, s: number, l: number): Color3 {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(h / 60 % 2 - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return new Color3(r + m, g + m, b + m);
}

export function buildLevel(level: GeneratedLevel, scene: Scene): BuiltLevel {
  const wallMat = new StandardMaterial('proc_wall', scene);
  wallMat.diffuseColor = new Color3(0.6, 0.36, 0.9);
  wallMat.emissiveColor = new Color3(0.1, 0.05, 0.2);

  level.floors.forEach((f, i) => {
    const hue = i * 360 / level.floors.length % 360;
    const floorMat = new StandardMaterial(`proc_floor_${i}`, scene);
    floorMat.diffuseColor = hslToRgb(hue, 1.0, 0.5);
    floorMat.emissiveColor = hslToRgb(hue, 1.0, 0.15);

    const mesh = MeshBuilder.CreateGround(
      `proc_floor_${i}`,
      { width: f.w, height: f.d },
      scene,
    );
    mesh.position.set(f.cx, 0, f.cz);
    mesh.material = floorMat;
    mesh.checkCollisions = true;
  });

  level.walls.forEach((w, i) => {
    const width = w.axis === 'x' ? w.len : WALL_T;
    const depth = w.axis === 'z' ? w.len : WALL_T;
    const mesh = MeshBuilder.CreateBox(
      `proc_wall_${i}`,
      { width, height: WALL_H, depth },
      scene,
    );
    mesh.position.set(w.cx, WALL_H / 2, w.cz);
    mesh.material = wallMat;
    mesh.checkCollisions = true;
  });

  const levelSize = Math.max(
    ...level.floors.map((f) => Math.max(f.w, f.d)),
    50,
  );
  const cloudCeiling = new CloudCeiling(scene, 15, levelSize);

  return { cloudCeiling };
}
