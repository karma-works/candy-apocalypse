# SVG Asset Pipeline

This directory contains individual SVG source files for Candy Apocalypse game assets.

## Directory Structure

```
assets/
  └── svg_raw/           # Individual SVG source files
      ├── pistol.svg
      ├── shotgun.svg
      └── ...

public/assets/
  └── spritemap.svg      # Packed sprite atlas (auto-generated)
```

## Workflow

### 1. Creating/Editing SVGs

- Work directly with individual SVG files in `assets/svg_raw/`
- Follow the "Candy Apocalypse" color theme (see [Product Design](../../docs/product_design.md))
- Include a `viewBox` attribute (default: "0 0 64 64")
- Use semantic element IDs (e.g., `<g id="weapon-body">`)

### 2. Packing SVGs into Spritemap

After creating or modifying SVGs:

```bash
pnpm svg:pack
```

This will:

- Read all `.svg` files from `assets/svg_raw/`
- Combine them into `public/assets/spritemap.svg` as `<symbol>` elements
- Generate symbol IDs from filenames (e.g., `pistol.svg` → `id="pistol"`)

### 3. Unpacking Spritemap (for editing)

To extract all symbols back to individual files:

```bash
pnpm svg:unpack
```

This will:

- Remove all existing files in `assets/svg_raw/`
- Extract each `<symbol>` from `public/assets/spritemap.svg`
- Create individual SVG files with proper structure

## Naming Conventions

### Current Style (Generic Doom)

```
Weapons:     {weapon-name}.svg           (e.g., pistol.svg)
Enemies:     {enemy-name}.svg            (e.g., imp.svg)
Walls:       wall-{variant}.svg          (e.g., wall-base.svg)
```

### Target Style (Candy Apocalypse)

```
Walls:       wall-{color-name}.svg       (e.g., wall-sky-pop.svg)
Enemies:     enemy-{name}-{frame}.svg    (e.g., enemy-imp-walk-1.svg)
Weapons:     weapon-{name}-{frame}.svg   (e.g., weapon-pistol-fire-1.svg)
Effects:     effect-{type}.svg           (e.g., effect-explosion.svg)
Items:       item-{type}.svg             (e.g., item-health-large.svg)
```

## Asset Guidelines

### Color Theme

All assets must follow the "Candy Apocalypse" color palette:

**Primary Palette** (60%):

- Sky Pop: `#00D4FF`
- Cotton Cloud: `#FFB7C5`
- Solar Burst: `#FFE135`
- Toxic Lime: `#32FF00`

**Accent Palette** (30%):

- Rage Orange: `#FF6B35`
- Mystic Violet: `#9B5DE5`
- Cherry Bomb: `#FF0044`

**Outlines**:

- Deep Space: `#1A1A2E` at 3-5px stroke width

### Technical Requirements

- Include `viewBox` attribute
- Keep file sizes minimal
- Avoid embedded raster images
- Use semantic element IDs
- Optimize paths (remove unnecessary points)

### Animation Frames

For animated sprites, create separate files for each frame:

```
imp-walk-1.svg
imp-walk-2.svg
imp-walk-3.svg
imp-attack-1.svg
imp-attack-2.svg
```

## Example SVG Structure

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <!-- Pistol - Candy Apocalypse style -->
  <g id="weapon-body">
    <rect x="16" y="20" width="32" height="24" rx="3"
          fill="#00D4FF" stroke="#1A1A2E" stroke-width="3"/>
    <rect x="20" y="22" width="10" height="20" rx="2"
          fill="#FFFFFF" opacity="0.3"/>
  </g>
</svg>
```

## Scripts

- `pnpm svg:pack` - Pack SVGs into spritemap
- `pnpm svg:unpack` - Unpack spritemap into individual SVGs

## Important Notes

- **Never edit `public/assets/spritemap.svg` directly** - it's auto-generated
- Always work in `assets/svg_raw/` and run `pnpm svg:pack`
- The pack script will overwrite `public/assets/spritemap.svg`
- The unpack script will delete all files in `assets/svg_raw/` before extracting
