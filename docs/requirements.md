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

## Core Mechanics & Scope (Full Game)

- **Performance Target**: The game MUST maintain a consistent framerate of at least **30 FPS**. If parsing and rendering SVGs directly via Canvas `drawImage` or DOM manipulation proves too slow, we will implement performance optimizations such as off-screen pre-rendering (rasterizing) of SVGs to `OffscreenCanvas` or standard image buffers during the loading phase.
- **Modern Reimagined Visuals**:
  - "Candy Apocalpyse" is a modern, reimagined DOOM.
  - Freely scalable screen size, uniformly crisp and sharp vector graphics.
  - Modern technology for lighting (Shaders).
  - Implementation of modern fire and water effects in the environment.
- **Technical Foundation**: Use **`doom.ts`** (Thomas Chandelle) as reference implementation. A TypeScript port of DOOM with Three.js renderer, demonstrating adapting classic DOOM logic to a browser-based 3D renderer. See [GitLab](https://gitlab.com/thomas.chandelle/doom.ts).
- **WAD Parsing**: Reference doom.ts's WAD handling implementation. For Candy Apocalypse, we'll use Freedoom WAD files to extract structural level data (geometry, sectors, BSP nodes) while replacing all graphics with our SVG-based rendering.
- **Audio Architecture**: doom.ts uses **`smplr`** library - a TypeScript Web Audio API wrapper for sampled instrument playback. It provides high-quality audio samples (pianos, marimbas, guitars, drums) with effects support (reverb). We'll adapt this architecture for our "Happy Metal" chiptune + heavy metal fusion audio style.
- **License**: doom.ts is GPL v3-licensed. Our project will be GPL-3.0 compliant. We'll use doom.ts as reference and adapt its logic while maintaining GPL-3.0 compliance.
- **Features**:
  - Navigation of 3D non-grid environments.
  - Doors and Keys.
  - Exit mechanics.
  - Enemies and shooting mechanics.
  - Multiple weapons (see Weapons section below).
  - **Mouse Support**: Full mouse control for looking/aiming and interaction.
- **Assets**: Upfront AI-generated SVGs for graphics. Single SVG spritemap with `<symbol>` elements. We will implement a Node.js CLI utility script to pack individual `SVG` files into the master symbol file.

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