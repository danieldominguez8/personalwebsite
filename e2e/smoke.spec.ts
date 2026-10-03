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

test("sitemap is served as XML, not rewritten to the home page", async ({ request }) => {
  const res = await request.get("/sitemap-index.xml");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/xml/);
  expect(await res.text()).toContain("<sitemapindex");
});

test("self-hosted fonts are served as fonts", async ({ request }) => {
  // CSS is inlined, so read the @font-face URLs straight from the page.
  const html = await (await request.get("/")).text();
  const fontPaths = [
    ...new Set([...html.matchAll(/url\((\/_astro\/[^)]+\.woff2)\)/g)].map((m) => m[1])),
  ];
  expect(fontPaths.length, "woff2 urls in inline css").toBeGreaterThan(0);
  const preloaded = [...html.matchAll(/rel="preload" href="([^"]+\.woff2)"/g)].map((m) => m[1]);
  expect(preloaded.length, "preloaded fonts").toBe(4);
  for (const path of new Set([...preloaded, ...fontPaths])) {
    const font = await request.get(path);
    expect(font.status(), path).toBe(200);
    expect(font.headers()["content-type"], path).toMatch(/font|woff2|octet-stream/);
  }
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
