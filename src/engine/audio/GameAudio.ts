import { Scene, Sound, Vector3 } from "@babylonjs/core";

export class GameAudio {
  private scene: Scene;
  private sounds: Map<string, Sound> = new Map();
  private musicVolume = 0.5;
  private sfxVolume = 1.0;
  private isMuted = false;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  async loadSounds(): Promise<void> {
    const soundConfigs = [
      {
        name: "shoot_pistol",
        path: "/assets/audio/sfx/shoot_pistol.mp3",
        volume: 0.6,
      },
      {
        name: "shoot_shotgun",
        path: "/assets/audio/sfx/shoot_shotgun.mp3",
        volume: 0.8,
      },
      {
        name: "enemy_hurt",
        path: "/assets/audio/sfx/enemy_hurt.mp3",
        volume: 0.5,
      },
      {
        name: "enemy_death",
        path: "/assets/audio/sfx/enemy_death.mp3",
        volume: 0.7,
      },
      {
        name: "player_hurt",
        path: "/assets/audio/sfx/player_hurt.mp3",
        volume: 0.6,
      },
      {
        name: "player_death",
        path: "/assets/audio/sfx/player_death.mp3",
        volume: 0.8,
      },
      { name: "pickup", path: "/assets/audio/sfx/pickup.mp3", volume: 0.5 },
      {
        name: "weapon_switch",
        path: "/assets/audio/sfx/weapon_switch.mp3",
        volume: 0.4,
      },
    ];

    const loadPromises = soundConfigs.map((config) =>
      this.loadSound(config.name, config.path, config.volume),
    );

    try {
      await Promise.all(loadPromises);
      console.log("All sounds loaded");
    } catch (error) {
      console.warn(
        "Some sounds failed to load (expected if files missing):",
        error,
      );
    }
  }

  private loadSound(
    name: string,
    path: string,
    volume: number = 1.0,
  ): Promise<Sound> {
    return new Promise((resolve, reject) => {
      const sound = new Sound(
        name,
        path,
        this.scene,
        () => {
          sound.setVolume(volume * this.sfxVolume);
          this.sounds.set(name, sound);
          resolve(sound);
        },
        {
          autoplay: false,
          loop: false,
          spatialSound: false,
        },
      );

      setTimeout(() => {
        if (!this.sounds.has(name)) {
          reject(new Error(`Sound ${name} load timeout`));
        }
      }, 5000);
    });
  }

  play(name: string): void {
    if (this.isMuted) return;

    const sound = this.sounds.get(name);
    if (sound) {
      if (sound.isPlaying) {
        sound.stop();
      }
      sound.play();
    }
  }

  playPositional(name: string, x: number, y: number, z: number): void {
    if (this.isMuted) return;

    const sound = this.sounds.get(name);
    if (sound) {
      sound.spatialSound = true;
      sound.setPosition(new Vector3(x, y, z));
      if (sound.isPlaying) {
        sound.stop();
      }
      sound.play();
    }
  }

  stop(name: string): void {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.stop();
    }
  }

  stopAll(): void {
    this.sounds.forEach((sound) => sound.stop());
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => {
      const baseVolume = 1.0;
      sound.setVolume(baseVolume * this.sfxVolume);
    });
  }

  mute(): void {
    this.isMuted = true;
    this.stopAll();
  }

  unmute(): void {
    this.isMuted = false;
  }

  toggleMute(): void {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  dispose(): void {
    this.sounds.forEach((sound) => sound.dispose());
    this.sounds.clear();
  }
}

let gameAudioInstance: GameAudio | null = null;

export function initializeGameAudio(scene: Scene): Promise<GameAudio> {
  if (gameAudioInstance) {
    gameAudioInstance.dispose();
  }

  gameAudioInstance = new GameAudio(scene);
  return gameAudioInstance.loadSounds().then(() => gameAudioInstance!);
}

export function getGameAudio(): GameAudio | null {
  return gameAudioInstance;
}

export function playSound(name: string): void {
  gameAudioInstance?.play(name);
}

export function playPositionalSound(
  name: string,
  x: number,
  y: number,
  z: number,
): void {
  gameAudioInstance?.playPositional(name, x, y, z);
}
