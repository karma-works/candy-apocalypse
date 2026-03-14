import { expect, test } from '@playwright/test';

test.describe('Enemy Visibility Test', () => {
  test.beforeEach(async({ page }) => {
    // Navigate to the game with our custom single cube WAD
    await page.goto('/play?iwad=doom1.wad&pwads=assets/test-wads/single-cube.wad');

    // Wait for CandyMenu and click Start
    await page.waitForSelector('.candy-button-primary');
    await page.click('.candy-button-primary');

    // Wait for game to initialize
    await page.waitForSelector('#game-canvas', { timeout: 15000 });

    // Wait for initial render to complete
    await page.waitForTimeout(2000);
  });

  test('should render enemy in front of a wall', async({ page }) => {
    // focus the canvas to accept input
    await page.locator('#game-canvas').first().click({ force: true });

    // Player is at (64,64) facing North (90). Enemy is at (32,32) SW.
    // Let's turn left to face the enemy.
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(800); // Turning time
    await page.keyboard.up('ArrowLeft');

    // Wait for rendering to settle
    await page.waitForTimeout(500);

    const screenshot = await page.screenshot();
    expect(screenshot).toMatchSnapshot('enemy-visibility-baseline.png', {
      maxDiffPixels: 200, // Allow some rendering differences
      maxDiffPixelRatio: 0.02, // 2% pixel difference allowed
    });
  });
});
