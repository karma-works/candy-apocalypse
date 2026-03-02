# SVG Asset Pipeline - Implementation Summary

## ✅ What Was Built

### 1. Directory Structure

```
assets/
  ├── svg_raw/              # Individual SVG source files (source of truth)
  │   ├── barrel.svg
  │   ├── door.svg
  │   ├── imp.svg
  │   ├── shotgun.svg
  │   └── wall_base.svg
  └── README.md             # Asset creation guidelines

public/assets/
  └── spritemap.svg         # Packed sprite atlas (auto-generated)

scripts/
  └── svg-spritemap.mjs     # Pack/unpack script
```

### 2. Scripts Added to package.json

```json
{
  "scripts": {
    "svg:pack": "node scripts/svg-spritemap.mjs pack",
    "svg:unpack": "node scripts/svg-spritemap.mjs unpack"
  }
}
```

### 3. Pack Script Features (`pnpm svg:pack`)

- Reads all `.svg` files from `assets/svg_raw/`
- Generates `<symbol>` elements with IDs from filenames
- Creates `public/assets/spritemap.svg` with Candy Apocalypse header
- Preserves `viewBox` attributes
- Handles missing viewBox (defaults to "0 0 64 64")
- Provides detailed output with warnings

### 4. Unpack Script Features (`pnpm svg:unpack`)

- Extracts all `<symbol>` elements from `public/assets/spritemap.svg`
- Creates individual SVG files in `assets/svg_raw/`
- Removes old files before extraction (clean slate)
- Reconstructs proper SVG structure with `viewBox`

### 5. Documentation

- `assets/README.md`: Comprehensive asset creation guidelines
- `docs/requirements.md`: Updated with complete SVG asset system details
- Inline script help: `node scripts/svg-spritemap.mjs --help`

## 🎯 Workflow

### Creating New Assets

```bash
# 1. Create SVG in assets/svg_raw/
# 2. Follow Candy Apocalypse color theme
# 3. Include viewBox attribute

# 4. Pack into spritemap
pnpm svg:pack

# Output:
# 📦 Packing SVGs into spritemap...
#   ✓ my-weapon.svg → my-weapon
# ✅ Packed 1 SVGs into public/assets/spritemap.svg
```

### Editing Existing Assets

```bash
# Option A: Edit directly in assets/svg_raw/
vim assets/svg_raw/imp.svg
pnpm svg:pack

# Option B: Unpack, edit, repack
pnpm svg:unpack  # Extract from spritemap
vim assets/svg_raw/imp.svg
pnpm svg:pack    # Regenerate spritemap
```

## 📋 Naming Conventions

### Current Files (Generic Doom Style)

- `barrel.svg` → `id="barrel"`
- `door.svg` → `id="door"`
- `imp.svg` → `id="imp"`
- `shotgun.svg` → `id="shotgun"`
- `wall_base.svg` → `id="wall_base"`

### Target Style (Candy Apocalypse)

```
Walls:       wall-{color-name}.svg       (e.g., wall-sky-pop.svg)
Enemies:     enemy-{name}-{frame}.svg    (e.g., enemy-imp-walk-1.svg)
Weapons:     weapon-{name}-{frame}.svg   (e.g., weapon-pistol-fire-1.svg)
Effects:     effect-{type}.svg           (e.g., effect-explosion.svg)
Items:       item-{type}.svg             (e.g., item-health-large.svg)
```

## 🔧 Technical Details

### Symbol ID Generation

- Filename: `My_Weapon.svg`
- Normalized: `my-weapon`
- Symbol ID: `id="my-weapon"`

Rules:

- Convert to lowercase
- Replace non-alphanumeric characters with hyphens
- Remove file extension

### ViewBox Handling

- If SVG has `viewBox="0 0 100 50"` → preserved
- If missing → defaults to `viewBox="0 0 64 64"`
- Warning displayed for missing viewBox

### Generated Spritemap Structure

```xml
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <!-- Candy Apocalypse color theme comment -->

  <symbol id="weapon-name" viewBox="0 0 64 64">
    <!-- SVG content -->
  </symbol>

  <symbol id="enemy-name" viewBox="0 0 64 64">
    <!-- SVG content -->
  </symbol>
</svg>
```

## ⚠️ Important Notes

### Source of Truth

- **`assets/svg_raw/` is the source of truth**
- `public/assets/spritemap.svg` is auto-generated
- Never edit spritemap.svg directly

### Unpack Behavior

- Unpack script **deletes all files** in `assets/svg_raw/` before extraction
- This ensures clean slate and prevents orphaned files
- Always commit changes to `svg_raw/` before unpacking if needed

### Workflow Best Practices

1. Always work in `assets/svg_raw/`
2. Run `pnpm svg:pack` after changes
3. Commit both `assets/svg_raw/` and `public/assets/spritemap.svg`
4. Use unpack only to extract from a known-good spritemap

## 🎨 Next Steps

### Update Existing SVGs to Candy Apocalypse Style

Current SVGs use generic Doom colors. Need to update:

- [ ] Replace colors with Candy Apocalypse palette
- [ ] Add comic-style outlines (3-5px stroke, #1A1A2E)
- [ ] Add halftone patterns for depth
- [ ] Ensure consistent viewBox sizes

### Create Missing Assets

- [ ] All 7 weapons (chainsaw, pistol, shotgun, chaingun, rocket launcher, plasma rifle, BFG)
- [ ] Enemy variants (Happy Imp, Cheerful Zombie, Party Demon, etc.)
- [ ] Effects (explosions, particles, muzzle flash)
- [ ] Items (health, armor, ammo pickups)
- [ ] Environment tiles (floors, ceilings, walls in all color variants)

### Animation Frames

- [ ] Create walk cycles for enemies
- [ ] Create firing animations for weapons
- [ ] Create explosion/effect sequences
- [ ] Document frame naming convention

## 📚 Documentation References

- [Asset Guidelines](../assets/README.md)
- [Product Design - Color Theme](../docs/product_design.md#color-theme-candy-apocalypse)
- [Technical Architecture](../docs/requirements.md#svg-asset-system)
- [SVG Spritemap Structure](../docs/requirements.md#svg-spritemap-structure)
