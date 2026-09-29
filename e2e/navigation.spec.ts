import { test, expect } from "@playwright/test";

let errors: string[] = [];
// Safari only moves focus to links with Option+Tab.
const tabKey = (browserName: string) => (browserName === "webkit" ? "Alt+Tab" : "Tab");

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/");
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

for (const id of ["experience", "projects", "skills", "about"]) {
  test(`nav link scrolls to #${id}`, async ({ page }) => {
    await page
      .getByRole("navigation", { name: "Sections" })
      .getByRole("link", { name: new RegExp(id, "i") })
      .click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  });
}

test("skip link is the first tab stop and jumps to main", async ({ page, browserName }) => {
  await page.keyboard.press(tabKey(browserName));
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("every link is reachable by keyboard with a visible focus ring", async ({
  page,
  browserName,
}) => {
  const expected = await page.evaluate(
    () =>
      new Set(
        [...document.querySelectorAll("a[href]")].map(
          (a) => `${a.getAttribute("href")}|${a.textContent?.trim()}`,
        ),
      ).size,
  );
  const seen = new Set<string>();
  for (let i = 0; i < expected + 10; i++) {
    await page.keyboard.press(tabKey(browserName));
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el.tagName !== "A") return null;
      const s = getComputedStyle(el);
      return {
        key: `${el.getAttribute("href")}|${el.textContent?.trim()}`,
        outline: s.outlineStyle,
        width: s.outlineWidth,
      };
    });
    if (!info) continue;
    expect(info.outline, info.key).not.toBe("none");
    expect(parseFloat(info.width), info.key).toBeGreaterThanOrEqual(2);
    seen.add(info.key);
  }
  expect(seen.size).toBe(expected);
});

test("resume downloads as a PDF", async ({ request }) => {
  const res = await request.get("/resume.pdf");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/pdf");
  expect((await res.body()).subarray(0, 5).toString()).toBe("%PDF-");
});

test("contact and profile links are correct", async ({ page }) => {
  await expect(page.locator('a[href="mailto:dominguezdanieldev@gmail.com"]').first()).toBeVisible();
  await expect(page.locator('a[href="https://github.com/danieldominguez8"]').first()).toBeVisible();
  await expect(
    page.locator('a[href="https://www.linkedin.com/in/dannyddominguez/"]').first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "App Store" })).toHaveAttribute(
    "href",
    /apps\.apple\.com/,
  );
  await expect(page.locator('a[href*="play.google.com"]')).toHaveCount(0);
});
