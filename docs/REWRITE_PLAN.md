# Babylon.js Rewrite Plan

## Overview

Complete rewrite of the doom.ts engine using Babylon.js with react-babylonjs. Throwing away WAD system, game logic, palette rendering, BSP visibility, and sprite billboards in favor of modern approaches.

## Tech Stack Changes

| Before                       | After                        |
| ---------------------------- | ---------------------------- |
| Three.js + React-Three-Fiber | Babylon.js + react-babylonjs |
| WAD file parsing             | .glb models                  |
| Custom game logic            | Clean engine/game separation |
| Palette-based rendering      | Modern PBR materials         |
| BSP visibility               | Babylon's built-in culling   |
| Sprite billboards            | 3D models                    |
| DOOM-style architecture      | Modern layered architecture  |

## Architecture

### Directory Structure

```
src/
├── engine/                    # Engine layer (agnostic, reusable)
│   ├── core/
│   │   ├── Engine.ts         # Main engine class
│   │   └── Scene.ts          # Scene management
│   ├── assets/
│   │   ├── AssetLoader.ts    # GLB, textures, audio loading
│   │   └── AssetCache.ts     # Asset caching
│   ├── input/
│   │   ├── InputManager.ts   # Input abstraction
│   │   └── KeyBindings.ts    # Key binding config
│   ├── camera/
│   │   └── FirstPersonCamera.ts
│   ├── physics/
│   │   └── CollisionSystem.ts
│   └── audio/
│       └── AudioManager.ts   # Babylon sound wrapper
│
├── game/                      # Game layer (domain-specific)
│   ├── entities/
│   │   ├── Entity.ts         # Base entity class
│   │   ├── Player.ts
│   │   └── Enemy.ts
│   ├── components/           # Entity components (composition)
│   │   ├── Transform.ts
│   │   ├── Health.ts
│   │   ├── Movement.ts
│   │   └── Inventory.ts
│   ├── state/
│   │   └── gameStore.ts      # Zustand store
│   ├── levels/
│   │   └── LevelManager.ts   # Load levels from manifest
│   └── Game.ts               # Main game class
│
├── ui/                        # React UI layer
│   ├── components/
│   │   ├── GameCanvas.tsx    # Babylon canvas
│   │   └── HUD.tsx
│   └── App.tsx
│
└── assets/
    ├── models/
    │   ├── player.glb
    │   ├── enemies/
    │   └── weapons/
    ├── levels/
    │   ├── test-level.glb
    │   └── e1m1.glb
    └── audio/
        ├── music/
        └── sfx/
```

### Engine Layer

**Responsibilities:**

- Scene management (create, destroy, switch)
- Asset loading (.glb, textures, audio)
- Input handling (keyboard, mouse)
- Camera controller (first-person)
- Physics/collision (Babylon built-in)
- Audio playback (Babylon sound system)
- Render loop management

**Key Classes:**

```typescript
class Engine {
  scene: BabylonScene;
  assetLoader: AssetLoader;
  inputManager: InputManager;
  audioManager: AudioManager;
  // ...
}

class AssetLoader {
  loadModel(path: string): Promise<AbstractMesh>;
  loadLevel(path: string): Promise<Scene>;
  loadSound(path: string): Promise<Sound>;
}

class FirstPersonCamera {
  camera: FreeCamera;
  sensitivity: number;
  // WASD + mouse look
}
```

### Game Layer

**Responsibilities:**

- Entity definitions (Player, Enemy, etc.)
- Game state (health, ammo, score) via Zustand
- Level loading from manifest
- Game rules and logic
- Component composition for entities

**Entity System (Plain Classes + Composition):**

```typescript
class Entity {
  id: string;
  name: string;
  mesh: AbstractMesh | null;
  components: Map<string, Component>;

  addComponent<T extends Component>(component: T): void;
  getComponent<T extends Component>(type: string): T | undefined;
  update(deltaTime: number): void;
}

class Player extends Entity {
  transform: Transform;
  health: Health;
  movement: Movement;
  inventory: Inventory;
}

class Component {
  entity: Entity;
  update(deltaTime: number): void;
}

class Health extends Component {
  current: number;
  max: number;
  takeDamage(amount: number): void;
}

class Movement extends Component {
  speed: number;
  jumpForce: number;
  // Uses Babylon collision
}
```

**State Management (Zustand):**

```typescript
interface GameState {
  // Player state
  health: number;
  ammo: Record<string, number>;

  // Game state
  currentLevel: string | null;
  isPaused: boolean;
  score: number;

  // Actions
  setHealth: (health: number) => void;
  setCurrentLevel: (level: string) => void;
  pause: () => void;
  resume: () => void;
}

const useGameStore = create<GameState>((set) => ({
  // ...
}));
```

