# WAD Logic to SVG Mapping Hooks

Candy Apocalypse uses the structural data from `freedoom.wad` to trigger visual and behavioral events. This document specifies exactly how classic WAD mechanics map to our SVG-based sprite and texture system, fulfilling the goal to completely divorce our visual aesthetic from standard Doom textures.

## 1. Wall Textures (Sidedefs)

Doom maps specify wall textures via sidedef references to a `TEXTURE1`/`TEXTURE2` lump. We discard the original graphic and map the *name* functionally based on its role over a default fallback scheme.

### Baseline Mapping
- **Default Wall:** If a sidedef texture name is a generic wall (e.g., `STARTAN`, `BROWN1`), it is mapped to a designated environment color tile in the current level.
  - **Hook:** `engine.renderSidedef() -> fallback(envTheme.defaultWall)`
  - **SVG:** `wall-base-[color].svg`

### Contextual Environment Mapping Rules
- **Sky:** Any linedef utilizing the `F_SKY1` texture or an equivalent sky hack will render a flat colored gradient box or parallax vector texture.
  - **SVG:** `environment-sky-gradient.svg`
- **Liquid/Hazard Walls:** Walls containing `SLIME`, `LAVA`, or `NUKAGE` texturing or placed near hazard sectors map to matching hazard colors.
  - **SVG:** `wall-toxic-lime.svg` or `wall-rage-orange.svg`

## 2. Interactive Geometry (Linedef Types)

Doom defines interaction through linedef types (e.g., Type 1 = DR Door, Type 11 = S1 Switch Exit). We map these types to specific visual states.

### Doors (D1, DR, SR)
- **Behavior:** Sector ceiling height raises and lowers.
- **Visual Hook:** Any sidedef belonging to an active door linedef is mapped to a cartoon door SVG.
- **SVG States:**
  - Closed: `item-door-closed.svg`
  - Opening/Open: `item-door-open.svg` (Or simple vertical scaling of the closed door)

### Switches (S1, SR)
- **Behavior:** Linedef triggers a remote action (door, lift, platform).
- **Visual Hook:** Classic Doom changes the switch texture (e.g., `SW1BRCOM` to `SW2BRCOM`). We listen to the sector action state change.
- **SVG States:**
  - Default/Unactivated: `item-switch-off.svg`
  - Activated: `item-switch-on.svg`
- **Audio Hook:** Trigger a comedy sound, e.g., "Click!" voice or "Boing!"

### Lifts and Platforms (W1, WR)
- **Behavior:** Floor height moves up and down.
- **Visual Hook:** Lower unpegged textures on the moving sector map to an "elevator" or "striped hazard warning" vector SVG.
- **SVG States:** `wall-lift-hazard.svg`

## 3. Items and Entities (Things)

Things are defined via numerical Doom IDs. We map these explicitly to our Candy Apocalypse cast.

### Powerups and Items
| Doom Thing ID | Original Item | Candy Apocalypse SVG | Comedy Hook / Effect |
|---------------|---------------|----------------------|----------------------|
| 2011          | Stimpack      | `item-avocado-toast.svg` | "Millennial power-up" text |
| 2012          | Medikit       | `item-energy-drink.svg` | "MORE caffeine!" text |
| 2014          | Health Bonus  | `item-participation-trophy.svg` | "+10 Score!" |
| 2015          | Armor Bonus   | `item-loyalty-card.svg` | "15% off... nothing" |
| 2045          | Invulnerability| `item-plot-armor.svg` | Sparkle trail, 5s invincible |

### Entities and Enemies
| Doom Thing ID | Original Demon | Candy Apocalypse SVG | Black Humor Behaviors |
|---------------|----------------|----------------------|-----------------------|
| 3001 | Imp | `enemy-business-imp.svg` | Throws spreadsheets. Yells "Quarterly reports!" |
| 3004 | Zombieman | `enemy-suicide-sheep.svg` | "Baaaa-byeee!" before detonating wool confetti |
| 9 | Shotgun Guy | `enemy-karen-demon.svg` | Demands manager. Yells "I will speak to Satan!" |
| 58 | Spectre/Demon | `enemy-pigeon-possessed.svg` | Flies erratically, pecks at player. Explodes into feathers |

### Weapon Pickups
When a player interacts with a weapon pickup entity (e.g., ID 2001 for Shotgun), the pickup graphic uses a stylized, oversized version of the first-person weapon SVG.
- **SVG Hook:** Render `weapon-[pistol/shotgun/etc]-pickup.svg` on the ground.

## 4. Implementation Strategy (Contingency)
While the final SVGs are being developed, the engine will use **colored solid primitives** mapped via an intermediate dictionary.
- Map: `item-switch-off.svg` -> `Solid Red Rectangle`
- Map: `item-switch-on.svg` -> `Solid Green Rectangle`
- Map: `enemy-business-imp.svg` -> `Pink Triangle`

This decouples the visual art timeline from the engine mapping timeline.
