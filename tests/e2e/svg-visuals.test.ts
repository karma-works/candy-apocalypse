import { expect, test } from '@playwright/test';

test.describe('SVG Visuals Test Level', () => {
  test.beforeEach(async({ page }) => {
    // Navigate to E1M1 of doom1.wad
    await page.goto('/play?iwad=doom1.wad');
    await page.waitForSelector('.candy-button-primary');
    await page.click('.candy-button-primary');
    await page.waitForSelector('#game-canvas', { timeout: 15000 });
    await page.waitForTimeout(2000); // initial render
  });

  test('should render barrel and height transitions', async({ page }) => {
    // focus the canvas to accept input
    await page.locator('#game-canvas').first().click({ force: true });

    // Walk forward to reach the zigzag room with the barrel and height changes
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(2500); // Walk forward for 2.5s
    await page.keyboard.up('ArrowUp');

    // Wait for rendering to settle
    await page.waitForTimeout(500);

    const screenshot = await page.screenshot();
    expect(screenshot).toMatchSnapshot('svg-visuals-barrel-room-baseline.png', {
      maxDiffPixels: 200,
      maxDiffPixelRatio: 0.02,
    });
  });
});
