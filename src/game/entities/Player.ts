import { Entity } from './Entity';
import { Transform } from '../components/Transform';
import { PlayerHealth } from '../components/PlayerHealth';
import { PlayerMovement } from '../components/PlayerMovement';
import { Inventory } from '../components/Inventory';
import { WeaponSystem } from '../components/WeaponSystem';
import { FreeCamera, Scene, Vector3 } from '@babylonjs/core';
import type { InputManager } from '../../engine/input/InputManager';
import { useGameStore } from '../state/gameStore';

export class Player extends Entity {
  transform: Transform;
  health: PlayerHealth;
  movement: PlayerMovement;
  inventory: Inventory;
  weapons!: WeaponSystem;
  private scene: Scene | null = null;

  constructor(id: string = 'player') {
    super(id, 'Player');

    this.transform = this.addComponent(new Transform());
    this.health = this.addComponent(new PlayerHealth(100));
    this.movement = this.addComponent(new PlayerMovement());
    this.inventory = this.addComponent(new Inventory());

    this.inventory.addWeapon('pistol', 50, 100);
    this.inventory.addWeapon('shotgun', 20, 50);
    this.inventory.addWeapon('chaingun', 100, 200);
    this.inventory.switchWeapon('pistol');
  }

  attachToCamera(
    camera: FreeCamera,
    inputManager: InputManager,
    scene: Scene,
  ): void {
    this.scene = scene;
    this.movement.attachToCamera(camera, inputManager);

    this.weapons = this.addComponent(new WeaponSystem(scene));
    this.weapons.attachToCamera(camera);
    // switchWeapon now syncs to store automatically
    this.weapons.switchWeapon('pistol');
  }

  takeDamage(amount: number): void {
    this.health.takeDamage(amount);
  }

  heal(amount: number): void {
    this.health.heal(amount);
  }

  isDead(): boolean {
    return this.health.isDead;
  }

  fire(): boolean {
    return this.weapons.fire();
  }

  switchWeapon(type: string): boolean {
    if (this.weapons.switchWeapon(type)) {
      this.inventory.switchWeapon(type);
      return true;
    }
    return false;
  }

  getPosition(): Vector3 {
    return this.movement['camera']?.position.clone() ?? super.getPosition();
  }
}