### Level Format

**JSON Manifest (`levels.json`):**

```json
{
  "levels": {
    "test-level": {
      "name": "Test Level",
      "model": "assets/levels/test-level.glb",
      "spawns": [
        { "type": "player", "position": [0, 1, 0], "rotation": [0, 0, 0] },
        { "type": "enemy-demon", "position": [10, 1, 5] },
        { "type": "prop-barrel", "position": [5, 1, 3] }
      ],
      "ambient": {
        "music": "audio/music/e1m1.mp3",
        "fog": { "mode": "linear", "start": 10, "end": 50 }
      }
    }
  },
  "defaultLevel": "test-level"
}
```

**GLB Level Content:**

- Level geometry (walls, floors, ceilings)
- Collision meshes
- Light sources (optional)
- Does NOT contain: entity spawns, game logic

**Entity Spawns:** Defined in JSON manifest, instantiated at runtime

### React Integration

**react-babylonjs Setup:**

```tsx
// GameCanvas.tsx
import { Engine, Scene } from "react-babylonjs";

export function GameCanvas() {
  return (
    <Engine antialias adaptToDeviceRatio>
      <Scene onSceneReady={onSceneReady}>
        <FirstPersonCamera />
        <hemisphericLight />
        <LevelLoader levelId={currentLevel} />
      </Scene>
    </Engine>
  );
}
```

**HUD Overlay:**

```tsx
// HUD.tsx
export function HUD() {
  const { health, ammo } = useGameStore();

  return (
    <div className="hud">
      <HealthBar value={health} />
      <AmmoCounter value={ammo["shotgun"]} />
    </div>
  );
}
```

## Implementation Phases

### Phase 1: Foundation

- [ ] Remove old `src/doom/` directory
- [ ] Remove WAD-related dependencies
- [ ] Install Babylon.js + react-babylonjs + Zustand
- [ ] Create `src/engine/` structure
- [ ] Create `src/game/` structure
- [ ] Basic Engine class

### Phase 2: First Working Demo

- [ ] Create test level GLB (simple room)
- [ ] Create levels.json manifest
- [ ] AssetLoader for GLB files
- [ ] FirstPersonCamera with WASD + mouse
- [ ] Collision setup
- [ ] Load level, walk around

### Phase 3: Entity System

- [ ] Base Entity class
- [ ] Component system
- [ ] Player entity with movement component
- [ ] Spawn entities from manifest

### Phase 4: Game State

- [ ] Zustand store setup
- [ ] Health system
- [ ] Inventory/weapons
- [ ] HUD UI components

### Phase 5: Audio

- [ ] AudioManager wrapper
- [ ] Background music
- [ ] Sound effects
- [ ] Spatial audio

### Phase 6: Polish

- [ ] Multiple levels
- [ ] Enemy entities
- [ ] Weapons
- [ ] Game loop (start/pause/die/restart)

## Dependencies to Add

```json
{
  "dependencies": {
    "@babylonjs/core": "^7.x",
    "@babylonjs/loaders": "^7.x",
    "@babylonjs/materials": "^7.x",
    "@babylonjs/gui": "^7.x",
    "react-babylonjs": "^3.x",
    "zustand": "^4.x"
  }
}
```

## Dependencies to Remove

```json
{
  "dependencies": {
    "@react-three/drei": "REMOVE",
    "@react-three/fiber": "REMOVE",
    "r3f-perf": "REMOVE",
    "three": "REMOVE",
    "@types/three": "REMOVE",
    "smplr": "REMOVE"
  }
}
```

## Migration Notes

### What We're Losing (Intentionally)

- WAD file support (replaced by GLB)
- Palette-based rendering (replaced by PBR)
- BSP visibility (replaced by Babylon culling)
- DOOM-specific game logic (rebuilt clean)
- Sprite billboards (replaced by 3D models)

### What We're Keeping

- React UI structure (modified)
- Vite build system
- TypeScript strict mode
- Testing infrastructure (Vitest + Playwright)

## Success Criteria

**Phase 2 Complete When:**

- [ ] Can load a GLB level
- [ ] First-person camera works
- [ ] WASD movement + mouse look
- [ ] Collision prevents walking through walls
- [ ] Runs at 60fps

**Full Rewrite Complete When:**

- [ ] All old doom/ code removed
- [ ] Clean engine/game separation
- [ ] Entities spawn from manifest
- [ ] Game state in Zustand
- [ ] HUD shows health/ammo
- [ ] Audio works
- [ ] Can play through a test level

## Next Steps

1. Create this plan document ✅
2. Begin Phase 1: Remove old code, install Babylon
3. Phase 2: First working demo (load GLB, walk around)
4. Iterate from there
