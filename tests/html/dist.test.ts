import { beforeAll, describe, expect, test } from "vitest";
import { readFileSync, existsSync } from "node:fs";

let html = "";
beforeAll(() => {
  if (!existsSync("dist/index.html")) throw new Error("Run `npm run build` first");
  html = readFileSync("dist/index.html", "utf8");
});

const ids = () => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);

describe("built index.html", () => {
  test("exactly one h1 and no skipped heading levels", () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
    levels.forEach((lvl, i) => {
      if (i > 0) expect(lvl - levels[i - 1]).toBeLessThanOrEqual(1);
    });
  });

  test("ids are unique and every in-page link resolves", () => {
    const all = ids();
    expect(new Set(all).size).toBe(all.length);
    const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    for (const a of anchors) expect(all, `#${a}`).toContain(a);
  });

  test("all sections present in order", () => {
    const order = ["main", "experience", "projects", "skills", "about", "contact"].map((id) =>
      html.indexOf(`id="${id}"`),
    );
    expect(order.every((i) => i > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  test("SEO and sharing metadata", () => {
    expect(html).toContain("<title>Danny Dominguez — Software Engineer</title>");
    expect(html).toMatch(/<meta name="description" content="[^"]{50,160}"/);
    expect(html).toContain('<link rel="canonical" href="https://www.dannydominguez.dev/"');
    for (const p of ["og:title", "og:description", "og:image", "og:url"]) {
      expect(html).toContain(`property="${p}"`);
    }
    expect(html).toContain('<html lang="en"');
  });

  test("every image has alt, width and height", () => {
    const imgs = html.match(/<img\b[^>]*>/g) ?? [];
    expect(imgs.length).toBeGreaterThanOrEqual(4);
    for (const img of imgs) {
      expect(img).toMatch(/alt="[^"]+"/);
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
    }
  });

  test("no inline styles, scripts, or javascript: urls", () => {
    expect(html).not.toMatch(/\sstyle="/);
    expect(html).not.toMatch(/<script\b(?![^>]*type="application\/ld\+json")/);
    expect(html).not.toMatch(/href="javascript:/i);
  });

  test("resume is served from a stable path", () => {
    expect(existsSync("dist/resume.pdf")).toBe(true);
    expect(html).not.toContain("/static/media/");
  });
});

describe("404 page", () => {
  test("exists, is noindex, and links home", () => {
    const page = readFileSync("dist/404.html", "utf8");
    expect(page).toContain('<meta name="robots" content="noindex"');
    expect(page).toMatch(/<h1[^>]*>Page not found<\/h1>/);
    expect(page).toContain('href="/"');
    expect(page).toContain('href="/resume.pdf"');
  });

  test("sitemap lists the home page only", () => {
    const xml = readFileSync("dist/sitemap-0.xml", "utf8");
    expect(xml).toContain("<loc>https://www.dannydominguez.dev/</loc>");
    expect(xml).not.toContain("404");
  });
});

describe("links work from every built page", () => {
  test("every in-page or home-page anchor resolves to an id that exists", () => {
    const home = readFileSync("dist/index.html", "utf8");
    const homeIds = [...home.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    for (const file of ["dist/index.html", "dist/404.html"]) {
      const page = readFileSync(file, "utf8");
      const pageIds = [...page.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
      for (const [, anchor] of page.matchAll(/href="#([^"]+)"/g)) {
        expect(pageIds, `${file} #${anchor}`).toContain(anchor);
      }
      for (const [, anchor] of page.matchAll(/href="\/#([^"]+)"/g)) {
        expect(homeIds, `${file} /#${anchor}`).toContain(anchor);
      }
    }
  });
});
