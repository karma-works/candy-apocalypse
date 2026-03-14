import { AbstractMesh, Scene, Vector3 } from "@babylonjs/core";

export abstract class Component {
  entity: Entity | null = null;

  attach(entity: Entity): void {
    this.entity = entity;
  }

  detach(): void {
    this.entity = null;
  }

  update(_deltaTime: number): void {}
}

export class Entity {
  id: string;
  name: string;
  mesh: AbstractMesh | null = null;
  components: Map<string, Component> = new Map();
  isActive = true;
  metadata: Record<string, unknown> = {};

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  setMesh(mesh: AbstractMesh): void {
    this.mesh = mesh;
    mesh.metadata = { entityId: this.id };
  }

  addComponent<T extends Component>(component: Component): T {
    component.attach(this);
    this.components.set(component.constructor.name, component);
    return component as T;
  }

  getComponent<T extends Component>(
    componentClass: new (...args: unknown[]) => T,
  ): T | undefined {
    return this.components.get(componentClass.name) as T | undefined;
  }

  hasComponent(componentClass: new (...args: unknown[]) => Component): boolean {
    return this.components.has(componentClass.name);
  }

  removeComponent(componentClass: new (...args: unknown[]) => Component): void {
    const component = this.components.get(componentClass.name);
    if (component) {
      component.detach();
      this.components.delete(componentClass.name);
    }
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;
    this.components.forEach((component) => component.update(deltaTime));
  }

  setPosition(x: number, y: number, z: number): void {
    if (this.mesh) {
      this.mesh.position.set(x, y, z);
    }
  }

  getPosition(): Vector3 {
    return this.mesh?.position.clone() ?? Vector3.Zero();
  }

  dispose(): void {
    this.components.forEach((component) => component.detach());
    this.components.clear();
    this.mesh?.dispose();
    this.mesh = null;
  }
}
