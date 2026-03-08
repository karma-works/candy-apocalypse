import { Scene } from "@babylonjs/core";
import { Entity } from "./entities/Entity";
import { Player } from "./entities/Player";
import { Enemy, EnemyType } from "./entities/Enemy";
import { Prop, PropType } from "./entities/Prop";
import { Pickup, PickupType } from "./entities/Pickup";
import type { SpawnPoint } from "./state/gameStore";

export class EntityManager {
  private entities: Map<string, Entity> = new Map();
  private scene: Scene;
  private player: Player | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  spawnEntity(spawn: SpawnPoint, index: number): Entity | null {
    const id = `${spawn.type}_${index}`;
    let entity: Entity | null = null;

    switch (spawn.type) {
      case "player":
        entity = this.spawnPlayer(id);
        break;
      case "enemy-demon":
        entity = this.spawnEnemy(id, "demon");
        break;
      case "enemy-imp":
        entity = this.spawnEnemy(id, "imp");
        break;
      case "enemy-cacodemon":
        entity = this.spawnEnemy(id, "cacodemon");
        break;
      case "prop-barrel":
        entity = this.spawnProp(id, "barrel");
        break;
      case "prop-pillar":
        entity = this.spawnProp(id, "pillar");
        break;
      case "prop-crate":
        entity = this.spawnProp(id, "crate");
        break;
      case "pickup-health":
        entity = this.spawnPickup(id, "health");
        break;
      case "pickup-ammo-pistol":
        entity = this.spawnPickup(id, "ammo_pistol");
        break;
      case "pickup-ammo-shotgun":
        entity = this.spawnPickup(id, "ammo_shotgun");
        break;
      default:
        console.warn(`Unknown entity type: ${spawn.type}`);
        return null;
    }

    if (entity) {
      if (entity.mesh) {
        entity.setPosition(
          spawn.position[0],
          spawn.position[1],
          spawn.position[2],
        );
      } else if (entity instanceof Player) {
        entity.movement.setPosition(
          spawn.position[0],
          spawn.position[1],
          spawn.position[2],
        );
      }

      if (spawn.rotation && entity.mesh) {
        entity.mesh.rotation.set(
          spawn.rotation[0],
          spawn.rotation[1],
          spawn.rotation[2],
        );
      }

      this.entities.set(id, entity);
    }

    return entity;
  }

  spawnPlayer(id: string): Player {
    if (this.player) {
      console.warn("Player already exists");
      return this.player;
    }

    this.player = new Player(id);
    this.entities.set(id, this.player);
    return this.player;
  }

  spawnEnemy(id: string, enemyType: EnemyType): Enemy {
    const enemy = new Enemy(id, enemyType);
    enemy.createMesh(this.scene);

    if (this.player) {
      enemy.setTarget(this.player);
    }

    return enemy;
  }

  spawnProp(id: string, propType: PropType): Prop {
    const prop = new Prop(id, propType);
    prop.createMesh(this.scene);
    return prop;
  }

  spawnPickup(id: string, pickupType: PickupType): Pickup {
    const pickup = new Pickup(id, pickupType);
    pickup.createMesh(this.scene);
    return pickup;
  }

  getPlayer(): Player | null {
    return this.player;
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  getEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  getEntitiesByType<T extends Entity>(
    entityClass: new (...args: any[]) => T,
  ): T[] {
    return Array.from(this.entities.values()).filter(
      (entity): entity is T => entity instanceof entityClass,
    );
  }

  getPickups(): Pickup[] {
    return this.getEntitiesByType(Pickup);
  }

  update(deltaTime: number): void {
    this.entities.forEach((entity) => {
      entity.update(deltaTime);
    });
  }

  removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.dispose();
      this.entities.delete(id);
    }
  }

  clear(): void {
    this.entities.forEach((entity) => entity.dispose());
    this.entities.clear();
    this.player = null;
  }

  dispose(): void {
    this.clear();
  }
}
