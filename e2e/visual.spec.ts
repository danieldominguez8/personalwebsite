import { test, expect } from "@playwright/test";

const sizes = [
  ["phone", 390, 844],
  ["desktop", 1280, 900],
] as const;

for (const [name, width, height] of sizes) {
  test(`full page matches baseline — ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    // Full-page screenshots never scroll, so lazy images would stay blank: load them all first.
    await page.evaluate(async () => {
      const images = [...document.images];
      images.forEach((img) => (img.loading = "eager"));
      await Promise.all(images.map((img) => img.decode().catch(() => undefined)));
      await document.fonts.ready;
    });
    await expect(page).toHaveScreenshot(`home-${name}.png`, { fullPage: true });
  });
}
