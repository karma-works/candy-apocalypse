# Candy Apocalypse - Requirements and Architecture

## Overview

A vector-based, responsive browser game inspired by classic FPS games but reimagined as a joyful, comic-style experience. Written in pure, strict TypeScript (no `any`).

**License**: GPL-3.0 (GNU General Public License v3.0). All code must be GPL-3.0 compliant. We'll use doom.ts as a reference implementation (GPL-3.0) and adapt its logic while ensuring our final code is GPL-3.0 compliant.

**Project Name**: Candy Apocalypse

**Product Vision**: See [Product Design Document](./product_design.md) for the complete creative vision, visual style guide, and gameplay philosophy.

## Base Project

- **Project**: **doom.ts** (code is already in the repo)

## Core Principles

1. **Responsive**: The game scales dynamically with the viewport.
2. **Vector Graphics**: Assets are loaded from a single "SVG spritemap" at the beginning. Symbols are used to access individual SVGs.
3. **Game Resume**: Players must be able to resume immediately after death without restarting. See [Product Design](./product_design.md#death-resume-system) for implementation details.
4. **GPL3 Compliant**: All code and assets must be GPL3-licensed.
5. **Documentation-First**: Comprehensive markdown documentation precedes project planning and implementation.
6. **Styleguide Adherence**: All visual assets must follow the "Candy Apocalypse" color theme defined in [Product Design](./product_design.md#color-theme-candy-apocalypse).

## Core Mechanics

- **Performance Target**: The game MUST maintain a consistent framerate of at least **30 FPS**.
  - All SVGs pre-rasterized to OffscreenCanvas at 2x resolution during load phase
  - Rasterized sprites stored in memory cache for fast Canvas 2D draw operations
  - Three.js handles 3D scene graph, camera, and perspective transformations
  - SVG sprites rendered as billboards/textures mapped to 3D geometry
- **Modern Reimagined Visuals**:
  - "Candy Apocalpyse" is a modern, reimagined DOOM.
  - Freely scalable screen size, uniformly crisp and sharp vector graphics.
  - Modern technology for lighting (Shaders).
  - Implementation of modern fire and water effects in the environment.
- **Technical Foundation**: Use **`doom.ts`** (Thomas Chandelle) as the primary codebase. A TypeScript port of DOOM with Three.js renderer, demonstrating adapting classic DOOM logic to a browser-based 3D renderer. See [GitLab](https://gitlab.com/thomas.chandelle/doom.ts). We will fork and extend doom.ts directly.
- **Rendering Strategy**: Keep Three.js for 3D scene graph, camera, and perspective. Replace all texture rendering with SVG sprites that are rasterized to canvas at load time.
- **WAD Parsing**: Use doom.ts's built-in WAD parser (`src/doom/wad/wad.ts`). For Candy Apocalypse, we'll use Freedoom WAD files to extract structural level data (vertices, linedefs, sectors, BSP nodes, things) while replacing all graphics with our SVG-based rendering.
- **Audio Architecture**: Use doom.ts's audio system based on the **`smplr`** library:
  - `MusPlayer` class for MUS format playback (Doom's native music format)
  - `Soundfont` instruments for melodic tracks
  - `DrumMachine` for percussion
  - Web Audio API integration with scheduling
  - We'll compose new music in MUS format and generate new sound effect samples for the "Happy Metal" style.
- **License**: doom.ts is GPL v3-licensed. Our project is GPL-3.0 compliant as we're using doom.ts as our primary codebase.
- **Features**:
  - Navigation of 3D non-grid environments.
  - Doors and Keys.
  - Exit mechanics.
  - Enemies and shooting mechanics.
  - Multiple weapons (see Weapons section below).
  - **Mouse Support**: Full mouse control for looking/aiming and interaction.
- **SVG Asset System**:

  **Directory Structure**:

  ```
  assets/
    └── svg_raw/           # Individual SVG source files
        ├── pistol.svg
        ├── shotgun.svg
        ├── imp.svg
        └── ...

  public/assets/
    └── spritemap.svg      # Packed sprite atlas (generated)
  ```

  **Workflow**:
  1. **Create/Edit SVGs**: Work with individual SVG files in `assets/svg_raw/`
  2. **Pack**: Run `pnpm svg:pack` to combine all SVGs into `public/assets/spritemap.svg`
  3. **Unpack**: Run `pnpm svg:unpack` to extract symbols back to individual files (for editing)

  **Spritemap Details**:
  - Single SVG spritemap at `public/assets/spritemap.svg` with `<symbol>` elements
  - Generated from individual SVGs using `scripts/svg-spritemap.mjs`
  - Symbol IDs derived from filenames (e.g., `pistol.svg` → `id="pistol"`)
  - Loaded via file fetch at game initialization
  - Animated sprites store multiple frames within single SVG symbols
  - Pre-rasterize ALL SVGs to OffscreenCanvas at 2x screen resolution during load phase
  - Scale down on-demand during rendering to prevent blur effects

  **SVG Naming Conventions**:

  ```
  Weapons:     {weapon-name}.svg           (e.g., pistol.svg, shotgun.svg)
  Enemies:     {enemy-name}.svg            (e.g., imp.svg, zombie.svg)
  Walls:       wall-{variant}.svg          (e.g., wall-base.svg)
  Effects:     effect-{type}.svg           (e.g., explosion.svg)
  Items:       item-{type}.svg             (e.g., health-large.svg)
  ```

  **Asset Creation Guidelines**:
  - All SVGs must follow "Candy Apocalypse" color theme (see Product Design)
  - Include viewBox attribute (default: "0 0 64 64" if not specified)
  - Use semantic IDs for elements (e.g., `<g id="weapon-body">`)
  - Keep file sizes minimal (avoid embedded raster images)
  - For animated sprites: create separate files for each frame (e.g., `imp-walk-1.svg`, `imp-walk-2.svg`)

## Weapons

All weapons from the original Doom must be implemented:

1. **Chainsaw** - No ammo limit, melee weapon
2. **Pistol** - Standard starting weapon
3. **Shotgun** - Close-range powerhouse
4. **Chaingun** - Rapid-fire bullet hose
5. **Rocket Launcher** - Explosive damage
6. **Plasma Rifle** - Energy-based rapid fire
7. **BFG 9000** - Ultimate weapon

### SVG Weapon Design Requirements

- **First-Person Perspective**: All weapon SVGs must be designed from the player's viewpoint.
- **Trapezoid Shape**: Weapons should have a trapezoid-like perspective to create depth and 3D feel (wider at the bottom/closer to player, narrower at the top/further away).
- **Crisp Vector Lines**: Maintain sharp, clean lines that scale well at any resolution.
- **Color Theme**: Follow the "Candy Apocalypse" palette from [Product Design](./product_design.md#color-theme-candy-apocalypse).
- **Comic Style**: Thick outlines (`#1A1A2E`), exaggerated proportions, playful personality.

## Development Stack & Tooling

see #tech_stack.md

## Technical Architecture

### Rendering Pipeline

**Three.js Integration**:

- Keep Three.js for 3D scene graph, camera management, and perspective transformations
- Replace texture system with SVG-based sprites
- SVG sprites rendered as Three.js textures mapped to 3D geometry

**SVG Rasterization Strategy**:

```
Load Phase:
  1. Fetch spritemap.svg via HTTP
  2. Parse SVG DOM to extract all <symbol> elements
  3. For each symbol:
     - Create OffscreenCanvas at 2x screen resolution
     - Render SVG symbol to canvas
     - Store as ImageBitmap in sprite cache

Runtime:
  - Three.js textures reference cached ImageBitmaps
  - Scale down from 2x resolution on-demand (prevents blur)
  - Maintain 30 FPS target
```

### WAD Data Flow

**Parser**: doom.ts built-in WAD parser (`src/doom/wad/wad.ts`)

**Data Extraction**:

```
WAD File (freedoom.wad)
    ↓
Wad class (doom.ts)
    ↓
Lump Extraction:
    - VERTEXES: Wall corner coordinates
    - LINEDEFS: Wall definitions, doors, triggers
    - SECTORS: Floor/ceiling heights, lighting
    - THINGS: Entity placement (enemies, items, decorations)
    - NODES: BSP tree for rendering order
    - SEGS/SSECTORS: Rendering segments
    ↓
Game Engine (extended doom.ts)
    ↓
Render with SVG Sprites
```

**What We Ignore from WAD**:

- `PNAMES`, `TEXTURE1`, `TEXTURE2`: Texture definitions
- `SPRITES`: Original Doom sprite graphics
- `FLATS`: Floor/ceiling textures
- `PLAYPAL`, `COLORMAP`: Color palettes

### Audio System Architecture

**Music Playback** (doom.ts `MusPlayer`):

```
MUS File (from WAD or custom)
    ↓
Mus class (doom.ts/doom/sounds/mus.ts)
    ↓
MusPlayer (doom.ts/interfaces/smplr/mus-player.ts)
    ├─ Soundfont instruments (melodic tracks)
    ├─ DrumMachine (percussion)
    └─ Web Audio API scheduling
```

**Custom Music Creation**:

- Compose new tracks in MUS format
- Use Doom's MUS structure: 16 channels, tic-based timing
- Instrument mapping: Map to "Happy Metal" soundfont instruments
- Tempo: 140-180 BPM

**Sound Effects**:

- Generate new samples (cartoon-style, exaggerated)
- Integrate with doom.ts's existing sound system
- Web Audio API for playback

### SVG Spritemap Structure

**Location**: `public/assets/spritemap.svg` (auto-generated, do not edit manually)

**Generation**: Run `pnpm svg:pack` to generate from `assets/svg_raw/`

**Current Symbols** (existing):

- Weapons: `pistol`, `shotgun`, `chaingun`, `supershotgun`
- Enemies: `imp`
- Environment: `barrel`, `door`, `wall-base`

**Symbol ID Mapping**:

```
Filename                → Symbol ID
pistol.svg             → id="pistol"
shotgun.svg            → id="shotgun"
imp.svg                → id="imp"
wall-base.svg          → id="wall-base"
```

**For Candy Apocalypse Style** (to be updated):
Current SVGs use generic Doom colors. Update to follow naming:

```
Walls:       wall-{color-name}           (e.g., wall-sky-pop)
Enemies:     enemy-{name}-{frame}        (e.g., enemy-imp-walk-1)
Weapons:     weapon-{name}-{frame}       (e.g., weapon-pistol-fire-1)
Effects:     effect-{type}-{variant}     (e.g., effect-explosion-1)
Items:       item-{type}                 (e.g., item-health-large)
```

### Performance Optimization

**Pre-rasterization**:

- All SVGs rasterized at load time (no runtime SVG parsing)
- 2x resolution cache (e.g., 1920x1080 screen → 3840x2160 raster)
- Downscaling on render prevents blur, maintains crisp edges

**Memory Management**:

- ImageBitmap cache for all sprites
- Three.js texture cache
- Dispose unused textures when changing levels

**Frame Rate Target**:

- 30 FPS minimum
- Monitor with `requestAnimationFrame` timing
- Performance budget: < 33ms per frame

### Input System

**Mouse Controls** (extend doom.ts):

- Mouse look: X/Y axis for camera rotation
- Left click: Fire weapon
- Scroll wheel: Weapon switching
- Pointer lock API for immersive control

**Keyboard** (use doom.ts existing):

- WASD: Movement
- 1-7: Weapon selection
- E/Enter: Interaction (doors, switches)
- R: Restart level
