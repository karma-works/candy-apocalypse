import { Entity } from "./Entity";
import { Transform } from "../components/Transform";
import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Mesh,
} from "@babylonjs/core";
import { useGameStore } from "../state/gameStore";
import { playSound } from "../../engine/audio/GameAudio";
import { TextureManager } from "../../engine/assets/TextureManager";

export type PickupType = "health" | "ammo_pistol" | "ammo_shotgun" | "level_exit";

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
  level_exit: {
    type: "level_exit",
    amount: 0,
    color: new Color3(1, 1, 1),
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
  private isBillboard = false;

  constructor(id: string, pickupType: PickupType = "health") {
    super(id, `Pickup_${pickupType}`);

    this.pickupType = pickupType;
    this.config = PICKUP_CONFIGS[pickupType];
    this.transform = this.addComponent(new Transform());
  }

  createMesh(scene: Scene, textureManager: TextureManager | null = null): void {
    let texture = null;
    let size = 0.6; // slightly larger for 2D readability

    if (textureManager) {
      let texName = `item-${this.pickupType}`;
      if (this.pickupType === "ammo_pistol") texName = "weapon-pistol"; // fallbacks
      if (this.pickupType === "ammo_shotgun") texName = "weapon-shotgun";

      texture = textureManager.getTexture(texName);
      if (texture) {
        this.isBillboard = true;
      }
    }

    let mesh: Mesh;
    if (this.isBillboard) {
      mesh = MeshBuilder.CreatePlane(
        this.id,
        { width: size, height: size },
        scene
      );
      mesh.billboardMode = Mesh.BILLBOARDMODE_Y;
    } else {
      mesh = MeshBuilder.CreateBox(this.id, { size: 0.4 }, scene);
    }

    const material = new StandardMaterial(`${this.id}_mat`, scene);

    if (this.isBillboard && texture) {
      texture.hasAlpha = true;
      material.diffuseTexture = texture;
      material.useAlphaFromDiffuseTexture = true;
      material.emissiveColor = new Color3(1, 1, 1);
      material.backFaceCulling = false;
    } else {
      material.diffuseColor = this.config.color;
      material.emissiveColor = this.config.color.scale(0.3);
    }

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
    if (!this.isBillboard) {
      this.mesh.rotation.y += this.rotationSpeed * deltaTime;
    }
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
      case "level_exit":
        store.setVictory(true);
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
