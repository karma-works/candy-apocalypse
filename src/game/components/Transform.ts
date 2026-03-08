import { Component } from "../entities/Entity";
import { Vector3 } from "@babylonjs/core";

export class Transform extends Component {
  position = Vector3.Zero();
  rotation = Vector3.Zero();
  scale = new Vector3(1, 1, 1);

  setPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z);
    if (this.entity?.mesh) {
      this.entity.mesh.position.set(x, y, z);
    }
  }

  setRotation(x: number, y: number, z: number): void {
    this.rotation.set(x, y, z);
    if (this.entity?.mesh) {
      this.entity.mesh.rotation.set(x, y, z);
    }
  }

  setScale(x: number, y: number, z: number): void {
    this.scale.set(x, y, z);
    if (this.entity?.mesh) {
      this.entity.mesh.scaling.set(x, y, z);
    }
  }

  lookAt(x: number, y: number, z: number): void {
    if (this.entity?.mesh) {
      this.entity.mesh.lookAt(new Vector3(x, y, z));
    }
  }
}
