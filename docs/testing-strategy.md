# Testing Strategy - Candy Apocalypse

## Overview

This document outlines the comprehensive testing strategy for Candy Apocalypse, a 3D browser game built on doom.ts. The testing approach is designed to ensure game quality while being practical for a game development workflow.

## Testing Philosophy

### Principles

1. **Test the existing engine first** - Establish baselines before making SVG modifications
2. **Fast unit tests, manual E2E** - Unit tests run on every commit, E2E tests run manually
3. **Tolerant visual comparisons** - Allow small rendering variations across environments
4. **Strict performance requirements** - Must maintain 30+ FPS
5. **Chrome-only testing** - Match project's browser target

### Test Execution Strategy

- **Unit Tests**: Run automatically on every commit (< 10 seconds)
- **Integration Tests**: Run on pull requests (< 1 minute)
- **E2E Tests**: Run manually before releases (< 5 minutes)
- **Performance Tests**: Run manually or nightly

---

## Test Structure

```
tests/
├── unit/                          # Tier 1: Fast unit tests
│   ├── setup.ts                   # Test environment setup
│   ├── wad/
│   │   └── parser.test.ts        # WAD parsing tests
│   ├── game/
│   │   └── logic.test.ts         # Game logic tests
│   └── audio/
│       └── mus-player.test.ts    # Audio system tests
│
├── integration/                   # Tier 2: Integration tests (future)
│   └── (to be added)
│
├── e2e/                          # Tier 3: Visual E2E tests
│   ├── baseline-rendering.test.ts # Rendering baseline tests
│   ├── input-controls.test.ts     # Input handling tests
│   └── screenshots/               # Visual baselines (gitignored)
│
└── fixtures/                      # Test data
    ├── wads/                      # Test WAD files
    ├── svg/                       # Test SVG files
    └── wad-fixtures.ts            # WAD fixture definitions
```

---

## Test Tiers

### Tier 1: Unit Tests (< 10 seconds)

**Purpose**: Test individual functions and classes in isolation

**What We Test**:

- WAD parsing logic
- Game state management (health, ammo, weapons)
- Enemy AI state machines
- Collision detection algorithms
- Audio system (MUS format, timing)
- Input handling logic

**Tools**:

- Vitest (test runner)
- jsdom (DOM environment)
- Custom mocks for AudioContext, Canvas

**Example**:

```typescript
describe("Player Health System", () => {
  it("should take damage correctly", () => {
    const player = { health: 100 };
    player.takeDamage(10);
    expect(player.health).toBe(90);
  });
});
```

**Run Command**:

```bash
pnpm test:unit           # Run once
pnpm test:unit:watch     # Watch mode
pnpm test:unit:ui        # UI mode
```

---

### Tier 2: Integration Tests (< 1 minute)

**Purpose**: Test systems working together

**What We Test** (to be implemented):

- Game loop integration
- Entity spawning and updates
- Collision resolution
- Event handling
- State transitions

**Tools**: Vitest with jsdom

**Example**:

```typescript
describe("Game Loop", () => {
  it("should update enemy positions", async () => {
    const game = await createTestGame();
    const enemy = game.spawnEnemy("imp", { x: 0, y: 0 });

    game.update(1000); // 1 second

    expect(enemy.position.x).not.toBe(0);
  });
});
```

---

### Tier 3: E2E Visual Tests (< 5 minutes)

**Purpose**: Test rendering and user interactions in real browser

**What We Test**:

- Canvas/WebGL rendering
- Visual regression (screenshots)
- Performance (FPS monitoring)
- User interactions (mouse, keyboard)
- Responsive scaling

**Tools**:

- Playwright
- Chromium browser
- Visual comparison with tolerance

**Visual Comparison Settings**:

```typescript
{
  maxDiffPixels: 100,          // Allow up to 100 different pixels
  maxDiffPixelRatio: 0.01,     // 1% pixel difference allowed
  threshold: 0.2,              // Perceptual threshold
  animations: 'disabled',       // Disable animations for consistency
}
```

