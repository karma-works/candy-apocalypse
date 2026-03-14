import {
  Color3,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

interface CloudLayer {
  mesh: Mesh;
  speed: number;
  direction: number;
}

export class CloudCeiling {
  private scene: Scene;
  private layers: CloudLayer[] = [];
  private ceilingHeight: number;
  private disposed = false;

  constructor(
    scene: Scene,
    ceilingHeight: number = 15,
    levelSize: number = 100,
  ) {
    this.scene = scene;
    this.ceilingHeight = ceilingHeight;
    this.createCloudLayers(levelSize);
  }

  private createCloudTexture(cloudType: number): DynamicTexture {
    const textureSize = 512;
    const texture = new DynamicTexture(
      `cloud_tex_${cloudType}`,
      textureSize,
      this.scene,
      true,
    );

    const ctx = texture.getContext() as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, textureSize, textureSize);

    const colors = [
      { main: '#FFB7C5', highlight: '#FFD4DC' },
      { main: '#00D4FF', highlight: '#66E5FF' },
      { main: '#9B5DE5', highlight: '#B88AEF' },
    ];

    const color = colors[cloudType % colors.length];

    const numBlobs = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numBlobs; i++) {
      const x = 100 + Math.random() * (textureSize - 200);
      const y = 100 + Math.random() * (textureSize - 200);
      const rx = 80 + Math.random() * 100;
      const ry = 60 + Math.random() * 80;

      ctx.fillStyle = color.main;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1A1A2E';
      ctx.lineWidth = 6;
      ctx.stroke();
    }

    for (let i = 0; i < numBlobs - 2; i++) {
      const x = 150 + Math.random() * (textureSize - 300);
      const y = 150 + Math.random() * (textureSize - 300);
      const rx = 50 + Math.random() * 60;
      const ry = 40 + Math.random() * 50;

      ctx.fillStyle = color.highlight;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    texture.hasAlpha = true;
    texture.update();
    return texture;
  }

  private createCloudLayers(levelSize: number): void {
    const numLayers = 3;

    for (let i = 0; i < numLayers; i++) {
      const plane = MeshBuilder.CreatePlane(
        `cloud_layer_${i}`,
        { width: levelSize * 2, height: levelSize * 2 },
        this.scene,
      );

      plane.position.y = this.ceilingHeight + i * 2;
      plane.rotation.x = Math.PI / 2;

      const material = new StandardMaterial(`cloud_mat_${i}`, this.scene);
      const texture = this.createCloudTexture(i);

      material.diffuseTexture = texture;
      material.emissiveTexture = texture;
      material.emissiveColor = new Color3(0.3, 0.3, 0.3);
      material.backFaceCulling = false;
      material.useAlphaFromDiffuseTexture = true;

      plane.material = material;

      this.layers.push({
        mesh: plane,
        speed: 0.5 + i * 0.3,
        direction: i % 2 === 0 ? 1 : -1,
      });
    }
  }

  public update(deltaTime: number): void {
    if (this.disposed) {
      return;
    }

    this.layers.forEach((layer) => {
      const offset = layer.speed * layer.direction * deltaTime;
      layer.mesh.rotation.y += offset * 0.02;
      layer.mesh.position.x += offset * 0.5;

      const bounds = 50;
      if (Math.abs(layer.mesh.position.x) > bounds) {
        layer.mesh.position.x = -layer.mesh.position.x * 0.9;
      }
    });
  }

  public dispose(): void {
    this.disposed = true;
    this.layers.forEach((layer) => {
      layer.mesh.material?.dispose();
      layer.mesh.dispose();
    });
    this.layers = [];
  }
}
