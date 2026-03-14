import { Entity } from './Entity';
import { Transform } from '../components/Transform';
import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import { TextureManager } from '../../engine/assets/TextureManager';

export type PropType = 'barrel' | 'pillar' | 'crate';

export class Prop extends Entity {
  transform: Transform;
  propType: PropType;

  constructor(id: string, propType: PropType = 'barrel') {
    super(id, `Prop_${propType}`);

    this.propType = propType;
    this.transform = this.addComponent(new Transform());
  }

  createMesh(scene: Scene, textureManager: TextureManager | null = null): void {
    // If we have a texture, we'll make it a 2D billboard plane
    let useBillboard = false;
    let texture = null;

    if (textureManager) {
      texture = textureManager.getTexture(`prop-${this.propType}`);
      if (texture) {
        useBillboard = true;
      }
    }

    const configMap: Record<PropType, { create: () => Mesh; color: Color3, size: { width: number; height: number } }> = {
      barrel: {
        create: () =>
          MeshBuilder.CreateCylinder(
            this.id,
            { height: 1.2, diameter: 0.8 },
            scene,
          ),
        color: new Color3(0.4, 0.3, 0.2),
        size: { width: 1, height: 1.2 },
      },
      pillar: {
        create: () =>
          MeshBuilder.CreateCylinder(
            this.id,
            { height: 3, diameter: 1 },
            scene,
          ),
        color: new Color3(0.5, 0.5, 0.5),
        size: { width: 1, height: 3 },
      },
      crate: {
        create: () => MeshBuilder.CreateBox(this.id, { size: 1 }, scene),
        color: new Color3(0.6, 0.5, 0.3),
        size: { width: 1, height: 1 },
      },
    };

    const config = configMap[this.propType];
    let mesh: Mesh;

    if (useBillboard) {
      mesh = MeshBuilder.CreatePlane(
        this.id,
        { width: config.size.width, height: config.size.height },
        scene,
      );
      mesh.billboardMode = Mesh.BILLBOARDMODE_Y;
    } else {
      mesh = config.create();
    }

    const material = new StandardMaterial(`${this.id}_mat`, scene);

    if (useBillboard && texture) {
      texture.hasAlpha = true;
      material.diffuseTexture = texture;
      material.useAlphaFromDiffuseTexture = true;
      material.emissiveColor = new Color3(0.8, 0.8, 0.8);
      material.backFaceCulling = false;
    } else {
      material.diffuseColor = config.color;
    }

    mesh.material = material;
    mesh.checkCollisions = true;

    this.setMesh(mesh);
  }

  setPosition(x: number, y: number, z: number): void {
    if (this.mesh) {
      const offsetY =
        this.propType === 'barrel'
          ? 0.6
          : this.propType === 'pillar'
            ? 1.5
            : 0.5;
      this.mesh.position.set(x, y + offsetY, z);
    }
  }
}
