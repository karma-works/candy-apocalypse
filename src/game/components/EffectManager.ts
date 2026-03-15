import {
  Color4,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
} from '@babylonjs/core';
import { TextureManager } from '../../engine/assets/TextureManager';

export class EffectManager {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  playPop(position: Vector3) {
    this.createExplosion(position, {
      capacity: 10,
      color1: new Color4(1, 0.7, 0.8, 1),
      color2: new Color4(1, 0.88, 0.2, 1),
      size: 0.1,
      lifeTime: 0.2,
      emitRate: 100,
    });
  }

  playBang(position: Vector3) {
    this.createExplosion(position, {
      capacity: 30,
      color1: new Color4(1, 0.42, 0.2, 1),
      color2: new Color4(1, 0.88, 0.2, 1),
      size: 0.2,
      lifeTime: 0.5,
      emitRate: 200,
    });
  }

  playKaBoom(position: Vector3) {
    this.createExplosion(position, {
      capacity: 60,
      color1: new Color4(1, 0, 0.26, 1),
      color2: new Color4(1, 0.42, 0.2, 1),
      size: 0.5,
      lifeTime: 1.0,
      emitRate: 500,
    });
  }

  playMegaBlast(position: Vector3) {
    this.createExplosion(position, {
      capacity: 200,
      color1: new Color4(0.6, 0.36, 0.9, 1),
      color2: new Color4(0, 0.83, 1, 1),
      size: 1.0,
      lifeTime: 2.0,
      emitRate: 1000,
    });
  }

  playConfettiBurst(position: Vector3) {
    this.createExplosion(
      position,
      {
        capacity: 80,
        color1: new Color4(1, 0, 0.26, 1),
        color2: new Color4(0.2, 1, 0.2, 1),
        size: 0.3,
        lifeTime: 1.5,
        emitRate: 400,
      },
      'effect-confetti',
    );
  }

  playLegoScatter(position: Vector3) {
    this.createExplosion(
      position,
      {
        capacity: 40,
        color1: new Color4(1, 0.42, 0.2, 1),
        color2: new Color4(0, 0.7, 1, 1),
        size: 0.4,
        lifeTime: 1.2,
        emitRate: 200,
      },
      'effect-lego',
    );
  }

  playFeatherExplosion(position: Vector3) {
    this.createExplosion(
      position,
      {
        capacity: 50,
        color1: new Color4(0.6, 0.36, 0.9, 1),
        color2: new Color4(1, 0.7, 0.8, 1),
        size: 0.25,
        lifeTime: 1.8,
        emitRate: 150,
      },
      'effect-feather',
    );
  }

  playWoolConfetti(position: Vector3) {
    this.createExplosion(
      position,
      {
        capacity: 60,
        color1: new Color4(1, 1, 1, 1),
        color2: new Color4(1, 0.7, 0.8, 1),
        size: 0.35,
        lifeTime: 1.5,
        emitRate: 300,
      },
      'effect-confetti',
    );
  }

  private createExplosion(
    position: Vector3,
    options: {
      capacity: number;
      color1: Color4;
      color2: Color4;
      size: number;
      lifeTime: number;
      emitRate: number;
    },
    textureId: string = 'effect-star',
  ) {
    const particleSystem = new ParticleSystem(
      'particles',
      options.capacity,
      this.scene,
    );

    const tm = TextureManager.getInstance();
    if (tm) {
      const texture = tm.getTexture(textureId) || tm.getTexture('effect-star');
      if (texture) {
        particleSystem.particleTexture = texture;
        particleSystem.blendMode = ParticleSystem.BLENDMODE_STANDARD;
      }
    }

    particleSystem.emitter = position;
    particleSystem.color1 = options.color1;
    particleSystem.color2 = options.color2;
    particleSystem.colorDead = new Color4(0, 0, 0, 0);

    particleSystem.minSize = options.size * 0.5;
    particleSystem.maxSize = options.size * 1.5;

    particleSystem.minLifeTime = options.lifeTime * 0.5;
    particleSystem.maxLifeTime = options.lifeTime;

    particleSystem.emitRate = options.emitRate;
    particleSystem.manualEmitCount = options.capacity;

    particleSystem.minEmitPower = 2;
    particleSystem.maxEmitPower = 5;
    particleSystem.updateSpeed = 0.05;

    particleSystem.start();

    setTimeout(
      () => {
        particleSystem.dispose();
      },
      options.lifeTime * 1000 + 500,
    );
  }
}
