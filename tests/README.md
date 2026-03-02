# Candy Apocalypse Test Suite

## Quick Start

### 1. Install Dependencies

```bash
# Install testing dependencies
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @types/node
pnpm add -D @playwright/test

# Install Playwright browsers
pnpm exec playwright install chromium
```

### 2. Run Tests

```bash
# Run unit tests
pnpm test:unit

# Run E2E tests (requires dev server)
pnpm dev  # In one terminal
pnpm test:e2e  # In another terminal
```

## Test Structure

```
tests/
├── unit/              # Fast unit tests (< 10s)
│   ├── wad/          # WAD parser tests
│   ├── game/         # Game logic tests
│   └── audio/        # Audio system tests
│
├── integration/       # Integration tests (< 1m)
│
├── e2e/              # Visual E2E tests (< 5m)
│   ├── baseline-rendering.test.ts
│   └── input-controls.test.ts
│
└── fixtures/         # Test data
    ├── wads/         # Test WAD files
    └── svg/          # Test SVG files
```

## Running Tests

### Unit Tests

```bash
pnpm test:unit              # Run once
pnpm test:unit:watch        # Watch mode
pnpm test:unit:ui           # UI mode
```

### E2E Tests

```bash
# Start dev server first
pnpm dev

# Run E2E tests
pnpm test:e2e

# Update visual baselines
pnpm test:e2e:update-snapshots
```

## Test Commands

| Command                          | Description      | Time  |
| -------------------------------- | ---------------- | ----- |
| `pnpm test:unit`                 | Run unit tests   | < 10s |
| `pnpm test:unit:watch`           | Watch mode       | -     |
| `pnpm test:unit:ui`              | UI mode          | -     |
| `pnpm test:e2e`                  | Run E2E tests    | < 5m  |
| `pnpm test:e2e:ui`               | UI mode          | -     |
| `pnpm test:e2e:debug`            | Debug mode       | -     |
| `pnpm test:e2e:update-snapshots` | Update baselines | < 5m  |

## What We Test

### Unit Tests (Tier 1)

- ✅ WAD parsing logic
- ✅ Game state (health, ammo, weapons)
- ✅ Enemy AI state machines
- ✅ Collision detection
- ✅ Audio system (MUS format)

### E2E Tests (Tier 3)

- ✅ Canvas/WebGL rendering
- ✅ Visual regression (screenshots)
- ✅ Performance (30+ FPS)
- ✅ User interactions
- ✅ Responsive scaling

## Visual Regression Testing

### Baseline Screenshots

First run will create baselines:

```bash
pnpm test:e2e
# Tests will fail and create screenshots in tests/e2e/screenshots/
```

Update baselines after intentional changes:

```bash
pnpm test:e2e:update-snapshots
```

### Tolerance Settings

We use tolerant comparison (not pixel-perfect):

```typescript
{
  maxDiffPixels: 100,          // Allow 100 different pixels
  maxDiffPixelRatio: 0.01,     // 1% difference allowed
  threshold: 0.2,              // Perceptual threshold
}
```

## Performance Testing

### Requirements

- **Minimum FPS**: 30
- **Maximum frame time**: < 50ms
- **Average frame time**: < 33ms

### How We Measure

```typescript
test("should maintain 30+ FPS", async ({ page }) => {
  const avgFps = await measureFPS(page, 60); // 60 frames
  expect(avgFps).toBeGreaterThanOrEqual(30);
});
```

## Test Fixtures

### WAD Files

Create minimal test WADs:

```
tests/fixtures/wads/
├── single-cube.wad        # Basic room
├── two-sectors.wad        # Height test
└── enemy-spawn.wad        # Enemy test
```

### SVG Files

Test spritemap:

```
tests/fixtures/svg/
└── test-spritemap.svg
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from "vitest";

describe("Player", () => {
  it("should take damage", () => {
    const player = { health: 100 };
    player.takeDamage(10);
    expect(player.health).toBe(90);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from "@playwright/test";

test("should render game", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("#game-canvas");

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot("baseline.png");
});
```

## Troubleshooting

### Unit Tests Failing

1. Check mocks in `tests/unit/setup.ts`
2. Verify imports are correct
3. Check TypeScript types

### E2E Tests Failing

1. Ensure dev server is running (`pnpm dev`)
2. Check Playwright browsers installed
3. Review visual diff in `playwright-report/`

### Screenshot Comparison Failing

1. Run `pnpm test:e2e:update-snapshots`
2. Review diffs in report
3. Adjust tolerance if needed

## Documentation

- [Testing Strategy](../docs/testing-strategy.md) - Complete testing documentation
- [Asset Pipeline](../docs/asset-pipeline.md) - SVG asset testing
- [Installation Guide](./INSTALL.md) - Dependency installation

## Best Practices

1. **Run unit tests often** - They're fast (< 10s)
2. **Update baselines intentionally** - Review visual diffs
3. **Test performance** - Maintain 30+ FPS
4. **Keep tests isolated** - Fresh state for each test
5. **Use descriptive names** - Clear test intent

## Current Status

- ✅ Unit test infrastructure setup
- ✅ E2E test infrastructure setup
- ✅ Baseline tests created
- ⏳ Install testing dependencies
- ⏳ Run initial test suite
- ⏳ Create test WAD files

## Next Steps

1. Install dependencies: `pnpm add -D vitest @playwright/test ...`
2. Install browsers: `pnpm exec playwright install chromium`
3. Run unit tests: `pnpm test:unit`
4. Start dev server: `pnpm dev`
5. Run E2E tests: `pnpm test:e2e`
6. Review baselines: `tests/e2e/screenshots/`
