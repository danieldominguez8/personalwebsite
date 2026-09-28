import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, test } from "vitest";
import Header from "../../src/components/Header.astro";
import Footer from "../../src/components/Footer.astro";

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

describe("Header", () => {
  test("badge links home and nav points at every section", async () => {
    const html = await container.renderToString(Header);
    expect(html).toMatch(/<a href="\/" class="brand"/);
    expect(html).toContain(">DD<");
    for (const id of ["experience", "projects", "skills", "about"]) {
      expect(html).toContain(`href="/#${id}"`);
    }
    expect(html).toMatch(/<a[^>]*href="\/resume\.pdf"[^>]*>\s*Resume\s*<\/a>/);
    expect(html).toContain('aria-label="Sections"');
  });
});

describe("Footer", () => {
  test("has copyright year and profile links", async () => {
    const html = await container.renderToString(Footer);
    expect(html).toContain(`© ${new Date().getFullYear()} Danny Dominguez`);
    expect(html).toContain('href="https://github.com/danieldominguez8"');
    expect(html).toContain('href="https://www.linkedin.com/in/dannyddominguez/"');
    expect(html).toContain('href="/resume.pdf"');
  });
});
