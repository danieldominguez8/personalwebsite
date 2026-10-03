import { beforeAll, describe, expect, test } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";

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
    // One small module script is allowed: the ¡Corre y se va! card caller (progressive enhancement).
    const scripts = html.match(/<script\b[^>]*>[\s\S]*?<\/script>/g) ?? [];
    expect(scripts.length).toBe(1);
    for (const s of scripts) {
      expect(s).toMatch(/type="module"/);
      expect(s.length).toBeLessThan(2500);
    }
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

  test("noindex 404 page does not declare a canonical URL", () => {
    const page = readFileSync("dist/404.html", "utf8");
    expect(page).not.toContain('rel="canonical"');
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

describe("design system in the build", () => {
  // CSS is inlined into <style> blocks; also read any emitted .css files.
  const css = () =>
    [
      ...readdirSync("dist/_astro")
        .filter((f) => f.endsWith(".css"))
        .map((f) => readFileSync(`dist/_astro/${f}`, "utf8")),
      ...[
        ...readFileSync("dist/index.html", "utf8").matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g),
      ].map((m) => m[1]),
    ].join("\n");

  test("Big Shoulders Display is self-hosted and Newsreader is gone", () => {
    expect(css()).toMatch(/@font-face\{[^}]*font-family:\s*["']?Big Shoulders Display Variable/);
    expect(css()).not.toMatch(/Newsreader/i);
    expect(readdirSync("dist/_astro").some((f) => /newsreader/i.test(f))).toBe(false);
  });

  test("the preloaded font is the same file @font-face uses (no double download)", () => {
    const html = readFileSync("dist/index.html", "utf8");
    const preloaded = html.match(/rel="preload" href="([^"]+\.woff2)"/)?.[1];
    expect(preloaded).toBeTruthy();
    expect(css()).toContain(`url(${preloaded})`);
  });

  test("browser theme color matches the cobalt token", () => {
    expect(readFileSync("dist/index.html", "utf8")).toContain(
      '<meta name="theme-color" content="#1c3faa"',
    );
  });

  test("no middle-dot separators in visible text", () => {
    for (const file of ["dist/index.html", "dist/404.html"]) {
      const text = readFileSync(file, "utf8")
        .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, "")
        .replace(/<[^>]+>/g, " ");
      expect(text, file).not.toContain("·");
    }
  });
});

describe("first paint is not blocked", () => {
  test("stylesheets are inlined, not render-blocking requests", () => {
    const html = readFileSync("dist/index.html", "utf8");
    expect(html).not.toMatch(/<link[^>]+rel="stylesheet"/);
    expect(html).toMatch(/<style[^>]*>[\s\S]*--cobalt/);
  });

  test("every latin web font is preloaded, so no font swap shifts the layout", () => {
    // CI Lighthouse traced CLS 0.147 to IBM Plex Sans swapping in after first paint.
    const html = readFileSync("dist/index.html", "utf8");
    const preloaded = [...html.matchAll(/rel="preload" href="([^"]+\.woff2)"/g)].map((m) => m[1]);
    for (const name of [
      "big-shoulders-display-latin-wght-normal",
      "ibm-plex-sans-latin-400-normal",
      "ibm-plex-sans-latin-500-normal",
      "ibm-plex-sans-latin-600-normal",
    ]) {
      expect(
        preloaded.some((u) => u.includes(name)),
        name,
      ).toBe(true);
    }
  });

  test("the headline font is preloaded", () => {
    const html = readFileSync("dist/index.html", "utf8");
    const preload = html.match(/<link[^>]+rel="preload"[^>]*>/g) ?? [];
    const font = preload.find((l) => /big-shoulders-display-latin-wght-normal[^"]*\.woff2/.test(l));
    expect(font, "preload link for the Big Shoulders latin woff2").toBeTruthy();
    expect(font).toMatch(/as="font"/);
    expect(font).toMatch(/type="font\/woff2"/);
    expect(font).toMatch(/crossorigin/);
  });
});

describe("résumé", () => {
  test("no custom print layout: the résumé is the owner's PDF", () => {
    const html = readFileSync("dist/index.html", "utf8");
    expect(html).not.toMatch(/@media\s+print/);
    expect(existsSync("dist/resume.pdf")).toBe(true);
  });
});
