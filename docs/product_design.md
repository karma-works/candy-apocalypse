# Candy Apocalypse - Product Design

## Vision Statement

**"What if DOOM was a Saturday Morning Cartoon?"**

Candy Apocalypse is a delightfully chaotic browser game that reimagines the classic FPS as a vibrant, comic-style shooting gallery. Think Angry Birds meets Moorhuhn, wrapped in dark humor and saturated with explosive joy. Every shot feels like a celebration, every explosion is a fireworks display, and every demon is just another opportunity for cartoon carnage.

---

## Technical Challenges & WAD Strategy

**Decision: Direct WAD Reading (No JSON Conversion)**

We will read WAD files directly at runtime using doom.ts's built-in WAD parser (`src/doom/wad/wad.ts`). No WAD-to-JSON conversion step. This approach:

- ✅ Maximizes performance (no conversion overhead)
- ✅ Simplifies development (fewer moving parts)
- ✅ Ensures data integrity (single source of truth)

---

### The Core Challenge

**Question**: How do we leverage existing WAD files (structural data, sounds, music) while maintaining the project's vision of **pure SVG-based visuals**?

### Analysis

WAD files from classic Doom provide:

1. ✅ **Level Geometry** (vertices, linedefs, sectors, BSP nodes) - Essential structure
2. ✅ **Audio** (MOD-style music, sound effects) - Perfect for our "Happy Metal" aesthetic
3. ❌ **Sprite Graphics** (enemy textures, decorative sprites) - We will NOT use these
4. ❌ **Texture Graphics** (wall textures) - We will NOT use these

### The Solution: Hybrid Approach

**Use WAD for**: Structural elements only
**Don't Use WAD for**: Visual graphics

#### WAD Integration Strategy

```
doom.ts WAD Parser (src/doom/wad/wad.ts)
    ↓
    ├─→ Extract Structural Data
    │   ├─ Vertices
    │   ├─ Linedefs
    │   ├─ Sectors
    │   ├─ Things (enemies, items, decorations)
    │   └─ BSP Nodes (for 3D rendering)
    │
    ├─→ Extract Audio Data
    │   ├─ Music (MUS format sequences)
    │   └─ Sound Effects (PCM samples)
    │
    └─→ Extract Minimal Texture Mapping
        └─ Wall texturing (for some structural elements only)
```

#### What We Keep from WAD

1. **Level Geometry**:
   - Vertices for wall corners
   - Linedefs for walls, doors, textures
   - Sectors for floor/ceiling heights
   - BSP nodes for 3D raycasting (not grid-based)

