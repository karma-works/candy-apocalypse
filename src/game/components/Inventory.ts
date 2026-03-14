import { Component } from '../entities/Entity';

export interface WeaponSlot {
  type: string;
  ammo: number;
  maxAmmo: number;
}

export class Inventory extends Component {
  weapons: Map<string, WeaponSlot> = new Map();
  currentWeapon: string | null = null;

  addWeapon(type: string, ammo: number, maxAmmo: number): void {
    this.weapons.set(type, { type, ammo, maxAmmo });
    if (!this.currentWeapon) {
      this.currentWeapon = type;
    }
  }

  getWeapon(type: string): WeaponSlot | undefined {
    return this.weapons.get(type);
  }

  getCurrentWeapon(): WeaponSlot | undefined {
    if (!this.currentWeapon) {
      return undefined;
    }
    return this.weapons.get(this.currentWeapon);
  }

  switchWeapon(type: string): boolean {
    if (this.weapons.has(type)) {
      this.currentWeapon = type;
      return true;
    }
    return false;
  }

  addAmmo(type: string, amount: number): void {
    const weapon = this.weapons.get(type);
    if (weapon) {
      weapon.ammo = Math.min(weapon.maxAmmo, weapon.ammo + amount);
    }
  }

  useAmmo(type: string, amount: number = 1): boolean {
    const weapon = this.weapons.get(type);
    if (weapon && weapon.ammo >= amount) {
      weapon.ammo -= amount;
      return true;
    }
    return false;
  }

  hasWeapon(type: string): boolean {
    return this.weapons.has(type);
  }

  hasAmmo(type: string, amount: number = 1): boolean {
    const weapon = this.weapons.get(type);
    return weapon ? weapon.ammo >= amount : false;
  }
}
