import { test, expect } from "@playwright/test";

const widths = [320, 390, 768, 1024, 1280, 1920];

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
      const box = await page.locator(".site-header").boundingBox();
      expect(box!.height).toBeLessThanOrEqual(65);
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

test.describe("phone header", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("hides section links but keeps Resume", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Sections" });
    await expect(nav.getByRole("link", { name: "Experience" })).toBeHidden();
    await expect(nav.getByRole("link", { name: "Resume" })).toBeVisible();
  });
});
