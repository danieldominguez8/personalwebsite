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
  // Number every link so duplicates (header/hero/footer "Resume") are tracked individually.
  const total = await page.evaluate(() => {
    const links = [...document.querySelectorAll("a[href]")];
    links.forEach((a, i) => a.setAttribute("data-tab-id", String(i)));
    return links.length;
  });
  const seen = new Set<string>();
  for (let i = 0; i < total + 10; i++) {
    await page.keyboard.press(tabKey(browserName));
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el.tagName !== "A") return null;
      const s = getComputedStyle(el);
      return { id: el.dataset.tabId!, outline: s.outlineStyle, width: s.outlineWidth };
    });
    if (!info) continue;
    expect(info.outline, `link ${info.id}`).not.toBe("none");
    expect(parseFloat(info.width), `link ${info.id}`).toBeGreaterThanOrEqual(2);
    seen.add(info.id);
  }
  expect(seen.size).toBe(total);
});

test("DD badge uses a font weight that is actually loaded", async ({ page }) => {
  const weight = await page.locator(".badge").evaluate((el) => getComputedStyle(el).fontWeight);
  expect(["400", "500", "600"]).toContain(weight);
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
  const appStore = page.getByRole("link", { name: "App Store" });
  await expect(appStore).toHaveCount(2);
  await expect(appStore.nth(0)).toHaveAttribute("href", /loter%C3%ADa-tradicional\/id1612279702/);
  await expect(appStore.nth(1)).toHaveAttribute("href", /free-together\/id6760777597/);
  await expect(page.getByRole("link", { name: "Website" })).toHaveCount(2);
  await expect(page.locator('a[href*="play.google.com"]')).toHaveCount(0);
});
