import { Component } from "../entities/Entity";
import { Scene, Ray, AbstractMesh } from "@babylonjs/core";
import { useGameStore } from "../state/gameStore";
import { Inventory } from "./Inventory";
import { playSound } from "../../engine/audio/GameAudio";

export interface WeaponConfig {
  type: string;
  damage: number;
  fireRate: number;
  range: number;
  ammoPerShot: number;
  spread: number;
  soundName: string;
}

const WEAPON_CONFIGS: Record<string, WeaponConfig> = {
  pistol: {
    type: "pistol",
    damage: 15,
    fireRate: 0.3,
    range: 100,
    ammoPerShot: 1,
    spread: 0.01,
    soundName: "shoot_pistol",
  },
  shotgun: {
    type: "shotgun",
    damage: 60,
    fireRate: 0.8,
    range: 30,
    ammoPerShot: 2,
    spread: 0.1,
    soundName: "shoot_shotgun",
  },
  chaingun: {
    type: "chaingun",
    damage: 10,
    fireRate: 0.1,
    range: 80,
    ammoPerShot: 1,
    spread: 0.05,
    soundName: "shoot_pistol",
  },
};

export class WeaponSystem extends Component {
  private scene: Scene;
  private currentWeapon: WeaponConfig | null = null;
  private lastFireTime = 0;
  private camera: any = null;

  constructor(scene: Scene) {
    super();
    this.scene = scene;
  }

  attachToCamera(camera: any): void {
    this.camera = camera;
  }

  switchWeapon(type: string): boolean {
    const config = WEAPON_CONFIGS[type];
    if (!config) return false;

    const inventory = this.entity?.getComponent(Inventory);
    if (inventory && inventory.hasWeapon(type)) {
      this.currentWeapon = config;
      playSound("weapon_switch");
      return true;
    }
    return false;
  }

  canFire(): boolean {
    if (!this.currentWeapon) return false;

    const now = performance.now() / 1000;
    if (now - this.lastFireTime < this.currentWeapon.fireRate) return false;

    const inventory = this.entity?.getComponent(Inventory);
    if (!inventory) return false;

    return inventory.hasAmmo(
      this.currentWeapon.type,
      this.currentWeapon.ammoPerShot,
    );
  }

  fire(): boolean {
    if (!this.canFire() || !this.camera) return false;

    const inventory = this.entity?.getComponent(Inventory);
    if (!inventory) return false;

    if (
      !inventory.useAmmo(
        this.currentWeapon!.type,
        this.currentWeapon!.ammoPerShot,
      )
    ) {
      return false;
    }

    playSound(this.currentWeapon!.soundName);

    useGameStore
      .getState()
      .setAmmo(
        this.currentWeapon!.type,
        inventory.getWeapon(this.currentWeapon!.type)?.ammo ?? 0,
      );

    this.lastFireTime = performance.now() / 1000;

    const spread = this.currentWeapon!.spread;
    const spreadX = (Math.random() - 0.5) * spread;
    const spreadY = (Math.random() - 0.5) * spread;

    const forward = this.camera.getForwardRay().direction.clone();
    forward.x += spreadX;
    forward.y += spreadY;
    forward.normalize();

    const ray = new Ray(
      this.camera.position,
      forward,
      this.currentWeapon!.range,
    );
    const hit = this.scene.pickWithRay(ray, (mesh) => {
      return mesh.isPickable && mesh.checkCollisions;
    });

    if (hit?.hit && hit.pickedMesh) {
      this.onHit(hit.pickedMesh, hit.distance ?? 0);
    }

    return true;
  }

  private onHit(mesh: AbstractMesh, distance: number): void {
    const entityId = mesh.metadata?.entityId;
    if (entityId) {
      console.log(`Hit entity ${entityId} at distance ${distance.toFixed(2)}`);

      const event = new CustomEvent("entityHit", {
        detail: {
          entityId,
          damage: this.currentWeapon!.damage,
          distance,
        },
      });
      window.dispatchEvent(event);
    }
  }

  getCurrentWeapon(): WeaponConfig | null {
    return this.currentWeapon;
  }
}
