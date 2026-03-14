import { Color4, ParticleSystem, Scene, Texture, Vector3 } from '@babylonjs/core';
import { TextureManager } from '../../engine/assets/TextureManager';

export class EffectManager {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  // Level 1: "Pop" - Small enemies, breakables, pistol hits
  playPop(position: Vector3) {
    this.createExplosion(position, {
      capacity: 10,
      color1: new Color4(1, 0.7, 0.8, 1), // Cotton Cloud
      color2: new Color4(1, 0.88, 0.2, 1), // Solar Burst
      size: 0.1,
      lifeTime: 0.2,
      emitRate: 100,
    });
  }

  // Level 2: "Bang" - Medium enemies, shotgun hits
  playBang(position: Vector3) {
    this.createExplosion(position, {
      capacity: 30,
      color1: new Color4(1, 0.42, 0.2, 1), // Rage Orange
      color2: new Color4(1, 0.88, 0.2, 1), // Solar Burst
      size: 0.2,
      lifeTime: 0.5,
      emitRate: 200,
    });
  }

  // Level 3: "Ka-Boom" - Large enemies, rocket direct hit
  playKaBoom(position: Vector3) {
    this.createExplosion(position, {
      capacity: 60,
      color1: new Color4(1, 0, 0.26, 1), // Cherry Bomb
      color2: new Color4(1, 0.42, 0.2, 1), // Rage Orange
      size: 0.5,
      lifeTime: 1.0,
      emitRate: 500,
    });
  }

  // Level 4: "MEGA BLAST" - BFG, chain reactions
  playMegaBlast(position: Vector3) {
    this.createExplosion(position, {
      capacity: 200,
      color1: new Color4(0.6, 0.36, 0.9, 1), // Mystic Violet
      color2: new Color4(0, 0.83, 1, 1), // Sky Pop
      size: 1.0,
      lifeTime: 2.0,
      emitRate: 1000,
    });
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
  ) {
    // Create a particle system
    const particleSystem = new ParticleSystem('particles', options.capacity, this.scene);

    // Apply SVG texture from TextureManager
    const tm = TextureManager.getInstance();
    if (tm) {
      const texture = tm.getTexture('effect-star') || tm.getTexture('effect-confetti');
      if (texture) {
        // The ParticleSystem needs a native BabylonJS Texture.
        // Since DynamicTexture is a subclass of Texture, this works.
        particleSystem.particleTexture = texture;
        particleSystem.blendMode = ParticleSystem.BLENDMODE_STANDARD;
      }
    }

    // Position
    particleSystem.emitter = position;

    // Colors
    particleSystem.color1 = options.color1;
    particleSystem.color2 = options.color2;
    particleSystem.colorDead = new Color4(0, 0, 0, 0);

    // Size
    particleSystem.minSize = options.size * 0.5;
    particleSystem.maxSize = options.size * 1.5;

    // Life time
    particleSystem.minLifeTime = options.lifeTime * 0.5;
    particleSystem.maxLifeTime = options.lifeTime;

    // Emission rate
    particleSystem.emitRate = options.emitRate;

    // Burst mode
    particleSystem.manualEmitCount = options.capacity; // Emit all at once

    // Speed
    particleSystem.minEmitPower = 2;
    particleSystem.maxEmitPower = 5;
    particleSystem.updateSpeed = 0.05;

    // Start
    particleSystem.start();

    // Auto dispose
    setTimeout(() => {
      particleSystem.dispose();
    }, options.lifeTime * 1000 + 500);
  }
}
