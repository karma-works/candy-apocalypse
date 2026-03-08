import { Entity } from "./Entity";
import { Transform } from "../components/Transform";
import {
  Vector3,
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Mesh,
} from "@babylonjs/core";

export type PropType = "barrel" | "pillar" | "crate";

export class Prop extends Entity {
  transform: Transform;
  propType: PropType;

  constructor(id: string, propType: PropType = "barrel") {
    super(id, `Prop_${propType}`);

    this.propType = propType;
    this.transform = this.addComponent(new Transform());
  }

  createMesh(scene: Scene): void {
    const configMap: Record<PropType, { create: () => Mesh; color: Color3 }> = {
      barrel: {
        create: () =>
          MeshBuilder.CreateCylinder(
            this.id,
            { height: 1.2, diameter: 0.8 },
            scene,
          ),
        color: new Color3(0.4, 0.3, 0.2),
      },
      pillar: {
        create: () =>
          MeshBuilder.CreateCylinder(
            this.id,
            { height: 3, diameter: 1 },
            scene,
          ),
        color: new Color3(0.5, 0.5, 0.5),
      },
      crate: {
        create: () => MeshBuilder.CreateBox(this.id, { size: 1 }, scene),
        color: new Color3(0.6, 0.5, 0.3),
      },
    };

    const config = configMap[this.propType];
    const mesh = config.create();

    const material = new StandardMaterial(`${this.id}_mat`, scene);
    material.diffuseColor = config.color;
    mesh.material = material;
    mesh.checkCollisions = true;

    this.setMesh(mesh);
  }

  setPosition(x: number, y: number, z: number): void {
    if (this.mesh) {
      const offsetY =
        this.propType === "barrel"
          ? 0.6
          : this.propType === "pillar"
            ? 1.5
            : 0.5;
      this.mesh.position.set(x, y + offsetY, z);
    }
  }
}