**Run Command**:

```bash
pnpm test:e2e                   # Run all E2E tests
pnpm test:e2e:ui                # UI mode
pnpm test:e2e:debug             # Debug mode
pnpm test:e2e:update-snapshots  # Update baselines
```

**Screenshots**:

- Stored in `tests/e2e/screenshots/`
- Gitignored (too large, environment-specific)
- Update baselines with: `pnpm test:e2e:update-snapshots`

---

## Performance Testing

### Requirements

- **Minimum FPS**: 30
- **Target FPS**: 30+
- **Maximum frame time**: < 50ms (20 FPS minimum)
- **Average frame time**: < 33ms (30 FPS target)

### Performance Tests

**FPS Monitoring**:

```typescript
test("should maintain 30+ FPS", async ({ page }) => {
  const avgFps = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      const frames: number[] = [];
      let lastTime = performance.now();

      const measureFrame = () => {
        const now = performance.now();
        frames.push(1000 / (now - lastTime));
        lastTime = now;

        if (frames.length >= 60) {
          resolve(frames.reduce((a, b) => a + b) / frames.length);
        } else {
          requestAnimationFrame(measureFrame);
        }
      };

      requestAnimationFrame(measureFrame);
    });
  });

  expect(avgFps).toBeGreaterThanOrEqual(30);
});
```

**Frame Time Analysis**:

```typescript
test("should measure frame times", async ({ page }) => {
  const frameTimes = await measureFrameTimes(page, 100);

  const avgFrameTime = average(frameTimes);
  const maxFrameTime = Math.max(...frameTimes);

  expect(avgFrameTime).toBeLessThan(33); // 30 FPS
  expect(maxFrameTime).toBeLessThan(50); // 20 FPS minimum
});
```

---

## Visual Regression Testing

### Strategy: Perceptual Diff with Tolerance

We use tolerant visual comparison to handle:

- Floating-point precision differences across GPUs
- Anti-aliasing variations
- Sub-pixel rendering differences
- WebGL context variations

### Baseline Management

**Creating Initial Baselines**:

```bash
# First run will fail, create baselines
pnpm test:e2e

# Or explicitly update
pnpm test:e2e:update-snapshots
```

**Updating Baselines on Intentional Changes**:

```bash
# After intentional visual changes
pnpm test:e2e:update-snapshots

# Review changes
git diff tests/e2e/screenshots/
```

**Reviewing Visual Diffs**:

- Playwright generates HTML report with visual diffs
- Located in `playwright-report/`
- Open with: `pnpm exec playwright show-report`

---

## Test Fixtures

### WAD Files

**Minimal Test WADs** (to be created):

```
tests/fixtures/wads/
├── single-cube.wad        # Basic room test
├── two-sectors.wad        # Height difference test
├── door-test.wad          # Door mechanics test
└── enemy-spawn.wad        # Enemy spawn test
```

**Why Minimal WADs?**

- Fast to load in tests
- Predictable geometry
- Easy to verify
- Small repo size

### SVG Files

**Test Spritemap**:

```
tests/fixtures/svg/
└── test-spritemap.svg     # Minimal spritemap for tests
```

---

## CI/CD Integration

### GitHub Actions Workflow (Future)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test:unit
      # Takes < 10 seconds
```

**Note**: E2E tests run manually, not in CI (as per requirements)

---

## Browser Compatibility

### Target: Chrome Only

As per `browserslist` in package.json:

```json
{
  "browserslist": ["last 1 Chrome versions"]
}
```

**Why Chrome Only?**

- Reduces test matrix complexity
- Matches target audience
- Faster CI/CD
- WebGL consistency

---

## Installation

### Install Testing Dependencies

```bash
# Unit Testing
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @types/node

# E2E Testing
pnpm add -D @playwright/test

# Install Playwright browsers
pnpm exec playwright install chromium
```

### Verify Installation

```bash
# Run unit tests
pnpm test:unit

