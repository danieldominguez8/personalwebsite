import { test, expect } from "@playwright/test";

const widths = [280, 320, 390, 768, 1024, 1280, 1920];

for (const width of widths) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("no horizontal scroll", async ({ page }) => {
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test("header stays one row", async ({ page }) => {
      await page.goto("/");
      const header = (await page.locator(".site-header").boundingBox())!;
      expect(header.height).toBeLessThanOrEqual(65);
      // The bar has a fixed height, so also check the Resume button stays one line inside it.
      const button = (await page
        .getByRole("navigation", { name: "Sections" })
        .getByRole("link", { name: "Resume" })
        .boundingBox())!;
      expect(button.height).toBeLessThanOrEqual(44);
      expect(button.y + button.height).toBeLessThanOrEqual(header.y + header.height);
    });

    test("project grid columns", async ({ page }) => {
      await page.goto("/");
      const cols = await page
        .locator("#projects .grid")
        .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
      expect(cols).toBe(width >= 768 ? 2 : 1);
    });
  });
}

for (const width of [1024, 1280, 1920, 2560]) {
  test.describe(`fluid layout at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test("content scales with the window, capped on ultra-wide screens", async ({ page }) => {
      await page.goto("/");
      const main = (await page.locator("main").boundingBox())!;
      const expected = Math.min(Math.max(width * 0.86, 760), 1600);
      expect(Math.abs(main.width - expected)).toBeLessThanOrEqual(2);
      // Running text keeps a readable line length (72ch) however wide the column gets.
      const intro = (await page.locator(".hero .intro").boundingBox())!;
      expect(intro.width).toBeLessThanOrEqual(900);
    });
  });
}

test.describe("phone header", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("hides section links but keeps Resume", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Sections" });
    await expect(nav.getByRole("link", { name: "Experience" })).toBeHidden();
    await expect(nav.getByRole("link", { name: "Resume" })).toBeVisible();
  });
});
