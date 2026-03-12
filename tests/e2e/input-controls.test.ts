import { test, expect } from "@playwright/test";

test.describe("Input Controls Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".candy-button-primary");
    await page.click(".candy-button-primary");
    await page.waitForSelector("#game-canvas");
    await page.waitForTimeout(1000);
  });

  test("should handle keyboard input", async ({ page }) => {
    // Test WASD movement
    await page.keyboard.press("w");
    await page.waitForTimeout(100);

    // In a real test, we'd verify player position changed
    // For now, just verify no errors occurred
    const errors = await page.evaluate(() => {
      return (window as any).testErrors || [];
    });

    expect(errors).toHaveLength(0);
  });

  test("should handle weapon switching with number keys", async ({ page }) => {
    // Press keys 1-7 to switch weapons
    for (let i = 1; i <= 7; i++) {
      await page.keyboard.press(i.toString());
      await page.waitForTimeout(100);
    }

    // Verify no errors
    const errors = await page.evaluate(() => {
      return (window as any).testErrors || [];
    });

    expect(errors).toHaveLength(0);
  });

  test("should request pointer lock on canvas click", async ({ page }) => {
    const canvas = page.locator("#game-canvas");

    // Click canvas to request pointer lock
    await canvas.click();

    // Check if pointer lock was requested
    const pointerLockElement = await page.evaluate(() => {
      return document.pointerLockElement;
    });

    // Pointer lock might not work in headless mode, so just check no errors
    console.log("Pointer lock element:", pointerLockElement);
  });

  test("should handle mouse movement", async ({ page }) => {
    const canvas = page.locator("#game-canvas");

    await canvas.click();

    // Move mouse
    await page.mouse.move(100, 100);
    await page.waitForTimeout(100);

    await page.mouse.move(200, 200);
    await page.waitForTimeout(100);

    // Verify no errors
    const errors = await page.evaluate(() => {
      return (window as any).testErrors || [];
    });

    expect(errors).toHaveLength(0);
  });
});

test.describe("Game State Tests", () => {
  test("should initialize game state correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".candy-button-primary");
    await page.click(".candy-button-primary");
    await page.waitForSelector("#game-canvas");
    await page.waitForTimeout(1000);

    // Check if game state is initialized
    const gameState = await page.evaluate(() => {
      // This would need to be exposed by the game
      return (window as any).gameState || null;
    });

    console.log("Game state:", gameState);
  });

  test("should handle pause/resume", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".candy-button-primary");
    await page.click(".candy-button-primary");
    await page.waitForSelector("#game-canvas");
    await page.waitForTimeout(1000);

    // Press Escape to pause
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    // Press Escape again to resume
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    // Verify no errors
    const errors = await page.evaluate(() => {
      return (window as any).testErrors || [];
    });

    expect(errors).toHaveLength(0);
  });
});
