# Creating GLB Levels for doom.ts

You have three options to create GLB levels for your Babylon.js game:

## Option 1: Use the Procedural Generator (Easiest)

The game already includes a procedural level generator. No GLB file needed!

When you run `pnpm dev`, the game automatically creates a test level if no GLB file is found.

To export it to GLB (optional):

1. Open browser console
2. Run:

```javascript
import { LevelGenerator } from "./engine/LevelGenerator";
const generator = new LevelGenerator(scene);
generator.createSimpleLevel();
await generator.exportToGLB("test-level.glb");
```

## Option 2: Create in Blender (Recommended)

### Step 1: Install Blender

Download from: https://www.blender.org/download/

### Step 2: Create Basic Level

1. Open Blender
2. Delete default cube (X key)
3. Add floor:
   - Shift+A → Mesh → Plane
   - Scale to 20x20 (S key, then type 20, 1, 20)
   - Move to Z=-0.01 (G key, then Z=-0.01)
4. Add walls:
   - Shift+A → Mesh → Cube
   - Scale to wall size (S key, then dimensions)
   - Position around floor edges
5. Add collision:
   - Select mesh
   - Go to Object Properties → Physics → Enable Collision

### Step 3: Create Materials

1. Go to Shading tab
2. Create new material
3. Set base color (e.g., gray for concrete, brown for brick)
4. Assign to meshes

### Step 4: Export

1. File → Export → glTF 2.0 (.glb)
2. Save to `public/assets/levels/test-level.glb`

### Step 5: Update Manifest

Edit `public/assets/levels/manifest.json`:

```json
{
  "levels": {
    "test-level": {
      "name": "Test Level",
      "model": "/assets/levels/test-level.glb",
      "spawns": [
        { "type": "player", "position": [0, 1.7, 0] },
        { "type": "enemy-demon", "position": [5, 0, 5] }
      ]
    }
  }
}
```

## Option 3: Download Free GLB

### Free Model Sites:

- https://sketchfab.com/features/gltf (search for "doom", "fps level", "scifi corridor")
- https://quaternius.com/ (free low-poly models)
- https://kenney.nl/assets (free asset packs)

### Convert to GLB:

1. Download any 3D model format (.obj, .fbx, .gltf)
2. Import to Blender
3. Export as GLB

## Simple Test Level Template

Here's a minimal Blender setup for testing:

```
Floor: 20m x 20m plane at Y=0
Walls: 4 cubes forming perimeter
  - North wall: (0, 1.5, 10) size: (20, 3, 0.5)
  - South wall: (0, 1.5, -10) size: (20, 3, 0.5)
  - East wall: (10, 1.5, 0) size: (0.5, 3, 20)
  - West wall: (-10, 1.5, 0) size: (0.5, 3, 20)
Collision: Enabled on all meshes
```

## Testing Your Level

1. Place GLB in `public/assets/levels/`
2. Update manifest.json
3. Run `pnpm dev`
4. Game will load your GLB level
5. Check console for errors
6. Test collision (walk into walls)

## Tips

### Performance:

- Keep poly count low (<10k triangles for test level)
- Use simple materials (no PBR for walls/floors)
- Enable "Combine Meshes" in Blender export

### Collision:

- Must enable collision on all walkable/blocking surfaces
- Player ellipsoid: (0.5, 1.7, 0.5)
- Player eye height: 1.7m

### Scale:

- 1 Blender unit = 1 meter
- Player height: ~1.8m
- Door height: ~2.5m
- Corridor width: ~3m minimum

## Example: Creating "E1M1" Style Level

### Layout:

```
+------------------+
|                  |
|  Start Room      |  8m x 8m
|                  |
+--------+  +------+
         |  |
         |  | Corridor 3m x 12m
         |  |
+--------+  +------+
|                  |
|  Main Room       |  12m x 12m
|                  |
+------------------+
```

### Blender Steps:

1. Create floor plane (scale to layout)
2. Add walls (extrude edges)
3. Add doorways (boolean difference)
4. Add details (pillars, crates)
5. Enable collision on all
6. Export as GLB

## Troubleshooting

**Problem:** Level doesn't load

- Check console for 404 errors
- Verify GLB path in manifest.json
- Check browser Network tab

**Problem:** Player falls through floor

- Ensure collision enabled on floor mesh
- Check floor Y position (should be 0 or slightly below)

**Problem:** Player can't move

- Check that pointer is locked (click canvas)
- Verify collision is enabled but not blocking player spawn point

**Problem:** Low FPS

- Reduce mesh complexity
- Combine static meshes
- Use simpler materials

## Next Steps

1. Create basic test level in Blender
2. Export to GLB
3. Place in `public/assets/levels/`
4. Update manifest with spawn points
5. Test in game
6. Iterate on design

Good luck! 🎮
