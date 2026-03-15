import { useEffect, useRef, useState } from 'react';
import {
  Color3,
  Engine,
  FreeCamera,
  HemisphericLight,
  Scene,
  Vector3,
} from '@babylonjs/core';
import { InputManager } from '../../engine/input/InputManager';
import { AssetLoader } from '../../engine/assets/AssetLoader';
import { TextureManager } from '../../engine/assets/TextureManager';
import { createTestLevel } from '../../engine/assets/ProceduralLevel';
import { generateLevel } from '../../engine/procedural/LevelLayout';
import { buildLevel } from '../../engine/procedural/LevelBuilder';
import { PROCEDURAL_LEVELS } from '../../engine/procedural/ProceduralLevels';
import { initializeGameAudio } from '../../engine/audio/GameAudio';
import { musicManager } from '../../engine/audio/MusicManager';
import { EntityManager } from '../../game/EntityManager';
import { Player } from '../../game/entities/Player';
import { Enemy } from '../../game/entities/Enemy';
import { Pickup } from '../../game/entities/Pickup';
import { useGameStore } from '../../game/state/gameStore';
import {
  getDefaultLevel,
  getLevelConfig,
  loadManifest,
} from '../../game/levels/levelManifest';
import { RainbowFogEffect } from '../../engine/effects/RainbowFogEffect';
import { EffectManager } from '../../game/components/EffectManager';
import type { CloudCeiling } from '../../engine/effects/CloudCeiling';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<FreeCamera | null>(null);
  const inputRef = useRef<InputManager | null>(null);
  const loaderRef = useRef<AssetLoader | null>(null);
  const textureManagerRef = useRef<TextureManager | null>(null);
  const entityManagerRef = useRef<EntityManager | null>(null);
  const playerRef = useRef<Player | null>(null);
  const bonusExitSpawnedRef = useRef(false);
  const rainbowFogRef = useRef<RainbowFogEffect | null>(null);
  const effectManagerRef = useRef<EffectManager | null>(null);
  const cloudCeilingRef = useRef<CloudCeiling | null>(null);

  const [ isReady, setIsReady ] = useState(false);
  const noclipRef = useRef(
    new URLSearchParams(window.location.search).get('noclip') === 'true',
  );
  const {
    currentLevel,
    proceduralLevelIndex,
    setLoading,
    setCurrentLevel,
    startGame,
    setPlaying,
    setSpawnPosition,
  } = useGameStore();

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    engineRef.current = engine;

    const scene = new Scene(engine);
    sceneRef.current = scene;
    // BabylonJS adds scene.gravity directly to the displacement each frame
    // (not scaled by deltaTime), so -9.81 means ~590 units/second at 60fps —
    // enough to overshoot thin floor meshes in one frame. Use a per-frame value.
    scene.gravity = new Vector3(0, -0.15, 0);
    scene.collisionsEnabled = true;

    const inputManager = new InputManager();
    inputManager.initialize(canvas);
    inputRef.current = inputManager;

    const assetLoader = new AssetLoader();
    assetLoader.setScene(scene);
    loaderRef.current = assetLoader;

    const textureManager = new TextureManager(scene);
    textureManagerRef.current = textureManager;

    const entityManager = new EntityManager(scene, textureManager);
    entityManagerRef.current = entityManager;

    const camera = new FreeCamera('fpsCamera', new Vector3(0, 1.7, 0), scene);
    camera.minZ = 0.1;
    camera.maxZ = 1000;
    camera.fov = 1.2;
    camera.inertia = 0;
    camera.applyGravity = !noclipRef.current;
    camera.checkCollisions = !noclipRef.current;
    camera.ellipsoid = new Vector3(0.5, 0.8, 0.5);
    camera.inputs.clear();
    // Apply gravity every frame (not only when moving) so the camera settles on
    // the floor immediately after spawn, before the player presses any key.
    // Without this, gravity fires only on the first movement frame, and the
    // large single-frame drop passes through thin floor meshes.
    camera.needMoveForGravity = !noclipRef.current;
    scene.activeCamera = camera;
    cameraRef.current = camera;

    if (noclipRef.current) {
      console.log('NOCLIP MODE ENABLED - Use Space/Shift to fly up/down');
    }

    const effectManager = new EffectManager(scene);
    effectManagerRef.current = effectManager;

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    initializeGameAudio();

    canvas.addEventListener('click', () => {
      const { isPaused, isPlaying } = useGameStore.getState();
      if (
        !isPaused &&
        isPlaying &&
        playerRef.current &&
        document.pointerLockElement === canvas
      ) {
        playerRef.current.fire();
      }
    });

    let lastTime = performance.now();

    engine.runRenderLoop(() => {
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      inputManager.update();

      if (playerRef.current) {
        playerRef.current.update(deltaTime);

        const scroll = inputManager.getScrollDelta();
        if (scroll !== 0 && playerRef.current) {
          const weapons = [ ...playerRef.current.inventory.weapons.keys() ];
          const current = playerRef.current.inventory.currentWeapon;
          const idx = weapons.indexOf(current ?? '');
          if (idx !== -1) {
            const next = (idx + (scroll > 0 ? 1 : -1) + weapons.length) % weapons.length;
            playerRef.current.switchWeapon(weapons[next]);
          }
        }

        // Check pickup collection
        if (entityManagerRef.current && cameraRef.current) {
          const playerPos = cameraRef.current.position;
          const pickups = entityManagerRef.current.getPickups();

          pickups.forEach((pickup) => {
            if (!pickup.isActive) {
              return;
            }

            const pickupPos = pickup.getPosition();
            const distance = Vector3.Distance(playerPos, pickupPos);

            if (distance < 1.5) {
              pickup.collect();
            }
          });
        }

        if (!bonusExitSpawnedRef.current && entityManagerRef.current) {
          const enemies = entityManagerRef.current.getEnemies();
          const allDead =
            enemies.length > 0 &&
            enemies.every((e) => !e.isActive || e.health.isDead);
          if (allDead && cameraRef.current) {
            const playerPos = cameraRef.current.position;
            const exitId = `bonus_exit_${Date.now()}`;
            const exit = new Pickup(exitId, 'level_exit');
            exit.createMesh(sceneRef.current!, textureManagerRef.current);
            exit.setPosition(playerPos.x + 2, 1, playerPos.z + 2);
            entityManagerRef.current['entities'].set(exitId, exit);
            bonusExitSpawnedRef.current = true;
          }
        }
      }

      entityManager.update(deltaTime);
      cloudCeilingRef.current?.update(deltaTime);
      scene.render();
    });

    setIsReady(true);

    return () => {
      rainbowFogRef.current?.dispose();
      cloudCeilingRef.current?.dispose();
      entityManager.dispose();
      engine.dispose();
      inputManager.dispose();
    };
  }, []);

  useEffect(() => {
    if (
      !isReady ||
      !loaderRef.current ||
      !sceneRef.current ||
      !entityManagerRef.current
    ) {
      return;
    }

    let cancelled = false;
    const loadLevel = async() => {
      console.log(
        `[SPAWN DEBUG] loadLevel START — proceduralLevelIndex=${proceduralLevelIndex}`,
      );
      setLoading(true);

      try {
        if (textureManagerRef.current) {
          await textureManagerRef.current.loadSpritemap(
            `${import.meta.env.BASE_URL}assets/spritemap.svg`,
          );
        }

        if (cancelled) {
          console.log(
            `[SPAWN DEBUG] loadLevel CANCELLED — proceduralLevelIndex=${proceduralLevelIndex}`,
          );
          return;
        }

        const scene = sceneRef.current!;
        const entityManager = entityManagerRef.current!;

        const meshesBeforeDispose = scene.meshes.length;
        [ ...scene.meshes ].forEach((mesh) => {
          if (mesh.name !== 'fpsCamera') {
            mesh.dispose();
          }
        });
        console.log(
          `[LEVEL DEBUG] disposed meshes: ${meshesBeforeDispose} before → ${scene.meshes.length} after (expect 0 or 1)`,
        );
        entityManager.clear();
        bonusExitSpawnedRef.current = false;

        if (cameraRef.current) {
          console.log(
            `[SPAWN DEBUG] camera before safety-move: ${JSON.stringify(cameraRef.current.position)}`,
          );
          cameraRef.current.position.set(0, 100, 0);
        }

        let spawns: import('../../game/state/gameStore').SpawnPoint[];

        if (proceduralLevelIndex >= 0) {
          const meta = PROCEDURAL_LEVELS[proceduralLevelIndex];
          const generated = generateLevel(meta.params);
          const playerSpawn = generated.spawns.find((s) => s.type === 'player');
          console.log(
            `[SPAWN DEBUG] level ${proceduralLevelIndex} generated player spawn:`,
            playerSpawn?.position,
          );
          const built = buildLevel(generated, scene);

          if (cloudCeilingRef.current) {
            cloudCeilingRef.current.dispose();
          }
          cloudCeilingRef.current = built.cloudCeiling;

          const fogStart = 10 + meta.params.length * 3;
          const fogEnd = 30 + meta.params.length * 8;

          if (rainbowFogRef.current) {
            rainbowFogRef.current.dispose();
          }
          if (cameraRef.current) {
            rainbowFogRef.current = new RainbowFogEffect(cameraRef.current, {
              fogStart,
              fogEnd,
              colorSpeed: 1.0,
              rainbowIntensity: 0.7,
            });
          }

          spawns = generated.spawns;
        } else {
          // ── Legacy test level path (accessed via ?level=test) ──────────
          const manifest = await loadManifest();
          const levelId = currentLevel || getDefaultLevel(manifest);
          const config = getLevelConfig(levelId, manifest);

          if (!config) {
            console.error(`Level ${levelId} not found in manifest`);
            return;
          }

          try {
            const meshes = await loaderRef.current!.loadLevel(config.model);
            meshes.forEach((mesh) => {
              mesh.checkCollisions = true;
            });
          } catch {
            console.warn('GLB load failed, falling back to createTestLevel');
            createTestLevel(scene);
          }

          if (config.ambient?.fog) {
            const fog = config.ambient.fog;
            scene.fogMode =
              fog.mode === 'linear'
                ? Scene.FOGMODE_LINEAR
                : fog.mode === 'exp'
                  ? Scene.FOGMODE_EXP
                  : Scene.FOGMODE_NONE;
            if (fog.start !== undefined) {
              scene.fogStart = fog.start;
            }
            if (fog.end !== undefined) {
              scene.fogEnd = fog.end;
            }
            if (fog.density !== undefined) {
              scene.fogDensity = fog.density;
            }
            if (fog.color) {
              scene.fogColor = new Color3(
                fog.color[0],
                fog.color[1],
                fog.color[2],
              );
            }
          }

          spawns = config.spawns;
          setCurrentLevel(levelId);
        }

        spawns.forEach((spawn, index) => {
          const entity = entityManager.spawnEntity(spawn, index);
          if (entity instanceof Player) {
            playerRef.current = entity;
            if (cameraRef.current && inputRef.current) {
              entity.attachToCamera(cameraRef.current, inputRef.current, scene);
              entity.movement.setNoclip(noclipRef.current);
              const spawnPos = entity.metadata.spawnPosition as [
                number,
                number,
                number,
              ];
              if (spawnPos) {
                console.log(
                  '[SPAWN DEBUG] camera BEFORE setPosition:',
                  JSON.stringify(cameraRef.current.position),
                );
                console.log(
                  '[SPAWN DEBUG] cameraDirection BEFORE:',
                  JSON.stringify(cameraRef.current.cameraDirection),
                );
                const cam = cameraRef.current as any;
                console.log(
                  '[SPAWN DEBUG] _gravity BEFORE:',
                  JSON.stringify(cam._gravity),
                );
                entity.movement.setPosition(
                  spawnPos[0],
                  spawnPos[1],
                  spawnPos[2],
                );
                console.log(
                  '[SPAWN DEBUG] camera AFTER setPosition:',
                  JSON.stringify(cameraRef.current.position),
                );
                setSpawnPosition(spawnPos);
              } else {
                console.warn(
                  '[SPAWN DEBUG] spawnPos is null/undefined for player entity!',
                );
              }
            } else {
              console.warn(
                '[SPAWN DEBUG] cameraRef or inputRef is null — setPosition SKIPPED',
              );
            }
          }
        });

        startGame();
        setPlaying(true);
      } catch (error) {
        console.error('Failed to load level:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLevel();
    return () => {
      cancelled = true;
    };
  }, [
    isReady,
    currentLevel,
    proceduralLevelIndex,
    setLoading,
    setCurrentLevel,
    startGame,
    setPlaying,
    setSpawnPosition,
  ]);

  useEffect(() => {
    const handleResize = () => {
      engineRef.current?.resize();
      // Ensure camera aspect ratio is updated
      if (cameraRef.current && canvasRef.current) {
        cameraRef.current.fov =
          window.innerWidth / window.innerHeight > 1.6 ? 1.0 : 1.2;
      }
    };
    window.addEventListener('resize', handleResize);
    // Also handle orientation change on mobile
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const { isPaused, setPaused, isPlaying, health } =
          useGameStore.getState();
        if (isPaused && isPlaying) {
          setPaused(false);
          canvasRef.current?.requestPointerLock();
        } else if (!isPlaying && health <= 0) {
          window.location.reload();
        }
      }

      if (e.code === 'Digit1') {
        playerRef.current?.switchWeapon('pistol');
      } else if (e.code === 'Digit2') {
        playerRef.current?.switchWeapon('shotgun');
      } else if (e.code === 'Digit3') {
        playerRef.current?.switchWeapon('chaingun');
      } else if (e.code === 'KeyM') {
        const { toggleMusic } = useGameStore.getState();
        toggleMusic();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handlePointerLockChange = () => {
      const { isPlaying, setPaused, isPaused } = useGameStore.getState();
      if (
        isPlaying &&
        !isPaused &&
        document.pointerLockElement !== canvasRef.current
      ) {
        setPaused(true);
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () =>
      document.removeEventListener(
        'pointerlockchange',
        handlePointerLockChange,
      );
  }, []);

  useEffect(() => {
    const handleRespawn = () => {
      const { spawnPosition } = useGameStore.getState();
      if (spawnPosition && playerRef.current) {
        playerRef.current.movement.setPosition(
          spawnPosition[0],
          spawnPosition[1],
          spawnPosition[2],
        );
        playerRef.current.health.reset();
      }
    };

    window.addEventListener('playerRespawn', handleRespawn);
    return () => window.removeEventListener('playerRespawn', handleRespawn);
  }, []);

  useEffect(() => {
    const handleEntityHit = (e: CustomEvent) => {
      const { entityId, damage } = e.detail;
      const entity = entityManagerRef.current?.getEntity(entityId);
      if (entity && 'takeDamage' in entity) {
        (entity as any).takeDamage(damage);

        // When enemy dies, register the kill (handles score + combo escalation)
        if ('health' in entity && (entity as any).health.isDead) {
          useGameStore.getState().addKill();
        }
      }
    };

    window.addEventListener('entityHit', handleEntityHit as EventListener);
    return () =>
      window.removeEventListener('entityHit', handleEntityHit as EventListener);
  }, []);

  useEffect(() => {
    const handleEnemyDeath = (e: CustomEvent) => {
      const { position, enemyType } = e.detail;
      if (effectManagerRef.current) {
        const effectPos = new Vector3(position.x, position.y, position.z);
        switch (enemyType) {
        case 'pigeon':
          effectManagerRef.current.playFeatherExplosion(effectPos);
          break;
        case 'sheep':
          effectManagerRef.current.playWoolConfetti(effectPos);
          break;
        default:
          if (Math.random() > 0.7) {
            effectManagerRef.current.playConfettiBurst(effectPos);
          } else if (Math.random() > 0.5) {
            effectManagerRef.current.playLegoScatter(effectPos);
          } else {
            effectManagerRef.current.playKaBoom(effectPos);
          }
        }
      }
    };

    window.addEventListener('enemyDeath', handleEnemyDeath as EventListener);
    return () =>
      window.removeEventListener(
        'enemyDeath',
        handleEnemyDeath as EventListener,
      );
  }, []);

  useEffect(() => {
    const handleWeaponFired = (e: CustomEvent) => {
      if (!cameraRef.current || !entityManagerRef.current) {
        return;
      }
      const playerPos = cameraRef.current.position;
      const enemies = entityManagerRef.current.getEnemies();
      const activationRange = 25;

      enemies.forEach((enemy) => {
        if (!enemy.ai) {
          return;
        }
        const enemyPos = enemy.getPosition();
        const dist = Vector3.Distance(
          playerPos,
          new Vector3(enemyPos.x, playerPos.y, enemyPos.z),
        );
        if (dist <= activationRange) {
          enemy.ai.activate();
        }
      });
    };

    window.addEventListener('weaponFired', handleWeaponFired as EventListener);
    return () =>
      window.removeEventListener(
        'weaponFired',
        handleWeaponFired as EventListener,
      );
  }, []);

  // Screen shake: watch health changes and apply camera jitter on damage
  useEffect(() => {
    let prevHealth = useGameStore.getState().health;
    const unsub = useGameStore.subscribe((state) => {
      if (state.health < prevHealth && cameraRef.current) {
        prevHealth = state.health;
        // Dispatch event for HUD vignette
        window.dispatchEvent(new CustomEvent('playerDamaged'));
        // Camera shake: jitter then spring back
        const cam = cameraRef.current;
        const originPos = cam.position.clone();
        const intensity = 0.06;
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 16;
          if (elapsed >= 200) {
            cam.position.copyFrom(originPos);
            clearInterval(interval);
            return;
          }
          const fade = 1 - elapsed / 200;
          cam.position.x =
            originPos.x + (Math.random() - 0.5) * intensity * fade;
          cam.position.z =
            originPos.z + (Math.random() - 0.5) * intensity * fade;
        }, 16);
      } else {
        prevHealth = state.health;
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const { musicEnabled } = useGameStore.getState();
    musicManager.setEnabled(musicEnabled);
  }, []);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.musicEnabled !== musicManager.enabled) {
        musicManager.setEnabled(state.musicEnabled);
        if (state.musicEnabled && state.isPlaying && !state.isPaused) {
          musicManager.playRandomTrack();
        }
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const { musicEnabled, isPlaying, isPaused } = useGameStore.getState();
    if (isPlaying && !isPaused && musicEnabled) {
      musicManager.playRandomTrack();
    }
    if (!isPlaying || isPaused) {
      musicManager.stop();
    }
  }, [ proceduralLevelIndex, isReady ]);

  return (
    <canvas
      id="game-canvas"
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        outline: 'none',
      }}
    />
  );
}