# Run E2E tests (requires dev server running)
pnpm test:e2e
```

---

## Running Tests

### Quick Reference

```bash
# Unit tests
pnpm test:unit              # Run once
pnpm test:unit:watch        # Watch mode
pnpm test:unit:ui           # UI mode

# E2E tests
pnpm test:e2e               # Run all E2E tests
pnpm test:e2e:ui            # UI mode
pnpm test:e2e:debug         # Debug mode
pnpm test:e2e:update-snapshots  # Update baselines

# All tests
pnpm test                   # Unit tests only (E2E is manual)
```

---

## Best Practices

### Writing Unit Tests

1. **Test behavior, not implementation**

   ```typescript
   // Good
   it("should reduce health when damaged", () => {
     player.takeDamage(10);
     expect(player.health).toBe(90);
   });

   // Avoid
   it("should set health variable", () => {
     player.health = 90;
     expect(player.health).toBe(90);
   });
   ```

2. **Use descriptive test names**

   ```typescript
   // Good
   describe("Player.takeDamage", () => {
     it("should not reduce health below 0", () => {});
     it("should trigger death when health reaches 0", () => {});
   });
   ```

3. **Keep tests isolated**
   ```typescript
   beforeEach(() => {
     // Fresh state for each test
     player = new Player();
   });
   ```

### Writing E2E Tests

1. **Wait for rendering to complete**

   ```typescript
   await page.waitForSelector("#game-canvas");
   await page.waitForTimeout(1000); // Wait for initial render
   ```

2. **Use tolerant comparisons**

   ```typescript
   expect(screenshot).toMatchSnapshot("baseline.png", {
     maxDiffPixels: 100, // Tolerant, not pixel-perfect
   });
   ```

3. **Test performance, not just visuals**
   ```typescript
   test("should maintain 30+ FPS", async ({ page }) => {
     const fps = await measureFPS(page);
     expect(fps).toBeGreaterThanOrEqual(30);
   });
   ```

---

## Troubleshooting

### Common Issues

**Unit Tests Failing**:

- Check mocks in `tests/unit/setup.ts`
- Verify jsdom environment
- Check import paths

**E2E Tests Failing**:

- Ensure dev server is running (`pnpm dev`)
- Check Playwright browser installation
- Review visual diff in `playwright-report/`

**Screenshot Comparison Failing**:

- Run `pnpm test:e2e:update-snapshots`
- Review visual diffs in report
- Adjust tolerance if needed

**Performance Tests Failing**:

- Check system load (close other apps)
- Verify hardware acceleration is enabled
- Test in non-headless mode for debugging

---

## Future Improvements

### Planned Enhancements

1. **Integration Tests**: Add comprehensive integration test suite
2. **Test WADs**: Create minimal test WAD files
3. **Performance Dashboard**: Track performance metrics over time
4. **Visual Diff Review**: Automate visual diff reviews in PRs
5. **Coverage Reports**: Add code coverage tracking

### Additional Test Types

1. **Accessibility Tests**: Test with screen readers, keyboard navigation
2. **Mobile Tests**: Touch controls, responsive layout
3. **Load Tests**: Many enemies, complex scenes
4. **Memory Tests**: Memory leak detection
5. **Network Tests**: Asset loading, WAD streaming

---

## Documentation References

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Visual Regression Testing](https://playwright.dev/docs/test-snapshots)

---

## Conclusion

This testing strategy provides comprehensive coverage while being practical for game development. By testing the existing doom.ts engine first, we establish reliable baselines before making SVG modifications. The tiered approach ensures fast feedback during development while maintaining quality through manual E2E verification.

**Key Takeaways**:

- ✅ Test existing engine before modifications
- ✅ Fast unit tests for every commit
- ✅ Manual E2E tests for quality assurance
- ✅ Tolerant visual comparisons
- ✅ Strict 30+ FPS requirement
- ✅ Chrome-only testing
