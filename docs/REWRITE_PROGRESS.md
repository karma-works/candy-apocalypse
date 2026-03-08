# Babylon.js Rewrite - Phase 1-3 Complete

## What's Done

### ✅ Phase 1: Foundation

- Removed old `src/doom/` directory
- Removed WAD-related dependencies (Three.js, R3F, smplr, etc.)
- Installed Babylon.js + Zustand
- Created clean architecture with engine/game separation
- Basic Engine class
- AssetLoader for GLB files
- InputManager for keyboard/mouse
- FirstPersonCamera with WASD + mouse look
- AudioManager wrapper
- Zustand game state store
- Level manifest system
- Procedural fallback level

### ✅ Phase 2: First Working Demo

- Can load a GLB level (with procedural fallback)
- First-person camera works
- WASD movement + mouse look
- Collision prevents walking through walls
- HUD shows health/ammo/score
- Pause system (ESC key)
- Crosshair

### ✅ Phase 3: Entity System

- Base Entity class with component system
- Component classes: Transform, Health, Movement, Inventory
- Player entity with attached components
- Enemy entity (demon, imp, cacodemon variants)
- Prop entity (barrel, pillar, crate variants)
- EntityManager for spawning and managing entities
- Entities spawn from JSON manifest

## Architecture

```
src/
├── engine/                    # Engine layer (agnostic, reusable)
│   ├── core/Engine.ts        # Main engine class
│   ├── assets/
│   │   ├── AssetLoader.ts    # GLB loading
│   │   └── ProceduralLevel.ts # Fallback level generator
│   ├── input/InputManager.ts  # Keyboard/mouse handling
│   ├── camera/FirstPersonCamera.ts
│   └── audio/AudioManager.ts
│
├── game/                      # Game layer (domain-specific)
│   ├── EntityManager.ts       # Spawn/manage entities
│   ├── entities/
│   │   ├── Entity.ts         # Base entity + component system
│   │   ├── Player.ts
│   │   ├── Enemy.ts
│   │   └── Prop.ts
│   ├── components/
│   │   ├── Transform.ts
│   │   ├── Health.ts
│   │   ├── PlayerMovement.ts
│   │   └── Inventory.ts
│   ├── state/gameStore.ts    # Zustand store
│   └── levels/levelManifest.ts
│
└── ui/                        # React UI
    ├── App.tsx
    └── components/
        ├── GameCanvas.tsx
        └── HUD.tsx
```

## Entity System

**Composition-based entities:**

```typescript
const player = new Player("player_0");
player.health.takeDamage(10);
player.movement.speed = 6;
player.inventory.addWeapon("shotgun", 20, 50);
```

**Spawning from manifest:**

```json
{
  "spawns": [
    { "type": "player", "position": [0, 1.7, 0] },
    { "type": "enemy-demon", "position": [5, 0, 5] },
    { "type": "prop-barrel", "position": [3, 0, 2] }
  ]
}
```

## Next Steps

### Phase 4: Game State Integration

- [ ] Sync player health with Zustand store
- [ ] Sync player ammo with Zustand store
- [ ] Damage system (player can take damage)
- [ ] Death/respawn system

### Phase 5: Combat System

- [ ] Weapon switching
- [ ] Shooting mechanics
- [ ] Enemy AI (chase, attack)
- [ ] Enemy death

### Phase 6: Audio

- [ ] Background music
- [ ] Sound effects (shoot, hit, death)
- [ ] Spatial audio

### Phase 7: Polish

- [ ] Create actual GLB levels
- [ ] Multiple levels
- [ ] More enemy types
- [ ] More weapons
- [ ] Testing

## How to Test

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Click canvas to lock pointer
# WASD to move, mouse to look
# ESC to unlock pointer
```

## Known Issues

- Bundle size is large (5.5MB) - need code splitting
- No GLB levels yet - using procedural fallback
- Entity health/ammo not synced to Zustand store
- No weapons/combat
- No audio
- Enemies don't move or attack

## What Was Thrown Away

- WAD file parsing
- DOOM game logic (AI, items, doors, etc.)
- Palette-based rendering
- BSP visibility
- Sprite billboards
- All Three.js/R3F code
