import { test, expect } from "@playwright/test";

const caller = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: /corre y se va/i });

test.describe("¡Corre y se va! card caller", () => {
  test("calls a project card: focuses it and announces its name", async ({ page }) => {
    await page.goto("/");
    await caller(page).click();
    const called = page.locator("#projects article[data-called]");
    await expect(called).toHaveCount(1);
    const name = (await called.locator("h3").innerText()).trim();
    await expect(called.locator("h3")).toBeFocused();
    await expect(page.locator("#card-caller-status")).toHaveText(new RegExp(name, "i"));
  });

  test("every project name shows a visible focus ring when focused (rows and cards)", async ({
    page,
  }) => {
    await page.goto("/");
    // Deterministic: check every card and row heading, not a random sample.
    const names = page.locator("#projects article h3");
    await expect(names).toHaveCount(5);
    const layouts = new Set<string>();
    for (const h3 of await names.all()) {
      await h3.focus();
      const ring = await h3.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          style: s.outlineStyle,
          width: parseFloat(s.outlineWidth),
          layout: el.closest("article")!.className.includes("lot-row") ? "row" : "card",
        };
      });
      expect(ring.style).not.toBe("none");
      expect(ring.width).toBeGreaterThanOrEqual(2);
      layouts.add(ring.layout);
    }
    expect([...layouts].sort()).toEqual(["card", "row"]);
    // And through the real button: the called card's name is focused with a visible ring.
    await caller(page).click();
    const called = page.locator("#projects article[data-called] h3");
    await expect(called).toBeFocused();
    expect(await called.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
  });

  test("never calls the same card twice in a row", async ({ page }) => {
    await page.goto("/");
    let last = "";
    for (let i = 0; i < 6; i++) {
      await caller(page).click();
      const name = await page.locator("#projects article[data-called] h3").innerText();
      expect(name).not.toBe(last);
      last = name;
    }
  });

  test("plays the flip only when motion is allowed", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await caller(page).click();
    const anim = () =>
      page
        .locator("#projects article[data-called]")
        .evaluate((el) => getComputedStyle(el).animationName);
    expect(await anim()).not.toBe("none");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await caller(page).click();
    expect(await anim()).toBe("none");
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the caller button is hidden and every card is still listed", async ({ page }) => {
    await page.goto("/");
    await expect(caller(page)).toBeHidden();
    await expect(page.locator("#projects article")).toHaveCount(5);
  });
});

test.describe("card lift", () => {
  test("hover and keyboard focus lift the name band; reduced motion keeps it still", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const card = page.locator("#projects article.lot").first();
    const band = card.locator(".name");
    expect(await band.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    await card.hover();
    await expect.poll(() => band.evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
    await page.mouse.move(0, 0);
    await card.locator("a").first().focus();
    await expect.poll(() => band.evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await band.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
  });
});
