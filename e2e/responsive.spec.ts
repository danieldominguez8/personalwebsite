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
      const main = (await page.locator("main .container").first().boundingBox())!;
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

for (const width of [280, 390, 1280, 2560]) {
  test.describe(`projects band at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test("cobalt band spans the full width without horizontal scroll", async ({ page }) => {
      await page.goto("/");
      const band = await page.locator("#projects").evaluate((el) => ({
        width: el.getBoundingClientRect().width,
        bg: getComputedStyle(el).backgroundColor,
        page: document.documentElement.clientWidth,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      expect(band.bg).toBe("rgb(28, 63, 170)");
      expect(Math.abs(band.width - band.page)).toBeLessThanOrEqual(1);
      expect(band.overflow).toBeLessThanOrEqual(0);
    });
  });
}

test.describe("narrow phone readability (280px)", () => {
  test.use({ viewport: { width: 280, height: 700 } });
  test("headline, identity and header items stay inside the screen", async ({ page }) => {
    await page.goto("/");
    const vw = await page.evaluate(() => document.documentElement.clientWidth);
    for (const sel of [".hero h1", ".hero .identity", ".site-header .brand"]) {
      const b = (await page.locator(sel).boundingBox())!;
      expect(b.x, sel).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width, sel).toBeLessThanOrEqual(vw + 0.5);
    }
    const brand = (await page.locator(".site-header .brand").boundingBox())!;
    const resume = (await page
      .getByRole("navigation", { name: "Sections" })
      .getByRole("link", { name: "Resume" })
      .boundingBox())!;
    expect(brand.x + brand.width).toBeLessThanOrEqual(resume.x);
  });
});

test.describe("experience date rail", () => {
  test("desktop: dates sit in a left column beside each title", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const role = page.locator("#experience .role").first();
    const title = (await role.locator("h4").boundingBox())!;
    const date = (await role.locator("time").first().boundingBox())!;
    expect(date.x + date.width).toBeLessThan(title.x);
    expect(Math.abs(date.y - title.y)).toBeLessThanOrEqual(12);
  });

  test("phone: dates stack with the title instead of a side column", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const role = page.locator("#experience .role").first();
    const title = (await role.locator("h4").boundingBox())!;
    const date = (await role.locator("time").first().boundingBox())!;
    expect(Math.abs(date.x - title.x)).toBeLessThanOrEqual(2);
    expect(date.y).toBeGreaterThan(title.y);
  });
});

test.describe("project stack line", () => {
  for (const width of [390, 1280]) {
    test(`appears once and visible at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const articles = page.locator("#projects article");
      const count = await articles.count();
      expect(count).toBe(5);
      for (let i = 0; i < count; i++) {
        await expect(articles.nth(i).locator(".stack")).toHaveCount(1);
        await expect(articles.nth(i).locator(".stack")).toBeVisible();
      }
      const row = page.locator("#projects article").filter({ hasText: "Rally Competitions" });
      await expect(row.locator(".stack")).toHaveCount(1);
      await expect(row.locator(".stack")).toBeVisible();
      await expect(row.locator(".stack")).toHaveText(
        /^Next\.js, Expo \/ React Native, .*GitLab CI\/CD$/,
      );
    });
  }
});

test.describe("phone footer", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("footer shows links before the copyright line", async ({ page }) => {
    await page.goto("/");
    const links = (await page.locator(".site-footer ul").boundingBox())!;
    const copyright = (await page.locator(".site-footer .copyright").boundingBox())!;
    expect(links.y).toBeLessThan(copyright.y);
  });
});