2. **Audio Assets**:
   - MOD-style music tracks (we'll adapt to our "Happy Metal" style)
   - Sound effects (but generated in our cartoon style)

3. **Interaction Elements**:
   - Switches, doors, keys (logic, not graphics)

#### What We Replace with SVG

1. **All Graphics**:
   - No WAD sprite textures
   - No WAD wall textures
   - All rendered from SVG spritemaps

2. **Enemy Sprites**:
   - Generated as chibi-cute SVG characters
   - Follow "Candy Apocalypse" color theme

3. **Weapon Graphics**:
   - First-person SVG weapons with personality

4. **Environment Graphics**:
   - Pop-art SVG environments
   - Gradient-based lighting effects

### Technical Implementation

#### WAD Parser Setup

Use doom.ts's built-in WAD parser to read Freedoom WAD files at runtime.

```typescript
// Example: What we extract from WAD using doom.ts parser
import { Wad } from "./doom/wad/wad";

const wadBuffer = await fetch("freedoom.wad").then((r) => r.arrayBuffer());
const wad = new Wad(wadBuffer);

// Keep for structure
const vertices = wad.findLump("VERTEXES");
const linedefs = wad.findLump("LINEDEFS");
const sectors = wad.findLump("SECTORS");
const things = wad.findLump("THINGS");
const nodes = wad.findLump("NODES"); // For BSP

// Skip for graphics
// const sprites = wad.findLump('SPRITES') // IGNORE
// const textures = wad.findLump('PNAMES') // IGNORE
```

#### Structural Rendering Engine

Extend doom.ts's Three.js renderer to use SVG spritemaps:

1. Parse WAD structural data using doom.ts's WAD parser
2. Pre-rasterize SVG symbols to OffscreenCanvas at 2x resolution
3. Render using rasterized sprites via Three.js textures
4. Apply "Candy Apocalypse" styling

```typescript
// SVG spritemap loading and rasterization
async function loadSprites() {
  const response = await fetch("/assets/spritemap.svg");
  const svgText = await response.text();
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

  // Pre-rasterize all symbols at 2x resolution
  const sprites = new Map<string, ImageBitmap>();
  const symbols = svgDoc.querySelectorAll("symbol");

  for (const symbol of symbols) {
    const canvas = new OffscreenCanvas(screenWidth * 2, screenHeight * 2);
    const ctx = canvas.getContext("2d")!;
    // Render SVG symbol to canvas
    // Store in cache
    sprites.set(symbol.id, await createImageBitmap(canvas));
  }

  return sprites;
}

// The rendering engine uses rasterized sprites
function renderWall(linedef: Linedef, sprites: Map<string, ImageBitmap>) {
  const sprite = sprites.get("wall-sky-pop");
  // Apply to Three.js texture
  drawSprite(sprite, linedef, {
    colorTheme: "Candy Apocalypse",
    style: "comic-outlines",
  });
}
```

#### Texture Mapping (Optional, Limited)

For elements that need texture mapping from WAD:

```typescript
function renderTexturedWall(
  linedef: Linedef,
  sprites: Map<string, ImageBitmap>,
) {
  const textureName = linedef.texture;
  const sprite =
    sprites.get(`wall-${textureName}`) || sprites.get("wall-sky-pop");
  renderUsingSprite(sprite, linedef);
}
```

**Note**: We'll use SVG symbols for most textures to maintain the pure SVG aesthetic.

#### SVG Asset Management

```typescript
// SVG spritemap is loaded and parsed at game initialization
async function initializeAssets() {
  const spritemap = await loadSVGSpriteMap("/assets/spritemap.svg");
  const rasterized = await preRasterizeAll(spritemap, screenWidth * 2);
  return rasterized;
}

// Existing spritemap.svg is extended with new sprites
// - Weapons (pistol, shotgun, chaingun, etc.)
// - Enemies (happy_imp, cheerful_zombie, etc.)
// - Effects (explosions, particles, etc.)
```

### Benefits of This Approach

✅ **Pure SVG Visuals**: All graphics are vector-based
✅ **Scalability**: Crisp at any resolution
✅ **Style Consistency**: All follow "Candy Apocalypse" theme
✅ **Performance**: Pre-rendered SVGs to Canvas
✅ **Smaller File Size**: No massive texture assets
✅ **Creative Freedom**: We control the art direction completely
✅ **WAD Benefits**: Still use Freedoom's level data, nodes, and audio

### Risks & Mitigations

**Risk**: WAD textures might have certain structures we want

- **Mitigation**: Use 1-2 key textures for floor/ceiling only, or recreate structures using our SVG system

**Risk**: Some WAD levels might not translate well to cartoon style

- **Mitigation**: We'll design levels specifically for the "Candy Apocalypse" aesthetic, rather than porting existing ones

**Risk**: WAD format might have elements we can't use

- **Mitigation**: WAD parser handles any unknown data gracefully; we only use what we need

---

## Core Experience Pillars

### 1. Pure Joyful Destruction

- **Instant Gratification**: Every interaction produces satisfying, exaggerated feedback
- **No Consequences, Only Fun**: Death is comedic, restarts are instant
- **Accessible Violence**: Cartoon gore that makes you laugh, not wince

### 2. Comic Book Aesthetic

- **Bold Outlines**: Thick black borders on everything
- **Halftone Patterns**: Comic dot shading for depth
- **Speech Bubbles**: Enemies taunt, weapons quip, explosions say "KA-BOOM!"
- **Onomatopoeia**: "POW!", "ZAP!", "BANG!" floating text effects

### 3. Happy Colors, Dark Humor

- **Palette**: Cotton candy pinks, electric blues, sunshine yellows, lime greens
- **Contrast**: Adorable enemies doing horrible things
- **Tone**: "Aww, look at that cute imp... _BLAM_... aww, look at those cute giblets"

---

## Visual Style Guide

### Color Theme: "Candy Apocalypse"

A cohesive color system designed for maximum visual impact and joyful chaos. All SVG assets must adhere to this theme.

#### Primary Palette (Use 60%)

| Name             | Hex       | RGB                | Usage                                          |
| ---------------- | --------- | ------------------ | ---------------------------------------------- |
| **Sky Pop**      | `#00D4FF` | rgb(0, 212, 255)   | Main backgrounds, water, plasma effects        |
| **Cotton Cloud** | `#FFB7C5` | rgb(255, 183, 197) | Secondary surfaces, health items, cute accents |
| **Solar Burst**  | `#FFE135` | rgb(255, 225, 53)  | Highlights, energy, explosive elements         |
| **Toxic Lime**   | `#32FF00` | rgb(50, 255, 0)    | Acid, toxic waste, power-ups                   |

#### Accent Palette (Use 30%)

| Name              | Hex       | RGB               | Usage                                        |
| ----------------- | --------- | ----------------- | -------------------------------------------- |
| **Rage Orange**   | `#FF6B35` | rgb(255, 107, 53) | Fire, danger indicators, aggressive elements |
| **Mystic Violet** | `#9B5DE5` | rgb(155, 93, 229) | Magic, portals, special items                |
| **Cherry Bomb**   | `#FF0044` | rgb(255, 0, 68)   | Blood, damage, intense action                |
| **Deep Space**    | `#1A1A2E` | rgb(26, 26, 46)   | Outlines, shadows, contrast                  |

#### Neutral Palette (Use 10%)

| Name            | Hex       | RGB                | Usage                             |
| --------------- | --------- | ------------------ | --------------------------------- |
| **Pure Light**  | `#FFFFFF` | rgb(255, 255, 255) | Highlights, sparks, pure energy   |
| **Soft Shadow** | `#2D2D44` | rgb(45, 45, 68)    | Recessed areas, depth             |
| **Warm Gray**   | `#4A4A5C` | rgb(74, 74, 92)    | Metal, stone, industrial elements |

#### Gradient Presets (Use for effects)

| Gradient Name    | Stops                                         | Usage                            |
| ---------------- | --------------------------------------------- | -------------------------------- |
| **Happy Fire**   | `#FF0044` → `#FF6B35` → `#FFE135` → `#FFFFFF` | Explosions, flames, muzzle flash |
| **Plasma Beam**  | `#9B5DE5` → `#00D4FF` → `#FFFFFF`             | Energy weapons, sci-fi effects   |
| **Toxic Goo**    | `#32FF00` → `#9B5DE5` → `#1A1A2E`             | Acid damage, poisonous areas     |
| **Sunset Doom**  | `#FF6B35` → `#FFB7C5` → `#9B5DE5`             | Sky boxes, atmospheric lighting  |
| **Candy Swirl**  | `#FFB7C5` → `#00D4FF` → `#32FF00` → `#FFE135` | Power-ups, bonus items           |
| **Comic Shadow** | `#1A1A2E` → `#2D2D44` (halftone)              | Character shadows, depth         |

#### Color Application Rules

1. **Outlines**: Always use `#1A1A2E` (Deep Space) at 3-5px stroke width
2. **Highlights**: Add `#FFFFFF` (Pure Light) at 30-50% opacity on top edges
3. **Shadows**: Use halftone patterns with `#1A1A2E` dots, not solid shadows
4. **Color Blocking**: Large areas use Primary Palette, details use Accent
5. **Contrast**: Adjacent colors must have 40%+ luminance difference
6. **Saturation**: All colors stay at 80-100% saturation (no muted tones)

#### Asset-Specific Color Guidelines

**Weapons**: Primary base + Accent details + White highlights

- Example: Rocket Launcher = Sky Pop body + Rage Orange accents + Solar Burst highlights

**Enemies**: Primary base + Accent features + Deep Space outlines

- Example: Happy Imp = Cotton Cloud skin + Cherry Bomb eyes + Deep Space outline

**Environments**: Primary surfaces + Accent props + Neutral architecture

- Example: Hell corridor = Deep Space walls + Toxic Lime lava + Sky Pop crystals

**Effects**: Gradient presets only, no solid colors

- Example: Explosion = Happy Fire gradient with white core

### Art Style Specifications

#### Characters & Enemies

- **Style**: Chibi-cute proportions (big heads, small bodies)
- **Expressions**: Exaggerated faces (anime-style eyes, comical rage)
- **Animation**: Bouncy, squash-and-stretch physics
- **Death**: Disney-style poofs with stars, hearts, or skulls

#### Weapons

- **Style**: Oversized, cartoon proportions
- **Personality**: Weapons have faces or character elements
- **Muzzle Flash**: Giant, stylized starbursts
- **Recoil**: Comically exaggerated kickback

#### Environments

- **Style**: Pop-art poster aesthetic
- **Shadows**: Hard-edged comic shadows with halftone gradients
- **Lighting**: Bright, saturated, no gloom
- **Hell**: Candy-colored nightmare - pink lava, purple skies, green flames

### Art Style Specifications

#### Characters & Enemies

- **Style**: Chibi-cute proportions (big heads, small bodies)
- **Expressions**: Exaggerated faces (anime-style eyes, comical rage)
- **Animation**: Bouncy, squash-and-stretch physics
- **Death**: Disney-style poofs with stars, hearts, or skulls

#### Weapons

- **Style**: Oversized, cartoon proportions
- **Personality**: Weapons have faces or character elements
- **Muzzle Flash**: Giant, stylized starbursts
- **Recoil**: Comically exaggerated kickback

#### Environments

- **Style**: Pop-art poster aesthetic
- **Shadows**: Hard-edged comic shadows with halftone gradients
- **Lighting**: Bright, saturated, no gloom
- **Hell**: Candy-colored nightmare - pink lava, purple skies, green flames

---

## Gameplay Design

### Game Modes

#### 1. Story Mode: "Happy Hell Day"

- **Premise**: It's the demons' annual "Hell Day" party, and you're the uninvited guest
- **Structure**: 5 themed episodes × 4 levels each = 20 levels
- **Progression**: Unlock new weapons, costumes, and bonus modes

#### 2. Arcade Mode: "Splatter Party"

- **Premise**: Endless waves, beat your high score
- **Twist**: Combo multipliers for creative kills
- **Leaderboards**: Daily, weekly, all-time

#### 3. Challenge Mode: "Daily Doom"

- **Premise**: One new challenge every day
- **Variety**: Speed runs, weapon restrictions, survival, target practice
- **Rewards**: Cosmetic unlocks

#### 4. Sandbox Mode: "Playground of Doom"

- **Premise**: Spawn enemies, experiment with weapons, no objectives
- **Features**: Slow-motion, spawn controls, weapon selection
- **Purpose**: Pure fun, screenshot mode

### Core Mechanics

#### Death & Resume System

**Philosophy**: Death should be instant, comedic, and immediately resumable. No frustration, no reloads, just pure "oops, fun time continues."

**Implementation**:

```
PLAYER DIES
    ↓
   [0.2s] COMIC REACTION
    ↓
   AUTO-RESUME
    ↓
   SAME LEVEL, MINOR DIFFICULTY BOOST
```

**Death Response Flow**:

1. **Immediate Death**:
   - Player sprite vanishes in comic "poof" effect
   - Screen flashes with happy "Oops!" or "So close!" message
   - Death sound: Cartoonish, comedic (no disturbing screams)

2. **Auto-Resume**:
   - Game resumes in 2-3 seconds
   - Player returns to same position
   - Weapon carried over (or auto-switch to last weapon)
   - Minor difficulty adjustment (optional, can be disabled)

3. **No Save State Required**:
   - No manual checkpoint saving
   - No frustration of "where was I?"
   - Session continuity is automatic

4. **Easy Restart**:
   - Press R to restart if wanted
   - Restart has comic "razor" animation
   - "Are you sure?" has funny confirmation

**Visual Death Effects**:

```
1. Body Poof: Character turns into confetti/stars
2. Explosion: Comic explosion with speech bubble
3. Screen Shake: Bouncy, playful shake (not dizzying)
4. Floating Text: "WRONG WAY!", "TRY AGAIN!", "LOL"
5. Sound: "Poof!" or "Bam!" with echo
```

**Implementation Details**:

```typescript
// Death Handler
function onPlayerDeath() {
  // 1. Play comedic death animation
  playDeathAnimation("poof");

  // 2. Show floating "WRONG WAY!" text
  showFloatingText("WRONG WAY!", "comic", 2);

  // 3. 2-second delay
  await sleep(2000);

  // 4. Auto-resume
  resumeGame();
}

// Resume Handler
function resumeGame() {
  // Restore player position
  player.position = startPosition;
  player.health = 100;
  player.currentWeapon = previousWeapon;

  // Restore enemies
  respawnEnemiesInRadius(5);

  // Play "Ok, let's try again" sound
  playSound("resume");

  // Return to gameplay loop
  resumeGameLoop();
}
```

**Difficulty Adjustment**:

Optional feature that can be enabled/disabled:

```typescript
const difficultyAdjustments = {
  easy: 1.0, // Default
  medium: 0.9, // Slight reduction
  hard: 0.8, // Moderate reduction
  expert: 0.7, // Significant reduction
};

function adjustDifficultyOnDeath() {
  const reduction = difficultyAdjustments[currentMode];
  enemies.forEach((enemy) => {
    enemy.speed *= reduction;
  });
}
```

**UX Considerations**:

- ✅ No "Game Over" screen (just instant continuation)
- ✅ No manual "Continue" button (automatic)
- ✅ No save files needed (session-based)
- ✅ No frustration of losing progress
- ✅ Encourages "just one more try" mindset

**Why This Matters**:

- **Player Flow**: Death becomes fun, not frustrating
- **Session Length**: Encourages shorter, more frequent play sessions
- **Viral Potential**: Players share their "funny deaths" more easily
- **Core Loop**: Restart is instant, keeps momentum high

---

#### Movement

- **Speed**: Fast, fluid, arcade-style movement
- **Double Jump**: With cartoon "cloud puff" effect
- **Dash**: Quick burst with motion blur trails
- **Wall Slide**: Sliding leaves cute scratch marks

#### Combat Loop

```
SPOT → LOCK → POP → CELEBRATE → REPEAT
  ↓      ↓      ↓        ↓
Target  Aim    Fire    Combo+
        Assist Effect  Score+
```

#### Weapon Design Philosophy

Each weapon should feel like a different "character" with unique personality:

| Weapon              | Personality                  | Visual Gimmick             | Happy Effect                   |
| ------------------- | ---------------------------- | -------------------------- | ------------------------------ |
| **Chainsaw**        | Overly enthusiastic handyman | Cartoon teeth on chain     | Confetti spray on contact      |
| **Pistol**          | Eager rookie                 | Bounces with excitement    | "PEW!" text on shot            |
| **Shotgun**         | Grumpy grandpa               | Complains when fired       | Wide spray of stars            |
| \*_Chaingun_        | Hyperactive kid              | Spins faster over time     | Bullet rain with rainbow trail |
| **Rocket Launcher** | Dramatic opera singer        | Slow-motion projectile cam | Fireworks explosion            |
| **Plasma Rifle**    | Sci-fi nerd                  | Glows with excitement      | Electric arcs in happy colors  |
| **BFG 9000**        | Ultimate party animal        | Screen shake, flash        | Entire screen becomes disco    |

---

## Exaggerated Effects System

### Explosion Hierarchy

#### Level 1: "Pop"

- Small enemies, breakables
- Effect: 5-10 star/sparkle particles
- Sound: Cartoon "pop"
- Duration: 0.2 seconds

#### Level 2: "Bang"

- Medium enemies, barrels
- Effect: 20-30 particles + shockwave ring
- Sound: "BANG!" text appears
- Duration: 0.5 seconds

#### Level 3: "Ka-Boom"

- Large enemies, rocket direct hit
- Effect: 50+ particles + screen flash + debris
- Sound: "KA-BOOM!" text + bass hit
- Duration: 1.0 seconds

#### Level 4: "MEGA BLAST"

- BFG, chain reactions, boss kills
- Effect: Full screen flash + particle storm + slow-mo
- Sound: "MEGA BLAST!" + cheering
- Duration: 2.0 seconds + replay in slow-mo

### Particle Effects

#### Types

- **Confetti**: Colorful paper squares
- **Stars**: 5-pointed, spinning
- **Hearts**: For "loving the chaos"
- **Skulls**: Small, cute, bouncing
- **Fire**: Gradient flames with happy faces
- **Smoke**: Puffy clouds with faces
- **Lightning**: Electric zig-zags in neon colors

#### Behavior

- **Bounce**: Particles bounce off surfaces with "boing" sounds
- **Gravity**: Low, floaty gravity for "hang time"
- **Fade**: Sparkle fade-out, not boring transparency fade
- **Sounds**: Each particle type has unique micro-sounds

---

## Audio Design Philosophy

### Music Style: "Happy Metal"

- **Genre**: Chiptune + Heavy Metal fusion
- **Tempo**: 140-180 BPM
- **Instruments**: 8-bit synths + distorted guitars + circus organs
- **Vibe**: Birthday party in a warzone

### Sound Effects Categories

#### Weapon Sounds

- **Not realistic**: Exaggerated, cartoon-style
- **Layered**: Multiple sounds per shot
- **Dynamic**: Changes based on combo/combo level

#### Enemy Sounds

- **Cute vocalizations**: "Hey!", "Ouch!", "Why?!"
- **Cartoonish pain**: Goofy yelps, not disturbing screams
- **Taunts**: Funny threats in speech bubbles

#### UI Sounds

- **Positive**: Chimes, bells, celebratory tones
- **Negative**: Cartoon "womp womp", not harsh buzzers
- **Menu**: Bouncy, playful clicks

---

## UI/UX Design

### HUD Elements

```
┌─────────────────────────────────────────────────┐
│  😈 666  x3  💀 COMBO MASTER! 💀        ⭐⭐⭐   │
│                                                 │
│                                                 │
│                    GAME VIEW                    │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│     🎯                                          │
│                                                 │
│  ❤️❤️❤️❤️❤️  ████████  🔫 CHAINGUN            │
│   HEALTH     ARMOR         WEAPON               │
│                                                 │
│  🔥 50/200   💣 25        ⚡ 500               │
│   BULLETS    ROCKETS       CELLS                │
└─────────────────────────────────────────────────┘
```

### Menu Design

#### Main Menu

- **Background**: Animated scene of demons having a party
- **Title**: Bouncy, 3D comic text with shadow
- **Buttons**: Look like comic speech bubbles
- **Music**: Menu theme with catchy hook

#### Pause Menu

- **Style**: "PAUSED" stamp appears on screen
- **Background**: Game continues in slow-motion behind
- **Options**: Resume, Restart, Settings, Quit (with funny confirm)

### Feedback Systems

#### Combo System

```
1 kill = "Nice!"
2 kills = "Double Trouble!"
3 kills = "Triple Threat!"
5 kills = "MURDER PARTY!"
10 kills = "DEMOLITION DERBY!"
20 kills = "CHAOS EMPEROR!"
50 kills = "DOOM ETERNAL...LY HAPPY!"
```

#### Score Pop-ups

- **Style**: Comic speech bubbles
- **Animation**: Float up, bounce, fade
- **Colors**: Gold for base, rainbow for combos
- **Size**: Grows with score value

---

## Enemy Design

### Enemy Categories

#### Tier 1: "Cannon Fodder"

| Enemy               | Appearance                         | Behavior                  | Death                 |
| ------------------- | ---------------------------------- | ------------------------- | --------------------- |
| **Happy Imp**       | Tiny red gremlin with party hat    | Throws confetti fireballs | Poofs into confetti   |
| **Cheerful Zombie** | Green guy with "I ❤️ BRAINS" shirt | Shambles with enthusiasm  | Falls apart like Lego |
| **Party Demon**     | Pink creature with balloons        | Floats toward player      | Pops like balloon     |

#### Tier 2: "Troublemakers"

| Enemy                | Appearance                   | Behavior           | Death                      |
| -------------------- | ---------------------------- | ------------------ | -------------------------- |
| **Disco Cacodemon**  | Floating orb with sunglasses | Shoots laser beams | Mirror ball explosion      |
| **Skateboard Baron** | Flying skull on skateboard   | Dive-bomb attacks  | Wipes out dramatically     |
| **DJ Mancubus**      | Fat demon with speakers      | Sound wave attacks | Speaker feedback explosion |

#### Tier 3: "Bosses"

| Boss                 | Theme                    | Gimmick                          | Defeat Animation              |
| -------------------- | ------------------------ | -------------------------------- | ----------------------------- |
| **The Birthday Boy** | Giant imp in party hat   | Summons minions, cake attacks    | Blows out candles, fades away |
| **Disco Inferno**    | Giant dancing demon      | Dance-off battle, rhythm attacks | Last dance, slow fade         |
| **The Doom Clown**   | Final boss, circus theme | Circus attacks, balloon animals  | Gets sucked into tiny car     |

---

## Level Design Philosophy

### Episode Themes

1. **"Welcome to the Party"** (Tutorial + Easy)
   - Theme: Demon birthday party
   - Colors: Pastel pinks, baby blues
   - Enemies: Tier 1 only

2. **"Disco Inferno"** (Medium)
   - Theme: Hell's hottest nightclub
   - Colors: Neon, black lights
   - Enemies: Tier 1 + 2

3. **"Carnival of Chaos"** (Medium-Hard)
   - Theme: Demonic amusement park
   - Colors: Cotton candy colors
   - Enemies: All tiers

4. **"Toy Store of Terror"** (Hard)
   - Theme: Giant toy store
   - Colors: Primary colors
   - Enemies: All tiers + mini-bosses

5. **"The Final Show"** (Expert)
   - Theme: Demon TV studio
   - Colors: Technicolor overload
   - Enemies: All tiers + bosses

### Level Structure

Each level follows this flow:

```
ENTRANCE → COMBAT AREAS → MINI-CHALLENGE → BOSS/EXIT
    ↓           ↓              ↓              ↓
  Intro      Escalating    Optional      Big Finish
  Cutscene   Intensity     Secret         Celebration
```

### Secrets & Collectibles

- **Happy Souls**: Cute floating souls that unlock cosmetics
- **Comic Pages**: Collect to unlock concept art
- **Weapon Skins**: Hidden in each level
- **Joke Secrets**: Hidden rooms with Easter eggs

---

## Progression & Unlocks

### Player Progression

#### Levels

- **XP System**: Earn XP from kills, combos, secrets
- **Rank Names**:
  - Level 1-5: Party Crasher
  - Level 6-10: Fun Ruiner
  - Level 11-15: Chaos Agent
  - Level 16-20: Doom Influencer
  - Level 21-25: Hell's Favorite
  - Level 26-30: THE LIFE OF THE PARTY

#### Unlockables

**Weapon Skins**:

- 🌈 Rainbow mode
- 🎨 Paint splatter
- 💖 Pink princess
- 🤖 Toy plastic
- 🏆 Golden god

**Player Costumes**:

- 🤡 Party clown suit
- 🎸 Rock star outfit
- 🦸 Superhero costume
- 👽 Alien tourist
- 🎅 Santa Doom (seasonal)

**Emotes**:

- 💃 Victory dance
- 🎤 Air guitar
- 💪 Flex
- 🤳 Selfie
- 🎉 Confetti toss

---

## Social & Viral Features

### Shareable Moments

- **Kill of the Game**: Best kill auto-recorded
- **Combo Clips**: High combos auto-saved
- **Funny Deaths**: Embarrassing deaths saved
- **Screenshot Mode**: Pause, pose, add filters

### Social Integration

- **Daily Challenges**: Share results
- **Leaderboards**: Friends & global
- **Achievement Brags**: Auto-generated share cards
- **Replay Theater**: Watch and share replays

---

## Technical Requirements

### Performance Targets

- **Frame Rate**: 30 FPS minimum
- **Load Time**: < 3 seconds initial, < 1 second level transitions
- **Responsiveness**: < 16ms input lag
- **Particle Limit**: 1000+ simultaneous particles

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile: Touch controls, same experience

### Accessibility

- **Colorblind Modes**: Multiple palettes
- **Screen Shake**: Adjustable intensity
- **Sound Cues**: Visual alternatives
- **Difficulty Modes**: Story → Normal → Hard → ULTRA VIOLENCE (classic)

---

## Monetization (Optional/Future)

### Cosmetic Only (No Pay-to-Win)

- **Battle Pass**: Seasonal cosmetic unlocks
- **Costume Store**: Buy specific skins
- **Weapon Packs**: Themed weapon skins
- **No Ads**: Completely ad-free experience

---

## Success Metrics

### Player Satisfaction

- **Session Length**: Target 15-30 minutes
- **Return Rate**: 40%+ next-day return
- **Completion Rate**: 60%+ finish story mode
- **Share Rate**: 10%+ share content

### Fun Factor Indicators

- **Combo Engagement**: Players actively chase combos
- **Weapon Variety**: Even usage across weapons
- **Secret Discovery**: High secret find rate
- **Replay Value**: Levels replayed for better scores

---

## Conclusion

Candy Apocalypse is not just a Doom clone—it's a celebration of chaos, a party in game form. Every element, from the cotton-candy colors to the confetti explosions, is designed to make players smile while they paint the walls with demon confetti.

**Remember**: If it doesn't make the player go "Haha, nice!", it doesn't belong in the game.

---

_"The only thing we have to fear is running out of ammo... and even that's funny."_ - Design Philosophy
