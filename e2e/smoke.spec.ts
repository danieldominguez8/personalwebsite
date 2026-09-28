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
  const html = await (await request.get("/")).text();
  const cssPath = html.match(/href="(\/_astro\/[^"]+\.css)"/)?.[1];
  expect(cssPath, "stylesheet link").toBeTruthy();
  const css = await (await request.get(cssPath!)).text();
  const fontPath = css.match(/url\((\/_astro\/[^)]+\.woff2)\)/)?.[1];
  expect(fontPath, "woff2 url in css").toBeTruthy();
  const font = await request.get(fontPath!);
  expect(font.status()).toBe(200);
  expect(font.headers()["content-type"]).toMatch(/font|woff2|octet-stream/);
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
