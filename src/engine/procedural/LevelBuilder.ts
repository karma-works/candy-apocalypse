/**
 * BabylonJS builder layer — turns a GeneratedLevel data structure into scene meshes.
 * Keep this as the only file that imports from @babylonjs/core in the procedural pipeline.
 */

import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";
import type { GeneratedLevel } from "./LevelLayout";
import { WALL_H } from "./LevelLayout";

const WALL_T = 0.4;  // wall thickness

export function buildLevel(level: GeneratedLevel, scene: Scene): void {
  const floorMat = new StandardMaterial("proc_floor", scene);
  floorMat.diffuseColor = new Color3(0.2, 1.0, 0.0);
  floorMat.emissiveColor = new Color3(0.05, 0.2, 0.0);

  const wallMat = new StandardMaterial("proc_wall", scene);
  wallMat.diffuseColor = new Color3(0.6, 0.36, 0.9);
  wallMat.emissiveColor = new Color3(0.1, 0.05, 0.2);

  level.floors.forEach((f, i) => {
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
    const width  = w.axis === "x" ? w.len : WALL_T;
    const depth  = w.axis === "z" ? w.len : WALL_T;
    const mesh = MeshBuilder.CreateBox(
      `proc_wall_${i}`,
      { width, height: WALL_H, depth },
      scene,
    );
    mesh.position.set(w.cx, WALL_H / 2, w.cz);
    mesh.material = wallMat;
    mesh.checkCollisions = true;
  });
}
