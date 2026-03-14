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
import { EntityManager } from '../../game/EntityManager';
import { Player } from '../../game/entities/Player';
import { Enemy } from '../../game/entities/Enemy';
import { useGameStore } from '../../game/state/gameStore';
import {
  getDefaultLevel,
  getLevelConfig,
  loadManifest,
} from '../../game/levels/levelManifest';

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

  const [ isReady, setIsReady ] = useState(false);
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
    scene.gravity = new Vector3(0, -9.81, 0);
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
    camera.applyGravity = true;
    camera.checkCollisions = true;
    camera.ellipsoid = new Vector3(0.5, 0.8, 0.5); // Lowered from 1.7 to align eye level with enemies
    camera.inputs.clear();
    scene.activeCamera = camera;
    cameraRef.current = camera;

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    initializeGameAudio();

    canvas.addEventListener('click', () => {
      const { isPaused, isPlaying } = useGameStore.getState();
      if (!isPaused && isPlaying && playerRef.current) {
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
      }

      entityManager.update(deltaTime);
      scene.render();
    });

    setIsReady(true);

    return () => {
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

    const loadLevel = async() => {
      setLoading(true);

      try {
        if (textureManagerRef.current) {
          await textureManagerRef.current.loadSpritemap(
            `${import.meta.env.BASE_URL}assets/spritemap.svg`,
          );
        }

        const scene = sceneRef.current!;
        const entityManager = entityManagerRef.current!;

        scene.meshes.forEach((mesh) => {
          if (mesh.name !== 'fpsCamera') {
            mesh.dispose();
          }
        });
        entityManager.clear();

        if (cameraRef.current) {
          cameraRef.current.position.set(0, 100, 0);
        }

        let spawns: import('../../game/state/gameStore').SpawnPoint[];

        if (proceduralLevelIndex >= 0) {
          // ── Procedural path ────────────────────────────────────────────
          const meta = PROCEDURAL_LEVELS[proceduralLevelIndex];
          const generated = generateLevel(meta.params);
          buildLevel(generated, scene);

          // Fog scaled by level length
          scene.fogMode = Scene.FOGMODE_LINEAR;
          scene.fogStart = 10 + meta.params.length * 3;
          scene.fogEnd = 30 + meta.params.length * 8;
          scene.fogColor = new Color3(0.1, 0.1, 0.15);

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
              const spawnPos = entity.metadata.spawnPosition as [
                number,
                number,
                number,
              ];
              if (spawnPos) {
                entity.movement.setPosition(
                  spawnPos[0],
                  spawnPos[1],
                  spawnPos[2],
                );
                setSpawnPosition(spawnPos);
              }
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
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  return (
    <canvas
      id="game-canvas"
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100vh',
        display: 'block',
        outline: 'none',
      }}
    />
  );
}
