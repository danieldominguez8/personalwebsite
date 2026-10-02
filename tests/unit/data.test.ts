import { describe, test, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { profile } from "../../src/data/profile";
import { companies, education } from "../../src/data/experience";
import { projects } from "../../src/data/projects";
import { skills } from "../../src/data/skills";
import { dateKey } from "../../src/lib/dates";

const all = { profile, companies, education, projects, skills };
const publicPath = (src: string) => join(process.cwd(), "public", src);

describe("content data", () => {
  test("no placeholder text anywhere", () => {
    expect(JSON.stringify(all)).not.toMatch(/\[[A-Z][A-Z ]+\]|TODO|lorem/i);
  });

  test("every image exists on disk and has alt text", () => {
    const images = [
      profile.headshot,
      profile.photo,
      ...projects.flatMap((p) => (p.image ? [p.image] : [])),
    ];
    for (const img of images) {
      expect(existsSync(publicPath(img.src)), img.src).toBe(true);
      expect(img.alt.trim().length).toBeGreaterThan(10);
    }
  });

  test("resume file exists", () => {
    expect(existsSync(publicPath(profile.resume))).toBe(true);
  });

  test("date ranges run forward and only current items say present", () => {
    for (const c of companies) {
      expect(dateKey(c.start) <= dateKey(c.end)).toBe(true);
      for (const r of c.roles) {
        expect(dateKey(r.start) <= dateKey(r.end)).toBe(true);
        expect(dateKey(r.start) >= dateKey(c.start)).toBe(true);
      }
      expect(c.roles.filter((r) => r.end === "present").length).toBeLessThanOrEqual(1);
    }
  });

  test("roles are listed newest first", () => {
    for (const c of companies) {
      const keys = c.roles.map((r) => dateKey(r.start));
      expect(keys).toEqual([...keys].sort().reverse());
    }
  });

  test("project order and presentation match the canvas", () => {
    expect(projects.map((p) => p.name)).toEqual([
      "Lotería Tradicional",
      "FreeTogether",
      "Rally Competitions",
      "dannydominguez.dev",
      "Conversational Agent",
    ]);
    expect(projects.filter((p) => p.layout === "card").map((p) => p.name)).toEqual([
      "Lotería Tradicional",
      "FreeTogether",
    ]);
    expect(projects.filter((p) => p.layout === "card").every((p) => p.image)).toBe(true);
  });

  test("project links match what the owner asked for", () => {
    const links = Object.fromEntries(
      projects.map((p) => [p.name, p.links.map((l) => `${l.label} ${l.url}`)]),
    );
    expect(links["Lotería Tradicional"]).toEqual([
      "App Store https://apps.apple.com/us/app/loter%C3%ADa-tradicional/id1612279702",
      "Google Play https://play.google.com/store/apps/details?id=com.loteriadominguez",
    ]);
    expect(links["FreeTogether"]).toEqual([
      "App Store https://apps.apple.com/us/app/free-together/id6760777597",
    ]);
    expect(links["Rally Competitions"]).toEqual(["Website https://www.rallycompetitions.com"]);
    expect(links["dannydominguez.dev"]).toEqual([
      "Website https://www.dannydominguez.dev",
      "GitHub https://github.com/danieldominguez8/personalwebsite",
    ]);
  });

  test("the capstone keeps its original screenshot", () => {
    const agent = projects.find((p) => p.name === "Conversational Agent")!;
    expect(agent.image?.src).toBe("/images/conversational-agent.png");
    expect(agent.layout).toBe("row");
  });

  test("key copy matches the approved canvas", () => {
    expect(profile.headline).toBe(
      "I build reliable payment platforms and backend services in .NET and Azure.",
    );
    expect(profile.title).toBe("Software Engineer II at Invoice Cloud");
    expect(profile.location).toBe("McAllen, TX");
    expect(skills.map((s) => s.group)).toEqual([
      "Backend & APIs",
      "Payments",
      "Languages",
      "AI & automation",
      "Cloud & delivery",
      "Databases",
      "Testing",
    ]);
    expect(skills.find((s) => s.group === "Languages")!.items).toContain("Visual Basic");
  });
});
