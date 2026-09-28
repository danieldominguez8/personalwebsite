import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, expect, test } from "vitest";
import Skills from "../../src/components/Skills.astro";
import About from "../../src/components/About.astro";
import Contact from "../../src/components/Contact.astro";
import { skills } from "../../src/data/skills";
import { profile } from "../../src/data/profile";

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

test("Skills renders a definition list in data order", async () => {
  const html = await container.renderToString(Skills);
  expect(html).toContain('id="skills"');
  expect(html.match(/<dt\b/g)).toHaveLength(skills.length);
  const positions = skills.map((s) => html.indexOf(s.group.replace("&", "&amp;")));
  expect(positions.every((i) => i > -1)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  expect(html).toContain(skills[0].items.join(", "));
});

test("About shows the photo lazily and every paragraph", async () => {
  const html = await container.renderToString(About);
  expect(html).toContain('id="about"');
  expect(html).toMatch(/<img[^>]*loading="lazy"/);
  for (const p of profile.about) expect(html).toContain(p.replace("'", "&#39;"));
});

test("Contact has heading, note, and mailto", async () => {
  const html = await container.renderToString(Contact);
  expect(html).toContain('id="contact"');
  expect(html).toContain("Let's talk.");
  expect(html).toContain(`href="mailto:${profile.email}"`);
});
