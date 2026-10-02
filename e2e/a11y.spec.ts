import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [390, 1280]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test("zero axe violations (WCAG 2.2 AA)", async ({ page }) => {
      await page.goto("/");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  });
}

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

test("palette text pairs meet 4.5:1, read from the live CSS tokens", async ({ page }) => {
  await page.goto("/");
  const t = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    // The build minifies #ffffff to #fff, so expand 3-digit hex before comparing.
    const v = (n: string) =>
      css
        .getPropertyValue(n)
        .trim()
        .toLowerCase()
        .replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/, "#$1$1$2$2$3$3");
    return {
      paper: v("--paper"),
      ink: v("--ink"),
      graphite: v("--graphite"),
      cobalt: v("--cobalt"),
      rosa: v("--rosa"),
      marigold: v("--marigold"),
      footer: v("--footer-text"),
    };
  });
  for (const value of Object.values(t)) expect(value).toMatch(/^#[0-9a-f]{6}$/);
  const pairs: [string, string, string][] = [
    ["ink on paper", t.ink, t.paper],
    ["graphite on paper", t.graphite, t.paper],
    ["cobalt links on paper", t.cobalt, t.paper],
    ["rosa figure on paper", t.rosa, t.paper],
    ["paper text on the projects band", t.paper, t.cobalt],
    ["ink on the marigold name band", t.ink, t.marigold],
    ["footer text on ink", t.footer, t.ink],
    ["footer links on ink", t.paper, t.ink],
  ];
  for (const [name, fg, bg] of pairs) expect(ratio(fg, bg), name).toBeGreaterThanOrEqual(4.5);
});

const toHex = (rgb: string) =>
  "#" +
  (rgb.match(/\d+/g) ?? [])
    .slice(0, 3)
    .map((n) => Number(n).toString(16).padStart(2, "0"))
    .join("");

for (const [label, selector] of [
  ["a page link", ".hero a[href*='github.com/danieldominguez8']"],
  ["a link on the projects band", "#projects h2 ~ * a[href*='apps.apple.com']"],
  ["a footer link on the black footer", ".site-footer a[href*='linkedin.com']"],
] as const) {
  test(`keyboard focus ring on ${label} has 3:1 contrast against its background`, async ({
    page,
    browserName,
  }) => {
    await page.goto("/");
    const key = browserName === "webkit" ? "Alt+Tab" : "Tab";
    const target = page.locator(selector).first();
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press(key);
      if (await target.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(target).toBeFocused();
    const { outline, background } = await target.evaluate((el) => {
      let bg = "rgba(0, 0, 0, 0)";
      for (let n: Element | null = el.parentElement; n; n = n.parentElement) {
        const c = getComputedStyle(n).backgroundColor;
        if (!c.startsWith("rgba(0, 0, 0, 0)") && c !== "transparent") {
          bg = c;
          break;
        }
      }
      return { outline: getComputedStyle(el).outlineColor, background: bg };
    });
    expect(ratio(toHex(outline), toHex(background))).toBeGreaterThanOrEqual(3);
  });
}
