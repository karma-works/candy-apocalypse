import { Component } from "../entities/Entity";
import { Scene, Ray, AbstractMesh } from "@babylonjs/core";
import { useGameStore } from "../state/gameStore";
import { Inventory } from "./Inventory";
import { playSound } from "../../engine/audio/GameAudio";
import { EffectManager } from "./EffectManager";

export type FireType = "hitscan" | "projectile" | "melee";
export type EffectLevel = "pop" | "bang" | "kaboom" | "megablast";

export interface WeaponConfig {
  type: string;
  damage: number;
  fireRate: number;
  range: number;
  ammoPerShot: number;
  spread: number;
  soundName: string;
  fireType: FireType;
  effectLevel: EffectLevel;
  projectileSpeed?: number;
}

const WEAPON_CONFIGS: Record<string, WeaponConfig> = {
  chainsaw: {
    type: "chainsaw",
    damage: 20,
    fireRate: 0.1,
    range: 3,
    ammoPerShot: 0,
    spread: 0,
    soundName: "shoot_chainsaw",
    fireType: "melee",
    effectLevel: "pop",
  },
  pistol: {
    type: "pistol",
    damage: 15,
    fireRate: 0.3,
    range: 100,
    ammoPerShot: 1,
    spread: 0.01,
    soundName: "shoot_pistol",
    fireType: "hitscan",
    effectLevel: "pop",
  },
  shotgun: {
    type: "shotgun",
    damage: 60,
    fireRate: 0.8,
    range: 30,
    ammoPerShot: 2,
    spread: 0.1,
    soundName: "shoot_shotgun",
    fireType: "hitscan",
    effectLevel: "bang",
  },
  chaingun: {
    type: "chaingun",
    damage: 10,
    fireRate: 0.1,
    range: 80,
    ammoPerShot: 1,
    spread: 0.05,
    soundName: "shoot_pistol",
    fireType: "hitscan",
    effectLevel: "pop",
  },
  rocket_launcher: {
    type: "rocket_launcher",
    damage: 100,
    fireRate: 1.0,
    range: 200,
    ammoPerShot: 1,
    spread: 0,
    soundName: "shoot_rocket",
    fireType: "projectile",
    effectLevel: "kaboom",
    projectileSpeed: 30,
  },
  plasma_rifle: {
    type: "plasma_rifle",
    damage: 20,
    fireRate: 0.1,
    range: 150,
    ammoPerShot: 1,
    spread: 0.02,
    soundName: "shoot_plasma",
    fireType: "projectile",
    effectLevel: "pop",
    projectileSpeed: 50,
  },
  bfg9000: {
    type: "bfg9000",
    damage: 500,
    fireRate: 2.5,
    range: 300,
    ammoPerShot: 40,
    spread: 0,
    soundName: "shoot_bfg",
    fireType: "projectile",
    effectLevel: "megablast",
    projectileSpeed: 15,
  },
};

export class WeaponSystem extends Component {
  private scene: Scene;
  private currentWeapon: WeaponConfig | null = null;
  private lastFireTime = 0;
  private camera: any = null;
  private effects: EffectManager;

  constructor(scene: Scene) {
    super();
    this.scene = scene;
    this.effects = new EffectManager(scene);
  }

  attachToCamera(camera: any): void {
    this.camera = camera;
  }

  switchWeapon(type: string): boolean {
    const config = WEAPON_CONFIGS[type];
    if (!config) return false;

    const inventory = this.entity?.getComponent(Inventory);
    if (!inventory) {
      console.warn("WeaponSystem: No inventory found on entity, cannot switch weapon");
      return false;
    }
    if (inventory.hasWeapon(type)) {
      this.currentWeapon = config;
      useGameStore.getState().setCurrentWeapon(type);
      playSound("weapon_switch");
      return true;
    }
    return false;
  }

  canFire(): boolean {
    if (!this.currentWeapon) {
      console.log("WeaponSystem.canFire: no current weapon");
      return false;
    }

    const now = performance.now() / 1000;
    if (now - this.lastFireTime < this.currentWeapon.fireRate) {
      console.log("WeaponSystem.canFire: rate limited");
      return false;
    }

    const inventory = this.entity?.getComponent(Inventory);
    if (!inventory) {
      console.log("WeaponSystem.canFire: missing inventory");
      return false;
    }

    const hasAmmo = inventory.hasAmmo(
      this.currentWeapon.type,
      this.currentWeapon.ammoPerShot,
    );
    if (!hasAmmo) console.log("WeaponSystem.canFire: no ammo");
    return hasAmmo;
  }

  fire(): boolean {
    if (!this.canFire()) return false;
    if (!this.camera) {
      console.log("WeaponSystem.fire: missing camera");
      return false;
    }

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

    // Signal muzzle flash to the HUD — dispatch before effects so it always fires
    window.dispatchEvent(
      new CustomEvent("weaponFired", { detail: { weapon: this.currentWeapon!.type } }),
    );

    try {
      if (this.currentWeapon!.fireType === "projectile") {
        this.fireProjectile(forward);
      } else {
        // Hitscan: pick ANY pickable enabled mesh. Do NOT require checkCollisions —
        // enemy billboard planes are extremely thin and only register via isPickable.
        const ray = new Ray(
          this.camera.position,
          forward,
          this.currentWeapon!.range,
        );
        const hit = this.scene.pickWithRay(ray, (mesh) => {
          return mesh.isPickable && mesh.isEnabled();
        });

        if (hit?.hit && hit.pickedMesh && hit.pickedPoint) {
          this.onHit(hit.pickedMesh, hit.pickedPoint, hit.distance ?? 0);
        } else {
          // Always give visual feedback — show impact at max range
          const impactPos = this.camera.position.add(
            forward.scale(Math.min(this.currentWeapon!.range, 20)),
          );
          this.effects.playPop(impactPos);
        }
      }
    } catch (e) {
      console.warn("WeaponSystem: fire effect error", e);
    }

    return true;
  }

  private fireProjectile(direction: any) {
    // Basic projectile implementation: check hit immediately, but visually we could spawn a mesh.
    // For now, we will raycast to find the ultimate collision point and simulate the explosion there
    // TODO: Create an actual moving mesh
    const ray = new Ray(
      this.camera.position,
      direction,
      this.currentWeapon!.range,
    );
    const hit = this.scene.pickWithRay(ray, (mesh) => {
      return mesh.isPickable && mesh.checkCollisions;
    });

    if (hit?.hit && hit.pickedMesh && hit.pickedPoint) {
      setTimeout(() => {
        this.onHit(hit.pickedMesh!, hit.pickedPoint!, hit.distance ?? 0);
      }, (hit.distance ?? 0) / (this.currentWeapon!.projectileSpeed || 30) * 1000);
    }
  }

  private playEffect(position: any) {
    const level = this.currentWeapon!.effectLevel;
    if (level === "megablast") this.effects.playMegaBlast(position);
    else if (level === "kaboom") this.effects.playKaBoom(position);
    else if (level === "bang") this.effects.playBang(position);
    else this.effects.playPop(position);
  }

  private onHit(mesh: AbstractMesh, position: any, distance: number): void {
    this.playEffect(position);

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
