import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, test } from "vitest";
import Hero from "../../src/components/Hero.astro";
import Experience from "../../src/components/Experience.astro";
import { profile } from "../../src/data/profile";
import { companies } from "../../src/data/experience";

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

describe("Hero", () => {
  test("renders identity, headline, and every call to action", async () => {
    const html = await container.renderToString(Hero);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(profile.headline);
    expect(html).toContain(`${profile.title} · ${profile.location}`);
    expect(html).toContain(profile.intro);
    expect(html).toContain(profile.availability);
    expect(html).toMatch(/href="\/resume\.pdf"[^>]*>\s*Download resume/);
    expect(html).toContain(`href="mailto:${profile.email}"`);
    expect(html).toContain(`href="${profile.github}"`);
    expect(html).toContain(`href="${profile.linkedin}"`);
  });

  test("headshot is eager, sized, and described", async () => {
    const html = await container.renderToString(Hero);
    const img = html.match(/<img[^>]*headshot[^>]*>/)?.[0] ?? "";
    expect(img).toContain('alt="Portrait of Danny Dominguez"');
    expect(img).toContain('width="240"');
    expect(img).toContain('height="240"');
    expect(img).not.toContain('loading="lazy"');
  });
});

describe("Experience", () => {
  test("groups roles under the company with formatted dates", async () => {
    const html = await container.renderToString(Experience);
    expect(html).toContain('id="experience"');
    expect(html).toContain(">Invoice Cloud<");
    expect(html).toContain("Aug 2022 – Present");
    expect(html).toContain("Dec 2024 – Present");
    expect(html).toContain("Aug 2022 – Nov 2024");
    const bulletCount = companies.flatMap((c) => c.roles.flatMap((r) => r.bullets)).length;
    expect(html.match(/<li\b/g)).toHaveLength(bulletCount);
  });

  test("shows education with year range", async () => {
    const html = await container.renderToString(Experience);
    expect(html).toContain("Drexel University");
    expect(html).toContain("M.S., Software Engineering");
    expect(html).toContain("2020 – 2022");
  });

  test("dates are machine readable", async () => {
    const html = await container.renderToString(Experience);
    expect(html).toMatch(/<time datetime="2024-12"[\s>]/);
  });
});
