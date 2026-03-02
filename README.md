# Candy Apocalypse

**"What if DOOM was a Saturday Morning Cartoon?"**

A delightfully chaotic browser game that reimagines the classic FPS as a vibrant, comic-style shooting gallery. Think Angry Birds meets Moorhuhn, wrapped in dark humor and saturated with explosive joy.

## Quick Overview

- **Genre**: First-Person Shooter (FPS) with comic-style visuals
- **Visual Style**: Pure SVG, "Candy Apocalypse" color theme, exaggerated effects
- **Gameplay**: Fast-paced, joyful destruction with instant resume after death
- **Tech Stack**: Pure TypeScript, Vite, HTML5 Canvas, Web Audio API

## The Vision

Every shot feels like a celebration, every explosion is a fireworks display, and every demon is just another opportunity for cartoon carnage.

## Features

- 🎨 **Pure SVG Graphics**: Scalable, crisp vector art following the "Candy Apocalypse" color theme
- 💥 **Exaggerated Effects**: Happy explosions, comic-style particles, speech bubble feedback
- 🎮 **Instant Resume**: Die, laugh, and continue in 2-3 seconds
- 🎵 **Happy Metal Audio**: Chiptune + heavy metal fusion music
- 🎯 **Arcade Action**: Combo system, weapon personality, satisfying gameplay
- 📱 **Responsive**: Play anywhere, scales to any screen size

## Development Status

**Phase 1**: Prototype Engine & Tooling Setup (In Progress)
**Phase 2**: E2E Test Levels (Pending)
**Phase 3**: Vectorization & SVG Generation (Pending)
**Phase 4**: Weapons & Input (Pending)
**Phase 5**: Gameplay & Entities (Pending)
**Phase 6**: Audio & Polish (Pending)
**Phase 7**: CI/CD & Deployment (Pending)
**Phase 8**: Final Polish & Release (Pending)

See [Project Plan](./docs/project_plan.md) for detailed development roadmap.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## Project Structure

```
candy-apocalypse/
├── src/
│   ├── assets/          # SVG spritemap and generated assets
│   ├── core/            # Core game engine
│   ├── input/           # Input handling (keyboard, mouse)
│   ├── audio/           # Audio system (Web Audio API)
│   ├── rendering/       # SVG-based rendering engine
│   ├── game/            # Game logic (entities, AI, physics)
│   └── ui/              # UI/HUD systems
├── docs/
│   ├── product_design.md      # Creative vision & style guide
│   ├── requirements.md        # Technical requirements
│   └── project_plan.md        # Development roadmap
├── tests/
│   ├── unit/            # Unit tests
│   └── e2e/             # End-to-end tests (Playwright)
└── package.json
```

## Key Design Documents

- **[Product Design](./docs/product_design.md)** - Complete creative vision, visual style guide, gameplay philosophy
- **[Requirements](./docs/requirements.md)** - Technical specifications and constraints
- **[Project Plan](./docs/project_plan.md)** - Detailed development phases and implementation strategy

## The "Candy Apocalypse" Aesthetic

A cohesive color theme designed for maximum visual impact:

- **Primary Palette**: Sky Pop (#00D4FF), Cotton Cloud (#FFB7C5), Solar Burst (#FFE135), Toxic Lime (#32FF00)
- **Accent Palette**: Rage Orange (#FF6B35), Mystic Violet (#9B5DE5), Cherry Bomb (#FF0044)
- **Style**: Comic outlines, chibi-cute characters, pop-art environments
- **Effect**: Exaggerated particle systems, speech bubble feedback, instant humor

See [Product Design - Color Theme](./docs/product_design.md#color-theme-candy-apocalypse) for complete specifications.

## Technical Stack

- **Language**: Strict TypeScript (no `any`)
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Testing**: Vitest (unit), Playwright (E2E)
- **Rendering**: doom.ts
- **Audio**: Web Audio API with MOD-style sequencing

## Game Philosophy

**"If it doesn't make the player go 'Haha, nice!', it doesn't belong in the game."**

Death is comedic. Restart is instant. Progress is continuous. Every shot produces happy chaos.

## License

GPL 3

## Resources

- [Product Design Document](./docs/product_design.md)
- [Requirements Document](./docs/requirements.md)
- [Project Plan](./docs/project_plan.md)

---

_"The only thing we have to fear is running out of ammo... and even that's funny."_
