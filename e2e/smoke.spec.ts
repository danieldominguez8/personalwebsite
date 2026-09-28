import { test, expect } from "@playwright/test";

const isProd = process.env.BASE_URL?.startsWith("https://www.dannydominguez.dev");

test("home page loads with the new design", async ({ page }) => {
  const res = await page.goto("/");
  expect(res!.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "I build reliable payment platforms and backend services in .NET and Azure.",
  );
});

test("resume is a real PDF", async ({ request }) => {
  const res = await request.get("/resume.pdf");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/pdf");
});

test("unknown path returns 404 with the not-found page", async ({ request }) => {
  const res = await request.get("/this-page-does-not-exist");
  expect(res.status()).toBe(404);
  expect(await res.text()).toContain("Page not found");
});

test.describe("production-only redirects", () => {
  test.skip(!isProd, "redirect rules are app-wide and only verified on the production domain");

  test("apex redirects permanently to www", async ({ request }) => {
    const res = await request.get("https://dannydominguez.dev/", { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()["location"]).toBe("https://www.dannydominguez.dev/");
  });

  test("old CRA resume URL redirects to /resume.pdf", async ({ request }) => {
    const res = await request.get("/static/media/danny_dominguez_resume.1cc2f44acd120714c053.pdf", {
      maxRedirects: 0,
    });
    expect(res.status()).toBe(301);
    expect(res.headers()["location"]).toMatch(/\/resume\.pdf$/);
  });
});
