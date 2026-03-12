import { test, expect } from "@playwright/test";

test.describe("Single Cube Test Level", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the game with our custom single cube WAD
        await page.goto("/play?iwad=doom1.wad&pwads=assets/test-wads/single-cube.wad");

        // Wait for CandyMenu and click Start
        await page.waitForSelector(".candy-button-primary");
        await page.click(".candy-button-primary");

        // Wait for game to initialize
        await page.waitForSelector("#game-canvas", { timeout: 15000 });

        // Wait for initial render to complete
        await page.waitForTimeout(2000);
    });

    test("should render single cube level at different viewport sizes", async ({ page }) => {
        const viewports = [
            { width: 1920, height: 1080, name: "hd" },
            { width: 800, height: 600, name: "svga" },
        ];

        for (const viewport of viewports) {
            await page.setViewportSize({
                width: viewport.width,
                height: viewport.height,
            });
            await page.waitForTimeout(500); // Wait for resize

            // Assert canvas has the correct sizes
            const canvas = page.locator("#game-canvas").first();
            await expect(canvas).toBeVisible();

            const width = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
            const height = await canvas.evaluate((el: HTMLCanvasElement) => el.height);
            expect(width).toBeGreaterThan(0);
            expect(height).toBeGreaterThan(0);

            // Create a visual baseline screenshot of the player's starting view inside the cube
            const screenshot = await page.screenshot();
            expect(screenshot).toMatchSnapshot(`single-cube-${viewport.name}-baseline.png`, {
                maxDiffPixels: 200,          // Allow some rendering differences
                maxDiffPixelRatio: 0.02,     // 2% pixel difference allowed
            });
        }
    });
});
