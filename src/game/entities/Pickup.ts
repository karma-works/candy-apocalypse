import { Entity } from "./Entity";
import { Transform } from "../components/Transform";
import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
} from "@babylonjs/core";
import { useGameStore } from "../state/gameStore";
import { playSound } from "../../engine/audio/GameAudio";

export type PickupType = "health" | "ammo_pistol" | "ammo_shotgun";

export interface PickupConfig {
  type: PickupType;
  amount: number;
  color: Color3;
}

const PICKUP_CONFIGS: Record<PickupType, PickupConfig> = {
  health: { type: "health", amount: 25, color: new Color3(1, 0.2, 0.2) },
  ammo_pistol: {
    type: "ammo_pistol",
    amount: 10,
    color: new Color3(0.2, 0.5, 1),
  },
  ammo_shotgun: {
    type: "ammo_shotgun",
    amount: 5,
    color: new Color3(1, 0.6, 0.2),
  },
};

export class Pickup extends Entity {
  transform: Transform;
  pickupType: PickupType;
  config: PickupConfig;
  private rotationSpeed = 1.5;
  private bobSpeed = 2;
  private bobAmount = 0.1;
  private initialY = 0;
  private time = Math.random() * Math.PI * 2;

  constructor(id: string, pickupType: PickupType = "health") {
    super(id, `Pickup_${pickupType}`);

    this.pickupType = pickupType;
    this.config = PICKUP_CONFIGS[pickupType];
    this.transform = this.addComponent(new Transform());
  }

  createMesh(scene: Scene): void {
    const mesh = MeshBuilder.CreateBox(this.id, { size: 0.4 }, scene);

    const material = new StandardMaterial(`${this.id}_mat`, scene);
    material.diffuseColor = this.config.color;
    material.emissiveColor = this.config.color.scale(0.3);
    mesh.material = material;
    mesh.checkCollisions = false;
    mesh.isPickable = false;

    this.setMesh(mesh);
  }

  setPosition(x: number, y: number, z: number): void {
    this.initialY = y;
    if (this.mesh) {
      this.mesh.position.set(x, y, z);
    }
  }

  update(deltaTime: number): void {
    super.update(deltaTime);

    if (!this.mesh) return;

    this.time += deltaTime * this.bobSpeed;
    const bobOffset = Math.sin(this.time) * this.bobAmount;

    this.mesh.position.y = this.initialY + bobOffset;
    this.mesh.rotation.y += this.rotationSpeed * deltaTime;
  }

  collect(): void {
    playSound("pickup");

    const store = useGameStore.getState();

    switch (this.pickupType) {
      case "health":
        store.heal(this.config.amount);
        break;
      case "ammo_pistol":
        store.addAmmo("pistol", this.config.amount);
        break;
      case "ammo_shotgun":
        store.addAmmo("shotgun", this.config.amount);
        break;
    }

    this.isActive = false;
    if (this.mesh) {
      this.mesh.setEnabled(false);
    }
  }

  dispose(): void {
    super.dispose();
  }
}
