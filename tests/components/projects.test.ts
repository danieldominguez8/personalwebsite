import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, test } from "vitest";
import Projects from "../../src/components/Projects.astro";
import ProjectCard from "../../src/components/ProjectCard.astro";
import ProjectRow from "../../src/components/ProjectRow.astro";
import { projects } from "../../src/data/projects";

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});
const byName = (n: string) => projects.find((p) => p.name === n)!;

describe("Projects section", () => {
  test("renders every project once, cards before rows", async () => {
    const html = await container.renderToString(Projects);
    expect(html).toContain('id="projects"');
    const order = projects.map((p) => html.indexOf(`>${p.name}<`));
    expect(order.every((i) => i > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(html.match(/<article\b/g)).toHaveLength(projects.length);
  });
});

describe("ProjectCard", () => {
  test("shows figure, role line, image, stack, and links", async () => {
    const p = byName("Lotería Tradicional");
    const html = await container.renderToString(ProjectCard, { props: { project: p } });
    expect(html).toContain(">30,000+ downloads<");
    expect(html).toContain("Personal project · 2020 – Present");
    expect(html).toContain(p.stack.join(" · "));
    expect(html).toMatch(/<img[^>]*loading="lazy"/);
    expect(html).toContain(`alt="${p.image!.alt}"`);
    expect(html).toContain(">App Store<");
  });

  test("omits figure and link list when absent", async () => {
    const html = await container.renderToString(ProjectCard, {
      props: { project: byName("FreeTogether") },
    });
    expect(html).not.toContain('class="figure"');
    expect(html).not.toContain('class="links"');
    expect(html).toContain("Personal project · 2026");
  });
});

describe("ProjectRow", () => {
  test("renders text-only project with optional link", async () => {
    const withLink = await container.renderToString(ProjectRow, {
      props: { project: byName("dannydominguez.dev") },
    });
    expect(withLink).toContain("Personal project · 2022 – Present");
    expect(withLink).toContain('href="https://github.com/danieldominguez8/personalwebsite"');
    expect(withLink).not.toContain("<img");

    const noLink = await container.renderToString(ProjectRow, {
      props: { project: byName("Rally Competitions") },
    });
    expect(noLink).toContain("Founder · 2026");
    expect(noLink).not.toContain("<a ");
  });

  test("external links carry rel=noopener", async () => {
    const html = await container.renderToString(ProjectRow, {
      props: { project: byName("Conversational Agent") },
    });
    expect(html).toMatch(/rel="noopener"/);
  });
});
