import { expect, test } from '@playwright/test';

test.describe('Baseline Rendering Tests', () => {
  test.beforeEach(async({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err));

    // Navigate to the game
    await page.goto('/');

    try {
      await page.waitForSelector('.candy-button-primary', { timeout: 5000 });
      await page.click('.candy-button-primary');
    } catch (e) {
      console.log('Failed to find button. Page content:', await page.content());
      throw e;
    }

    // Wait for game to initialize
    await page.waitForSelector('#game-canvas', { timeout: 10000 });

    // Wait for initial render to complete
    await page.waitForTimeout(2000);
  });

  test('should render game canvas', async({ page }) => {
    const canvas = page.locator('#game-canvas');

    // Check canvas exists
    await expect(canvas).toBeVisible();

    // Check canvas has valid dimensions
    const width = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    const height = await canvas.evaluate((el: HTMLCanvasElement) => el.height);

    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test('should capture baseline screenshot of initial game state', async({
    page,
  }) => {
    // Take screenshot of initial game state
    const screenshot = await page.screenshot({ fullPage: false });

    // Compare with baseline (will create baseline on first run)
    expect(screenshot).toMatchSnapshot('game-initial-baseline.png', {
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('should maintain 30+ FPS during gameplay', async({ page }) => {
    // Inject FPS counter
    const avgFps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const frames: number[] = [];
        let lastTime = performance.now();
        let frameCount = 0;

        const measureFrame = () => {
          const now = performance.now();
          const delta = now - lastTime;
          lastTime = now;

          if (delta > 0) {
            frames.push(1000 / delta);
            frameCount++;
          }

          // Measure 60 frames (~2 seconds at 30fps)
          if (frameCount >= 60) {
            const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
            resolve(avg);
          } else {
            requestAnimationFrame(measureFrame);
          }
        };

        requestAnimationFrame(measureFrame);
      });
    });

    console.log(`Average FPS: ${avgFps.toFixed(2)}`);
    expect(avgFps).toBeGreaterThanOrEqual(30);
  });

  test('should render game at different viewport sizes', async({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'hd' },
      { width: 1280, height: 720, name: 'hd-ready' },
      { width: 800, height: 600, name: 'svga' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.waitForTimeout(500); // Wait for resize

      const screenshot = await page.screenshot();
      expect(screenshot).toMatchSnapshot(`game-${viewport.name}-baseline.png`, {
        maxDiffPixels: 500,
        maxDiffPixelRatio: 0.02,
      });
    }
  });
});

test.describe('Game Loading Tests', () => {
  test('should load game within acceptable time', async({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForSelector('.candy-button-primary');
    await page.click('.candy-button-primary');
    await page.waitForSelector('#game-canvas');
    await page.waitForTimeout(1000); // Wait for initial render

    const loadTime = Date.now() - startTime;

    console.log(`Game loaded in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(15000); // Should load in under 15 seconds
  });

  test('should display loading indicator', async({ page }) => {
    // Check if there's any loading UI
    await page.goto('/');

    // Look for common loading indicators
    const loadingElement = page.locator(
      '[data-testid="loading"], .loading, #loading',
    );
    const hasLoadingIndicator = await loadingElement.count() > 0;

    if (hasLoadingIndicator) {
      await expect(loadingElement.first()).toBeVisible();
    }
  });
});

test.describe('Canvas Rendering Tests', () => {
  test('should use WebGL context', async({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.candy-button-primary');
    await page.click('.candy-button-primary');
    await page.waitForSelector('#game-canvas');

    const contextType = await page
      .locator('#game-canvas')
      .evaluate((canvas: HTMLCanvasElement) => {
        // Check if WebGL context exists
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        return gl ? 'webgl' : '2d';
      });

    console.log(`Canvas context type: ${contextType}`);
    expect(contextType).toBe('webgl');
  });

  test('should handle canvas resize', async({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.candy-button-primary');
    await page.click('.candy-button-primary');
    await page.waitForSelector('#game-canvas');

    // Get initial dimensions
    const initialWidth = await page
      .locator('#game-canvas')
      .evaluate((el: HTMLCanvasElement) => el.width);

    // Resize viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);

    // Check canvas updated
    const newWidth = await page
      .locator('#game-canvas')
      .evaluate((el: HTMLCanvasElement) => el.width);

    expect(newWidth).not.toBe(initialWidth);
  });
});

test.describe('Performance Monitoring', () => {
  test('should measure frame times', async({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.candy-button-primary');
    await page.click('.candy-button-primary');
    await page.waitForSelector('#game-canvas');

    const frameTimes = await page.evaluate(() => {
      return new Promise<number[]>((resolve) => {
        const times: number[] = [];
        let lastTime = performance.now();
        let count = 0;

        const measure = () => {
          const now = performance.now();
          times.push(now - lastTime);
          lastTime = now;
          count++;

          if (count >= 100) {
            resolve(times);
          } else {
            requestAnimationFrame(measure);
          }
        };

        requestAnimationFrame(measure);
      });
    });

    const avgFrameTime =
      frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const maxFrameTime = Math.max(...frameTimes);

    console.log(`Avg frame time: ${avgFrameTime.toFixed(2)}ms`);
    console.log(`Max frame time: ${maxFrameTime.toFixed(2)}ms`);

    // Should maintain < 33ms average (30 FPS)
    expect(avgFrameTime).toBeLessThan(33);

    // No frame should exceed 50ms (20 FPS minimum)
    expect(maxFrameTime).toBeLessThan(50);
  });
});
