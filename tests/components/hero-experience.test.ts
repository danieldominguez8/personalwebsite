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
    expect(html).toMatch(new RegExp(`class="title"[^>]*>${profile.title}<`));
    expect(html).toMatch(new RegExp(`class="location"[^>]*>${profile.location}<`));
    expect(html).not.toContain("·");
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
    const text = html.replace(/<[^>]+>/g, "");
    expect(html).toContain('id="experience"');
    expect(html).toContain(">Invoice Cloud<");
    expect(text).toContain("Aug 2022 – Present");
    expect(text).toContain("Dec 2024 – Present");
    expect(text).toContain("Aug 2022 – Nov 2024");
    const bulletCount = companies.flatMap((c) => c.roles.flatMap((r) => r.bullets)).length;
    expect(html.match(/<li\b/g)).toHaveLength(bulletCount);
  });

  test("shows education with year range", async () => {
    const html = await container.renderToString(Experience);
    const text = html.replace(/<[^>]+>/g, "");
    expect(html).toContain("Drexel University");
    expect(html).toContain("M.S., Software Engineering");
    expect(text).toContain("2020 – 2022");
  });

  test("each date is its own machine-readable <time>", async () => {
    const html = await container.renderToString(Experience);
    expect(html).toMatch(/<time datetime="2022-08"[^>]*>Aug 2022<\/time>/);
    expect(html).toMatch(/<time datetime="2024-11"[^>]*>Nov 2024<\/time>/);
    expect(html).toMatch(/<time datetime="2024-12"[^>]*>Dec 2024<\/time>/);
    expect(html).not.toMatch(/<time[^>]*>[^<]*–/);
  });
});
