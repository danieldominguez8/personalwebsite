# dannydominguez.dev Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Create React App site with a static Astro 7 site that matches the approved Claude Design canvas, backed by a layered automated test suite, deployed through the existing AWS Amplify app.

**Architecture:** One Astro page composed of small section components. All copy lives in typed data files under `src/data/`, validated by Zod schemas. Components only render data. Images are pre-optimized JPEGs served from `public/images/` with explicit width/height. No client-side JavaScript framework.

**Tech Stack:** Astro 7.3.5, TypeScript 6 (required by `@astrojs/check` 0.9.10), Zod 4.6.5, Vitest 5.0.2 with Astro's `experimental_AstroContainer`, Playwright 1.63.0 (+ `@axe-core/playwright` 4.13.0), html-validate 11.16.1, linkinator 8.1.0, Lighthouse CI 0.15.1, ESLint 10 + eslint-plugin-astro 3.2.1, Prettier 3.9.9 + prettier-plugin-astro 1.1.0, self-hosted fonts via `@fontsource-variable/newsreader` 5.3.0 and `@fontsource/ibm-plex-sans` 5.3.0. Node 24 (local is 24.21.0; Astro needs ≥ 22.12, html-validate ≥ 22.22).

**Spec:** `docs/superpowers/specs/2026-09-28-site-redesign-design.md` (commit `28f150d`). Visual source of truth: `.superpowers/design-canvas/project/Main.dc.html` (desktop 1280) and `Mobile.dc.html` (phone 390), mirrored at https://claude.ai/artifact/Hep6tziYybVXnz6B8hwD6c (version 11). When copy in this plan and the canvas differ, the canvas wins.

## Global Constraints

- Work on branch `redesign`. Never push to `main` until Task 10's merge step, and only with the owner's explicit yes (a push to `main` deploys production).
- Colors (exact): ground `#FAFAF7`, surface `#FFFFFF`, text `#1A1A1A`, body `#3A3A3A`, secondary `#4A4A4A`, muted `#6B6B6B`, rule `#E3E1DA`, accent `#1E3A8A`.
- Fonts: Newsreader for h1, h2, company/school names (h3 in Experience), project figures; IBM Plex Sans for everything else. Never Inter/Roboto/Arial.
- Content column 760px wide on desktop; 20px side padding on phones; section padding 56px desktop / 36px phone; in-section gap 32px / 24px.
- No inline `style=""` attributes and no client `<script>` in the shipped HTML (keeps CSP-friendly and html-validate clean).
- Every `<img>` has non-empty `alt`, `width`, `height`, and (except the hero headshot) `loading="lazy"`.
- Resume lives at the stable URL `/resume.pdf`.
- Google Play link and Rally link are deliberately absent (spec follow-ups). FreeTogether has no link.
- Commit after every task with a Conventional-Commit subject and the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- npm 11.19 blocks dependency install scripts by default; that is fine here (esbuild works without its postinstall — verified in a spike). Do not run `npm install-scripts approve`.

## Review Focus

1. **Content drift from the canvas** — a reviewer comparing the built page to the canvas should find the same words. Pinned by Task 2's snapshot of key strings and Task 8's visual baselines reviewed against the canvas.
2. **Very narrow screens (320px) and long unbroken text** (the email address, "J.P. Morgan Commerce Platform") — expect wrapping, never horizontal scroll. Pinned in Task 7's responsive test at 320px and the `overflow-wrap: anywhere` rule in Task 3.
3. **Keyboard-only visitor** — expect the skip link first, then every link reachable with a visible focus ring. Pinned in Task 7's keyboard test.
4. **Old resume links in the wild** (`/static/media/danny_dominguez_resume.<hash>.pdf` from the CRA site) — expect a 301 to `/resume.pdf`. Pinned in Task 10's production smoke test.
5. **Unknown URL** (`/anything`) — expect a real 404 status with a helpful page, not the home page with 200. Pinned in Task 8's 404 test and Task 10's smoke test.

---

## File Structure

```
astro.config.mjs            site URL, static output
tsconfig.json               extends astro/tsconfigs/strict
vitest.config.ts            getViteConfig wrapper (Astro-aware)
playwright.config.ts        e2e + visual projects, preview webServer
lighthouserc.json           Lighthouse CI budgets
.htmlvalidate.json          HTML validation rules
eslint.config.js, .prettierrc, .prettierignore, .nvmrc
amplify.yml                 Amplify build settings (npm ci, build, dist/)
.github/workflows/ci.yml    all gates on push/PR
public/
  resume.pdf, favicon.ico, favicon.svg, logo192.png, logo512.png, robots.txt
  images/headshot.jpg, danny.jpg, loteria.jpg, freetogether.jpg
src/
  lib/dates.ts              formatRange()
  data/schema.ts            Zod schemas + types
  data/profile.ts, experience.ts, projects.ts, skills.ts
  styles/global.css         tokens, base, focus, skip link
  layouts/Base.astro        <head>, fonts, header, footer, skip link
  components/Header.astro, Hero.astro, Experience.astro, Projects.astro,
             ProjectCard.astro, ProjectRow.astro, Skills.astro, About.astro,
             Contact.astro, Footer.astro
  pages/index.astro, 404.astro
tests/
  unit/dates.test.ts, data.test.ts
  components/*.test.ts
  html/dist.test.ts
e2e/
  navigation.spec.ts, responsive.spec.ts, a11y.spec.ts, visual.spec.ts, smoke.spec.ts
scripts/check-external-links.mjs
```

Removed: `src/App.js`, `src/App.css`, `src/App.test.js`, `src/index.js`, `src/index.css`, `src/logo.svg`, `src/reportWebVitals.js`, `src/setupTests.js`, `src/assets/`, `public/index.html`, `public/manifest.json` (replaced), `package-lock.json` (regenerated).

---

### Task 1: Scaffold Astro on the `redesign` branch

**Files:**

- Delete: the CRA files listed under "Removed" above
- Create: `package.json` (rewrite), `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `.nvmrc`, `src/pages/index.astro` (temporary), `tests/unit/smoke.test.ts` (temporary, deleted in Task 2)
- Move: `src/assets/files/danny_dominguez_resume.pdf` → `public/resume.pdf`
- Modify: `.gitignore`

**Interfaces:**

- Produces: npm scripts used by every later task — `dev`, `build`, `preview`, `check`, `lint`, `format:check`, `test`, `test:e2e`, `test:visual`, `validate:html`, `links`, `lhci`, `test:all`.

- [ ] **Step 1: Confirm starting point**

Run: `git -C /Users/dangy/repos/personalwebsite branch --show-current && git -C /Users/dangy/repos/personalwebsite log --oneline -1`
Expected: `redesign` and `28f150d Spec: add site as a project, expand testing strategy` (or a later plan commit).

- [ ] **Step 2: Remove CRA files and move the resume**

```bash
cd /Users/dangy/repos/personalwebsite
git mv src/assets/files/danny_dominguez_resume.pdf public/resume.pdf
git rm -q -r src/App.js src/App.css src/App.test.js src/index.js src/index.css src/logo.svg src/reportWebVitals.js src/setupTests.js src/assets public/index.html public/manifest.json package-lock.json
rm -rf node_modules build
```

- [ ] **Step 3: Write `package.json`**

```json
{
  "name": "personalwebsite",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.22.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview --port 4321",
    "check": "astro check",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:e2e": "playwright test --project=chromium --project=firefox --project=webkit",
    "test:visual": "playwright test --project=visual",
    "validate:html": "html-validate \"dist/**/*.html\"",
    "links": "linkinator dist --recurse --skip \"^https?://(?!localhost)\"",
    "links:external": "node scripts/check-external-links.mjs",
    "lhci": "lhci autorun",
    "test:all": "npm run check && npm run lint && npm run format:check && npm test && npm run build && npm run validate:html && npm run links && npm run test:e2e && npm run lhci"
  }
}
```

- [ ] **Step 4: Install dependencies at pinned versions**

```bash
npm install astro@7.3.5 @fontsource-variable/newsreader@5.3.0 @fontsource/ibm-plex-sans@5.3.0
npm install -D @astrojs/check@0.9.10 typescript@6 zod@4.6.5 vitest@5.0.2 @playwright/test@1.63.0 @axe-core/playwright@4.13.0 html-validate@11.16.1 linkinator@8.1.0 @lhci/cli@0.15.1 eslint@10 eslint-plugin-astro@3.2.1 typescript-eslint prettier@3.9.9 prettier-plugin-astro@1.1.0
```

Expected: completes; npm may print an `install-scripts` notice — ignore it (see Global Constraints).

- [ ] **Step 5: Config files**

`astro.config.mjs`:

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.dannydominguez.dev",
  output: "static",
  build: { inlineStylesheets: "auto" },
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", ".superpowers"]
}
```

`vitest.config.ts`:

```ts
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: { include: ["tests/**/*.test.ts"] },
});
```

`eslint.config.js`:

```js
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "dist/",
      ".astro/",
      ".superpowers/",
      "playwright-report/",
      "test-results/",
      ".lighthouseci/",
    ],
  },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
];
```

`.prettierrc`:

```json
{ "plugins": ["prettier-plugin-astro"], "printWidth": 100 }
```

`.prettierignore`:

```
dist
.astro
.superpowers
node_modules
package-lock.json
playwright-report
test-results
.lighthouseci
e2e/**/*-snapshots
public
```

`.nvmrc`:

```
24
```

Append to `.gitignore`:

```
# astro / test output
dist/
.astro/
playwright-report/
test-results/
.lighthouseci/
```

- [ ] **Step 6: Temporary page and smoke test**

`src/pages/index.astro`:

```astro
---
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Danny Dominguez</title>
  </head>
  <body>
    <h1>Danny Dominguez</h1>
  </body>
</html>
```

`tests/unit/smoke.test.ts`:

```ts
import { test, expect } from "vitest";
test("toolchain runs", () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 7: Verify every static gate runs**

Run: `npm run check && npm run lint && npm run format && npm run format:check && npm test && npm run build && ls dist`
Expected: `astro check` reports 0 errors; lint clean; format check passes; `1 passed`; build completes; `dist` contains `index.html` and `resume.pdf`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: replace Create React App with Astro 7 scaffold

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Content data, schemas, and date formatting

**Files:**

- Create: `src/lib/dates.ts`, `src/data/schema.ts`, `src/data/profile.ts`, `src/data/experience.ts`, `src/data/projects.ts`, `src/data/skills.ts`, `public/images/*.jpg`
- Test: `tests/unit/dates.test.ts`, `tests/unit/data.test.ts`
- Delete: `tests/unit/smoke.test.ts`

**Interfaces:**

- Produces:
  - `formatRange(start: string, end?: string): string` — `start`/`end` are `"YYYY"` or `"YYYY-MM"` or `"present"`; returns e.g. `"Dec 2024 – Present"`, `"2020 – 2022"`, `"2026"` (no end), en dash with spaces.
  - Types `Profile`, `Company`, `Role`, `Education`, `Project`, `SkillGroup`, `ImageRef` from `src/data/schema.ts`, plus schemas `profileSchema`, `experienceSchema`, `educationSchema`, `projectsSchema`, `skillsSchema`.
  - Named exports: `profile` (`src/data/profile.ts`), `companies` and `education` (`src/data/experience.ts`), `projects` (`src/data/projects.ts`), `skills` (`src/data/skills.ts`). Each is already parsed through its schema at import time.

- [ ] **Step 1: Write the failing date tests**

`tests/unit/dates.test.ts`:

```ts
import { describe, test, expect } from "vitest";
import { formatRange } from "../../src/lib/dates";

describe("formatRange", () => {
  test("month precision with present", () => {
    expect(formatRange("2024-12", "present")).toBe("Dec 2024 – Present");
  });
  test("month precision closed range", () => {
    expect(formatRange("2022-08", "2024-11")).toBe("Aug 2022 – Nov 2024");
  });
  test("year precision", () => {
    expect(formatRange("2020", "2022")).toBe("2020 – 2022");
  });
  test("single year when no end", () => {
    expect(formatRange("2026")).toBe("2026");
  });
  test("rejects malformed input", () => {
    expect(() => formatRange("Dec 2024")).toThrow(/invalid date/i);
    expect(() => formatRange("2024-13")).toThrow(/invalid date/i);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `rm tests/unit/smoke.test.ts && npx vitest run tests/unit/dates.test.ts`
Expected: FAIL — cannot resolve `../../src/lib/dates`.

- [ ] **Step 3: Implement `src/lib/dates.ts`**

```ts
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const DATE_PATTERN = /^\d{4}(-(0[1-9]|1[0-2]))?$/;

function formatOne(value: string): string {
  if (value === "present") return "Present";
  if (!DATE_PATTERN.test(value)) throw new Error(`Invalid date: ${value}`);
  const [year, month] = value.split("-");
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
}

export function formatRange(start: string, end?: string): string {
  if (start === "present") throw new Error("Invalid date: start cannot be present");
  const from = formatOne(start);
  return end === undefined ? from : `${from} – ${formatOne(end)}`;
}

/** Sortable key: "present" sorts after everything. */
export function dateKey(value: string): string {
  return value === "present" ? "9999-99" : value.length === 4 ? `${value}-00` : value;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run tests/unit/dates.test.ts`
Expected: 5 passed.

- [ ] **Step 5: Prepare images**

```bash
cd /Users/dangy/repos/personalwebsite
mkdir -p public/images
cp .superpowers/headshot.jpg public/images/headshot.jpg
git show cc72886:src/assets/images/danny.jpg > public/images/danny.jpg
sips -Z 1400 -s format jpeg -s formatOptions 80 ../swiftLoteria/Marketing/appstore/01.png --out public/images/loteria.jpg
sips -Z 1400 -s format jpeg -s formatOptions 80 ../FreeTogether/FreeTogetherTests/Snapshots/__Snapshots__/CalendarScreenSnapshotTests/testCalendarWithSelectedDay.1.png --out public/images/freetogether.jpg
sips -g pixelWidth -g pixelHeight public/images/*.jpg
```

Expected dimensions (record the actual numbers printed; use them in the data files): headshot 240×240, danny 1096×1500, loteria ≈ 646×1400, freetogether ≈ 647×1400. If loteria/freetogether differ, use the printed values.

- [ ] **Step 6: Write the failing data tests**

`tests/unit/data.test.ts`:

```ts
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
    expect(projects.every((p) => (p.layout === "card") === Boolean(p.image))).toBe(true);
  });

  test("deliberately link-free projects stay link-free", () => {
    const byName = Object.fromEntries(projects.map((p) => [p.name, p]));
    expect(byName["FreeTogether"].links).toEqual([]);
    expect(byName["Rally Competitions"].links).toEqual([]);
    expect(byName["Lotería Tradicional"].links.map((l) => l.label)).toEqual(["App Store"]);
    expect(JSON.stringify(projects)).not.toMatch(/play\.google\.com|rallycompetitions\.com/);
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
```

- [ ] **Step 7: Run to verify failure**

Run: `npx vitest run tests/unit/data.test.ts`
Expected: FAIL — cannot resolve `../../src/data/profile`.

- [ ] **Step 8: Write `src/data/schema.ts`**

```ts
import { z } from "zod";
import { DATE_PATTERN } from "../lib/dates";

const date = z.string().regex(DATE_PATTERN, "YYYY or YYYY-MM");
const dateOrPresent = z.union([date, z.literal("present")]);
const httpsUrl = z.url().refine((u) => u.startsWith("https://"), "must be https");
const text = z.string().trim().min(1);

export const imageSchema = z.object({
  src: z.string().startsWith("/images/"),
  alt: text,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const profileSchema = z.object({
  name: text,
  title: text,
  location: text,
  headline: text,
  intro: text,
  availability: text,
  email: z.email(),
  github: httpsUrl,
  linkedin: httpsUrl,
  resume: z.literal("/resume.pdf"),
  headshot: imageSchema,
  photo: imageSchema,
  about: z.array(text).min(1),
  contactNote: text,
});

export const roleSchema = z.object({
  title: text,
  start: date,
  end: dateOrPresent,
  bullets: z.array(text).min(1),
});

export const companySchema = z.object({
  company: text,
  start: date,
  end: dateOrPresent,
  roles: z.array(roleSchema).min(1),
});
export const experienceSchema = z.array(companySchema).min(1);

export const educationSchema = z.array(
  z.object({ school: text, degree: text, start: date, end: date }),
);

export const projectSchema = z.object({
  name: text,
  role: text,
  start: date,
  end: dateOrPresent.optional(),
  description: text,
  stack: z.array(text).min(1),
  figure: text.optional(),
  image: imageSchema.optional(),
  layout: z.enum(["card", "row"]),
  links: z.array(z.object({ label: text, url: httpsUrl })),
});
export const projectsSchema = z.array(projectSchema).min(1);

export const skillsSchema = z.array(z.object({ group: text, items: z.array(text).min(1) })).min(1);

export type ImageRef = z.infer<typeof imageSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Company = z.infer<typeof companySchema>;
export type Education = z.infer<typeof educationSchema>[number];
export type Project = z.infer<typeof projectSchema>;
export type SkillGroup = z.infer<typeof skillsSchema>[number];
```

- [ ] **Step 9: Write the data files (copy verbatim from the canvas)**

`src/data/profile.ts`:

```ts
import { profileSchema } from "./schema";

export const profile = profileSchema.parse({
  name: "Danny Dominguez",
  title: "Software Engineer II at Invoice Cloud",
  location: "McAllen, TX",
  headline: "I build reliable payment platforms and backend services in .NET and Azure.",
  intro:
    "Four years shipping payment APIs, modernizing legacy .NET services, and building AI-assisted tooling that speeds up how my team works.",
  availability: "Open to new roles.",
  email: "dominguezdanieldev@gmail.com",
  github: "https://github.com/danieldominguez8",
  linkedin: "https://www.linkedin.com/in/dannyddominguez/",
  resume: "/resume.pdf",
  headshot: {
    src: "/images/headshot.jpg",
    alt: "Portrait of Danny Dominguez",
    width: 240,
    height: 240,
  },
  photo: {
    src: "/images/danny.jpg",
    alt: "Danny Dominguez at the Hoover Dam",
    width: 1096,
    height: 1500,
  },
  about: [
    "I'm based in McAllen, Texas. Coding is my job and also a hobby: I like finding software fixes for everyday problems.",
    "Outside of work I travel, stay active, and spend time with family, friends, and my dog, Todd.",
  ],
  contactNote: "I'm open to new roles, and happy to hear about freelance projects.",
});
```

`src/data/experience.ts`:

```ts
import { educationSchema, experienceSchema } from "./schema";

export const companies = experienceSchema.parse([
  {
    company: "Invoice Cloud",
    start: "2022-08",
    end: "present",
    roles: [
      {
        title: "Software Engineer II",
        start: "2024-12",
        end: "present",
        bullets: [
          "Built a machine-learning fraud and abuse detection service, saving about $90K a month in third-party vendor costs.",
          "Delivered payment APIs, a ledger service, and onboarding for a payment-facilitator platform, cutting processing costs about 50% for participating customers.",
          "Led migration of legacy services to modern .NET, raising transaction throughput 25%.",
          "Built a reusable AI skill that takes work items from grooming to ready-for-testing.",
        ],
      },
      {
        title: "Software Engineer I",
        start: "2022-08",
        end: "2024-11",
        bullets: [
          "Automated on-call diagnostics, cutting time-to-resolution for priority-one incidents 30%.",
          "Improved Azure DevOps CI/CD pipelines, reducing failed deployments 45%.",
          "Refactored legacy Visual Basic and C# applications for testability with NUnit, Moq, and Playwright.",
          "Supported payment and batch systems serving 3,000+ customer organizations.",
        ],
      },
    ],
  },
]);

export const education = educationSchema.parse([
  { school: "Drexel University", degree: "M.S., Software Engineering", start: "2020", end: "2022" },
]);
```

`src/data/projects.ts` (replace `width`/`height` with the numbers printed in Step 5):

```ts
import { projectsSchema } from "./schema";

export const projects = projectsSchema.parse([
  {
    name: "Lotería Tradicional",
    role: "Personal project",
    start: "2020",
    end: "present",
    figure: "30,000+ downloads",
    description:
      "The app is the caller for Lotería, the traditional Mexican bingo game. I first built it in React Native, then rewrote it natively in SwiftUI and Kotlin, adding custom voice profiles you can record and share.",
    stack: ["SwiftUI", "Kotlin", "Jetpack Compose", "React Native"],
    image: {
      src: "/images/loteria.jpg",
      alt: "Lotería home screen with the El Gallo card and Jugar, Tabla, and Voces buttons",
      width: 646,
      height: 1400,
    },
    layout: "card",
    links: [
      {
        label: "App Store",
        url: "https://apps.apple.com/us/app/loter%C3%ADa-tradicional/id1612279702",
      },
    ],
  },
  {
    name: "FreeTogether",
    role: "Personal project",
    start: "2026",
    description:
      "An iOS app for small groups to mark their availability and rank the best dates for trips, reunions, and shared plans.",
    stack: ["SwiftUI", "Firebase", "Cloud Functions"],
    image: {
      src: "/images/freetogether.jpg",
      alt: "FreeTogether group calendar showing each member's availability as colored dots",
      width: 647,
      height: 1400,
    },
    layout: "card",
    links: [],
  },
  {
    name: "Rally Competitions",
    role: "Founder",
    start: "2026",
    description:
      "A platform for functional-fitness competitions: public event pages and organizer tools on the web, a mobile app for athletes and spectators, and one typed API behind both.",
    stack: ["Next.js", "Expo / React Native", "FastAPI", "PostgreSQL", "Docker", "GitLab CI/CD"],
    layout: "row",
    links: [],
  },
  {
    name: "dannydominguez.dev",
    role: "Personal project",
    start: "2022",
    end: "present",
    description:
      "This site: a static Astro build with automated accessibility, visual, and performance checks, deployed on AWS Amplify.",
    stack: ["Astro", "AWS Amplify", "Route 53", "Playwright"],
    layout: "row",
    links: [{ label: "GitHub", url: "https://github.com/danieldominguez8/personalwebsite" }],
  },
  {
    name: "Conversational Agent",
    role: "M.S. capstone, Drexel",
    start: "2021",
    end: "2022",
    description:
      "A chatbot that lets students talk with historical role models, trained on first-person narratives from a custom web scraper.",
    stack: ["React Native", "Dialogflow", "Firebase", "Python"],
    layout: "row",
    links: [
      { label: "GitHub", url: "https://github.com/shaquille-hall/se691-conversational-agent" },
    ],
  },
]);
```

`src/data/skills.ts`:

```ts
import { skillsSchema } from "./schema";

export const skills = skillsSchema.parse([
  {
    group: "Backend & APIs",
    items: [".NET 8", ".NET Framework", "ASP.NET Core", "WCF", "REST", "SOAP"],
  },
  {
    group: "Payments",
    items: [
      "Datacap",
      "Chase Orbital Gateway",
      "J.P. Morgan Commerce Platform",
      "Cybersource",
      "Bluefin",
    ],
  },
  { group: "Languages", items: ["C#", "SQL", "Python", "JavaScript", "Visual Basic"] },
  {
    group: "AI & automation",
    items: ["Claude", "OpenAI Codex", "Cursor", "reusable AI skills", "workflow automation"],
  },
  {
    group: "Cloud & delivery",
    items: [
      "Azure App Service",
      "Functions",
      "Key Vault",
      "Azure DevOps",
      "CI/CD",
      "Git",
      "GitHub",
    ],
  },
  { group: "Databases", items: ["SQL Server", "Oracle", "MySQL"] },
  { group: "Testing", items: ["NUnit", "Moq", "Playwright"] },
]);
```

- [ ] **Step 10: Run all unit tests**

Run: `npm test`
Expected: all dates and data tests pass (13 tests).

- [ ] **Step 11: Prove the schema guards work (then revert)**

Temporarily change `profile.github` to `"http://github.com/x"` and run `npm test`.
Expected: FAIL with a Zod error mentioning `must be https`. Revert the change and re-run: PASS.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: typed content data with schema validation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Design tokens, base layout, header, and footer

**Files:**

- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `public/robots.txt`
- Modify: `src/pages/index.astro`
- Test: `tests/components/layout.test.ts`

**Interfaces:**

- Consumes: `profile` from `src/data/profile.ts`.
- Produces: `Base.astro` with props `{ title: string; description: string; }` and a default slot rendered inside `<main id="main">`. `Header.astro`, `Footer.astro` take no props. CSS custom properties used by later tasks: `--ground --surface --text --body --secondary --muted --rule --accent --font-display --font-body --col --pad-section --gap-section`. Utility classes: `.container`, `.section`, `.section-title`, `.btn`, `.muted`.

- [ ] **Step 1: Write the failing layout test**

`tests/components/layout.test.ts`:

```ts
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
    expect(html).toContain('href="#top"');
    expect(html).toContain(">DD<");
    for (const id of ["experience", "projects", "skills", "about"]) {
      expect(html).toContain(`href="#${id}"`);
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/components/layout.test.ts`
Expected: FAIL — cannot resolve `Header.astro`.

- [ ] **Step 3: Write `src/styles/global.css`**

```css
:root {
  --ground: #fafaf7;
  --surface: #ffffff;
  --text: #1a1a1a;
  --body: #3a3a3a;
  --secondary: #4a4a4a;
  --muted: #6b6b6b;
  --rule: #e3e1da;
  --accent: #1e3a8a;
  --font-display: "Newsreader Variable", Georgia, serif;
  --font-body: "IBM Plex Sans", system-ui, sans-serif;
  --col: 760px;
  --pad-section: 56px;
  --gap-section: 32px;
}

@media (max-width: 767px) {
  :root {
    --pad-section: 36px;
    --gap-section: 24px;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

body {
  margin: 0;
  background: var(--ground);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3,
h4,
p,
ul,
dl,
dd {
  margin: 0;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

a {
  color: inherit;
}

a:hover {
  color: var(--accent);
}

a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}

p,
li,
dd,
a {
  overflow-wrap: anywhere;
}

.container {
  width: min(var(--col), 100% - 40px);
  margin-inline: auto;
}

.section {
  border-top: 1px solid var(--rule);
  padding-block: var(--pad-section);
  display: flex;
  flex-direction: column;
  gap: var(--gap-section);
}

.section-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(28px, 4vw, 32px);
  line-height: 1.15;
}

.btn {
  display: inline-block;
  background: var(--text);
  color: #ffffff;
  text-decoration: none;
  border-radius: 999px;
  padding: 12px 22px;
  font-weight: 500;
}

.btn:hover {
  color: #ffffff;
  background: var(--accent);
}

.muted {
  color: var(--muted);
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 12px;
  z-index: 10;
  background: var(--surface);
  padding: 8px 12px;
}

.skip-link:focus {
  left: 16px;
}
```

- [ ] **Step 4: Write `Header.astro` and `Footer.astro`**

`src/components/Header.astro`:

```astro
---
import { profile } from "../data/profile";
const sections = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "about", label: "About" },
];
---

<header class="site-header">
  <div class="container bar">
    <a href="#top" class="brand">
      <span class="badge" aria-hidden="true">
        DD
      </span>
      <span>{profile.name}</span>
    </a>
    <nav aria-label="Sections">
      <ul>
        {sections.map((s) => (
          <li class="nav-link">
            <a href={`#${s.id}`}>{s.label}</a>
          </li>
        ))}
        <li>
          <a class="btn btn-small" href={profile.resume}>
            Resume
          </a>
        </li>
      </ul>
    </nav>
  </div>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 5;
    background: var(--surface);
    border-bottom: 1px solid var(--rule);
  }
  .bar {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    font-weight: 600;
    white-space: nowrap;
  }
  .badge {
    background: var(--accent);
    color: #ffffff;
    border-radius: 7px;
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 700;
  }
  ul {
    list-style: none;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 24px;
    font-size: 15px;
  }
  .nav-link a {
    color: var(--secondary);
    text-decoration: none;
  }
  .btn-small {
    padding: 8px 16px;
  }
  @media (max-width: 767px) {
    .nav-link {
      display: none;
    }
  }
</style>
```

`src/components/Footer.astro`:

```astro
---
import { profile } from "../data/profile";
const year = new Date().getFullYear();
---

<footer class="site-footer">
  <div class="container bar">
    <span>
      © {year} {profile.name}
    </span>
    <ul>
      <li>
        <a href={profile.github}>GitHub</a>
      </li>
      <li>
        <a href={profile.linkedin}>LinkedIn</a>
      </li>
      <li>
        <a href={profile.resume}>Resume</a>
      </li>
    </ul>
  </div>
</footer>

<style>
  .site-footer {
    background: var(--surface);
    border-top: 1px solid var(--rule);
    color: var(--muted);
    font-size: 14px;
  }
  .bar {
    min-height: 64px;
    padding-block: 18px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px 24px;
  }
  ul {
    list-style: none;
    padding: 0;
    display: flex;
    gap: 24px;
  }
  a {
    color: var(--muted);
  }
</style>
```

- [ ] **Step 5: Write `Base.astro`**

```astro
---
import "@fontsource-variable/newsreader";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "../styles/global.css";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";

interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).href;
const ogImage = new URL("/images/headshot.jpg", Astro.site).href;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta name="theme-color" content="#1e3a8a" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/logo192.png" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta name="twitter:card" content="summary" />
  </head>
  <body id="top">
    <a class="skip-link" href="#main">
      Skip to content
    </a>
    <Header />
    <main id="main" class="container">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 6: Use the layout on the page, add robots.txt**

`src/pages/index.astro`:

```astro
---
import Base from "../layouts/Base.astro";
---

<Base
  title="Danny Dominguez — Software Engineer"
  description="Danny Dominguez, software engineer building payment platforms and backend services in .NET and Azure. Experience, projects, skills, and contact."
>
  <h1>Danny Dominguez</h1>
</Base>
```

`public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://www.dannydominguez.dev/sitemap-index.xml
```

(Remove the `Sitemap:` line if Task 9 does not add `@astrojs/sitemap`; Task 9 adds it.)

- [ ] **Step 7: Run tests and gates**

Run: `npx vitest run tests/components/layout.test.ts && npm run check && npm run build`
Expected: 2 passed; check 0 errors; build completes.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: base layout, design tokens, header and footer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Hero and Experience sections

**Files:**

- Create: `src/components/Hero.astro`, `src/components/Experience.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/components/hero-experience.test.ts`

**Interfaces:**

- Consumes: `profile`, `companies`, `education`, `formatRange`.
- Produces: `Hero.astro` (no props), `Experience.astro` (no props; renders `<section id="experience">`).

- [ ] **Step 1: Write the failing tests**

`tests/components/hero-experience.test.ts`:

```ts
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
    expect(html).toContain('<time datetime="2024-12">');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/components/hero-experience.test.ts`
Expected: FAIL — cannot resolve `Hero.astro`.

- [ ] **Step 3: Implement `Hero.astro`**

```astro
---
import { profile } from "../data/profile";
---

<section class="hero" aria-labelledby="hero-title">
  <div class="identity">
    <img
      class="headshot"
      src={profile.headshot.src}
      alt={profile.headshot.alt}
      width={profile.headshot.width}
      height={profile.headshot.height}
      fetchpriority="high"
    />
    <div>
      <p class="name">{profile.name}</p>
      <p class="muted meta">
        {profile.title} · {profile.location}
      </p>
    </div>
  </div>
  <h1 id="hero-title">{profile.headline}</h1>
  <p class="intro">{profile.intro}</p>
  <ul class="actions">
    <li>
      <a class="btn" href={profile.resume}>
        Download resume
      </a>
    </li>
    <li>
      <a href={profile.github}>GitHub</a>
    </li>
    <li>
      <a href={profile.linkedin}>LinkedIn</a>
    </li>
    <li>
      <a href={`mailto:${profile.email}`}>Email</a>
    </li>
  </ul>
  <p class="muted meta">{profile.availability}</p>
</section>

<style>
  .hero {
    padding-block: 96px 80px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .identity {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .headshot {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--rule);
    flex-shrink: 0;
  }
  .name {
    font-size: 22px;
    font-weight: 600;
  }
  .meta {
    font-size: 15px;
  }
  h1 {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(36px, 6vw, 58px);
    line-height: 1.08;
    letter-spacing: -0.01em;
  }
  .intro {
    font-size: clamp(17px, 2vw, 19px);
    line-height: 1.65;
    color: var(--secondary);
  }
  .actions {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px 28px;
  }
  .actions a:not(.btn) {
    color: var(--secondary);
  }
  @media (max-width: 767px) {
    .hero {
      padding-block: 40px 36px;
      gap: 18px;
    }
    .identity {
      gap: 14px;
    }
    .headshot {
      width: 64px;
      height: 64px;
    }
    .name {
      font-size: 19px;
    }
  }
</style>
```

- [ ] **Step 4: Implement `Experience.astro`**

```astro
---
import { companies, education } from "../data/experience";
import { formatRange } from "../lib/dates";
---

<section id="experience" class="section" aria-labelledby="experience-title">
  <h2 id="experience-title" class="section-title">
    Experience
  </h2>
  {companies.map((c) => (
    <div class="company">
      <div class="row">
        <h3 class="org">{c.company}</h3>
        <span class="muted when">
          <time datetime={c.start}>{formatRange(c.start, c.end)}</time>
        </span>
      </div>
      {c.roles.map((r) => (
        <div class="role">
          <div class="row">
            <h4>{r.title}</h4>
            <span class="muted when">
              <time datetime={r.start}>{formatRange(r.start, r.end)}</time>
            </span>
          </div>
          <ul>
            {r.bullets.map((b) => (
              <li>{b}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  ))}
  {education.map((e) => (
    <div class="education row">
      <div>
        <h3 class="org">{e.school}</h3>
        <p>{e.degree}</p>
      </div>
      <span class="muted when">
        <time datetime={e.start}>{formatRange(e.start, e.end)}</time>
      </span>
    </div>
  ))}
</section>

<style>
  .company {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 4px 16px;
  }
  .org {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 24px;
  }
  .when {
    font-size: 15px;
  }
  .role {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-left: 20px;
    border-left: 2px solid var(--rule);
  }
  h4 {
    font-size: 17px;
    font-weight: 600;
  }
  ul {
    padding-left: 20px;
    font-size: 16.5px;
    line-height: 1.7;
    color: var(--body);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .education {
    border-top: 1px solid var(--rule);
    padding-top: 24px;
  }
  .education p {
    color: var(--body);
  }
  @media (max-width: 767px) {
    .org {
      font-size: 22px;
    }
    .role {
      padding-left: 14px;
    }
    ul {
      font-size: 16px;
      padding-left: 18px;
    }
  }
</style>
```

Note: the canvas puts the date _under_ the title on phones; `flex-wrap` achieves that when the row runs out of width. The visual baseline in Task 8 confirms it.

- [ ] **Step 5: Compose them on the page**

In `src/pages/index.astro`, replace `<h1>Danny Dominguez</h1>` with:

```astro
<Hero />
<Experience />
```

and add imports:

```astro
import Hero from "../components/Hero.astro"; import Experience from
"../components/Experience.astro";
```

- [ ] **Step 6: Run tests and gates**

Run: `npm test && npm run check && npm run build`
Expected: all pass (layout 2, hero/experience 5, unit 13).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: hero and experience sections

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Projects section

**Files:**

- Create: `src/components/Projects.astro`, `src/components/ProjectCard.astro`, `src/components/ProjectRow.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/components/projects.test.ts`

**Interfaces:**

- Consumes: `projects`, `Project` type, `formatRange`.
- Produces: `ProjectCard.astro` and `ProjectRow.astro`, each with props `{ project: Project }`; `Projects.astro` (no props; renders `<section id="projects">`).

- [ ] **Step 1: Write the failing tests**

`tests/components/projects.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, test } from "vitest";
import Projects from "../../src/components/Projects.astro";
import ProjectCard from "../../src/components/ProjectCard.astro";
import ProjectRow from "../../src/components/ProjectRow.astro";
import { projects } from "../../src/data/projects";
import type { Project } from "../../src/data/schema";

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

  test("external links open safely", async () => {
    const fake: Project = { ...byName("Conversational Agent") };
    const html = await container.renderToString(ProjectRow, { props: { project: fake } });
    expect(html).toMatch(/rel="noopener"/);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/components/projects.test.ts`
Expected: FAIL — cannot resolve `Projects.astro`.

- [ ] **Step 3: Implement `ProjectCard.astro`**

```astro
---
import type { Project } from "../data/schema";
import { formatRange } from "../lib/dates";
interface Props {
  project: Project;
}
const { project: p } = Astro.props;
---

<article class="card">
  {p.image && (
    <img
      src={p.image.src}
      alt={p.image.alt}
      width={p.image.width}
      height={p.image.height}
      loading="lazy"
      decoding="async"
    />
  )}
  <div class="body">
    {p.figure && <p class="figure">{p.figure}</p>}
    <h3>{p.name}</h3>
    <p class="muted small">
      {p.role} · {formatRange(p.start, p.end)}
    </p>
    <p class="desc">{p.description}</p>
    <p class="muted small">{p.stack.join(" · ")}</p>
    {p.links.length > 0 && (
      <ul class="links">
        {p.links.map((l) => (
          <li>
            <a href={l.url} rel="noopener">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
</article>

<style>
  .card {
    background: var(--surface);
    border: 1px solid var(--rule);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    object-position: center 35%;
    border-bottom: 1px solid var(--rule);
  }
  .body {
    padding: 20px 22px 22px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .figure {
    font-family: var(--font-display);
    font-size: 30px;
    line-height: 1;
    color: var(--accent);
  }
  h3 {
    font-size: 19px;
    font-weight: 600;
  }
  .small {
    font-size: 14px;
  }
  .desc {
    font-size: 15.5px;
    line-height: 1.6;
    color: var(--secondary);
  }
  .links {
    list-style: none;
    padding: 0;
    display: flex;
    gap: 18px;
    font-size: 15px;
  }
  .links a {
    color: var(--accent);
  }
  @media (max-width: 767px) {
    img {
      height: 200px;
    }
    .body {
      padding: 18px;
      gap: 8px;
    }
    .figure {
      font-size: 28px;
    }
  }
</style>
```

- [ ] **Step 4: Implement `ProjectRow.astro`**

```astro
---
import type { Project } from "../data/schema";
import { formatRange } from "../lib/dates";
interface Props {
  project: Project;
}
const { project: p } = Astro.props;
---

<article class="row">
  <div class="text">
    <h3>{p.name}</h3>
    <p class="muted small">
      {p.role} · {formatRange(p.start, p.end)}
    </p>
    <p class="desc">{p.description}</p>
    <p class="muted small">{p.stack.join(" · ")}</p>
  </div>
  {p.links.length > 0 && (
    <ul class="links">
      {p.links.map((l) => (
        <li>
          <a href={l.url} rel="noopener">
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  )}
</article>

<style>
  .row {
    background: var(--surface);
    border: 1px solid var(--rule);
    border-radius: 12px;
    padding: 20px 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px 24px;
  }
  .text {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  h3 {
    font-size: 18px;
    font-weight: 600;
  }
  .small {
    font-size: 14px;
  }
  .desc {
    font-size: 15.5px;
    line-height: 1.6;
    color: var(--secondary);
  }
  .links {
    list-style: none;
    padding: 0;
    flex-shrink: 0;
    font-size: 15px;
  }
  .links a {
    color: var(--accent);
  }
  @media (max-width: 767px) {
    .row {
      flex-direction: column;
      align-items: flex-start;
      padding: 18px;
    }
  }
</style>
```

Note: the canvas puts the stack on the role line for desktop rows; this plan uses a separate stack line on all sizes for one consistent component. Mention this to the owner in the Task 8 baseline review; change only if they object.

- [ ] **Step 5: Implement `Projects.astro` and add to the page**

```astro
---
import { projects } from "../data/projects";
import ProjectCard from "./ProjectCard.astro";
import ProjectRow from "./ProjectRow.astro";
const cards = projects.filter((p) => p.layout === "card");
const rows = projects.filter((p) => p.layout === "row");
---

<section id="projects" class="section" aria-labelledby="projects-title">
  <h2 id="projects-title" class="section-title">
    Selected projects
  </h2>
  <div class="grid">
    {cards.map((p) => (
      <ProjectCard project={p} />
    ))}
  </div>
  <div class="rows">
    {rows.map((p) => (
      <ProjectRow project={p} />
    ))}
  </div>
</section>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
  .rows {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  @media (max-width: 767px) {
    .grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
```

In `src/pages/index.astro` add `import Projects from "../components/Projects.astro";` and `<Projects />` after `<Experience />`.

- [ ] **Step 6: Run tests and gates**

Run: `npm test && npm run check && npm run build`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: projects section with cards and rows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Skills, About, Contact, and built-HTML gates

**Files:**

- Create: `src/components/Skills.astro`, `src/components/About.astro`, `src/components/Contact.astro`, `.htmlvalidate.json`
- Modify: `src/pages/index.astro`
- Test: `tests/components/rest.test.ts`, `tests/html/dist.test.ts`

**Interfaces:**

- Consumes: `skills`, `profile`.
- Produces: the complete page; `dist/index.html` consumed by all later gates.

- [ ] **Step 1: Write the failing component tests**

`tests/components/rest.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, test } from "vitest";
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
  expect(html).toContain("Let&#39;s talk.");
  expect(html).toContain(`href="mailto:${profile.email}"`);
});
```

Note: if Astro does not escape `'` as `&#39;` in text nodes, adjust the two `.replace` calls to match the actual output — check with `console.log(html)` once; the assertion is about presence of the text, not escaping style.

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/components/rest.test.ts`
Expected: FAIL — cannot resolve `Skills.astro`.

- [ ] **Step 3: Implement the three components**

`src/components/Skills.astro`:

```astro
---
import { skills } from "../data/skills";
---

<section id="skills" class="section" aria-labelledby="skills-title">
  <h2 id="skills-title" class="section-title">
    Skills
  </h2>
  <dl>
    {skills.map((s) => (
      <div class="item">
        <dt>{s.group}</dt>
        <dd>{s.items.join(", ")}</dd>
      </div>
    ))}
  </dl>
</section>

<style>
  dl {
    display: grid;
    gap: 14px;
    font-size: 16.5px;
    line-height: 1.55;
  }
  .item {
    display: grid;
    grid-template-columns: 190px minmax(0, 1fr);
    gap: 24px;
  }
  dt {
    font-weight: 600;
  }
  dd {
    color: var(--body);
  }
  @media (max-width: 767px) {
    dl {
      font-size: 16px;
    }
    .item {
      grid-template-columns: minmax(0, 1fr);
      gap: 2px;
    }
  }
</style>
```

`src/components/About.astro` (heading, then photo, then text on phones; photo left of heading+text on desktop — matches the canvas):

```astro
---
import { profile } from "../data/profile";
---

<section id="about" class="section about" aria-labelledby="about-title">
  <h2 id="about-title" class="section-title heading">
    About
  </h2>
  <img
    src={profile.photo.src}
    alt={profile.photo.alt}
    width={profile.photo.width}
    height={profile.photo.height}
    loading="lazy"
    decoding="async"
  />
  <div class="text">
    {profile.about.map((p) => (
      <p>{p}</p>
    ))}
  </div>
</section>
```

with this `<style>` block in the same file:

```css
.about {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  grid-template-areas: "img heading" "img text";
  grid-template-rows: auto 1fr;
  column-gap: 40px;
  row-gap: 16px;
}
.heading {
  grid-area: heading;
}
img {
  grid-area: img;
  width: 240px;
  height: 300px;
  object-fit: cover;
  object-position: center 30%;
  border-radius: 12px;
}
.text {
  grid-area: text;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
p {
  font-size: 17px;
  line-height: 1.7;
  color: var(--body);
}
@media (max-width: 767px) {
  .about {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "heading" "img" "text";
    row-gap: 18px;
  }
  img {
    width: 100%;
    height: 300px;
  }
  p {
    font-size: 16px;
  }
}
```

`src/components/Contact.astro`:

```astro
---
import { profile } from "../data/profile";
---

<section id="contact" class="section contact" aria-labelledby="contact-title">
  <h2 id="contact-title" class="title">
    Let's talk.
  </h2>
  <p>{profile.contactNote}</p>
  <a class="email" href={`mailto:${profile.email}`}>
    {profile.email}
  </a>
</section>

<style>
  .contact {
    gap: 16px;
    padding-bottom: 96px;
  }
  .title {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(32px, 5vw, 40px);
    line-height: 1.1;
  }
  p {
    font-size: 17px;
    line-height: 1.7;
    color: var(--body);
  }
  .email {
    font-size: 19px;
    font-weight: 500;
    text-underline-offset: 5px;
    align-self: flex-start;
  }
  @media (max-width: 767px) {
    .contact {
      padding-bottom: 64px;
    }
    .email {
      font-size: 17px;
    }
  }
</style>
```

Add all three to `src/pages/index.astro` after `<Projects />`: `<Skills />`, `<About />`, `<Contact />` (with imports).

- [ ] **Step 4: Run component tests**

Run: `npx vitest run tests/components/rest.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Write the failing built-HTML test**

`tests/html/dist.test.ts`:

```ts
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
```

- [ ] **Step 6: Run to verify it catches problems, then passes**

Run: `npm run build && npx vitest run tests/html/dist.test.ts`
Expected: PASS if Tasks 3–6 are correct. If `no inline styles` fails, Astro inlined component styles as `style` _elements_ (allowed) — the regex only rejects `style="` attributes; fix any real attribute.

- [ ] **Step 7: HTML validation**

`.htmlvalidate.json`:

```json
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "void-style": "off",
    "no-trailing-whitespace": "off"
  }
}
```

Run: `npm run validate:html`
Expected: no errors. Fix markup for any real error; do not disable further rules without writing the reason in this file's commit message.

- [ ] **Step 8: Keep the dist test out of the plain unit run until built**

Change `vitest.config.ts` to:

```ts
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: process.env.WITH_DIST ? [] : ["tests/html/**"],
  },
});
```

and add the script `"test:dist": "WITH_DIST=1 vitest run tests/html"` to `package.json`; update `test:all` to run `npm run test:dist` right after `npm run build`.

- [ ] **Step 9: Run everything so far**

Run: `npm run check && npm run lint && npm run format:check && npm test && npm run build && npm run test:dist && npm run validate:html && npm run links`
Expected: all green; linkinator reports 0 broken internal links.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: skills, about, contact; built-HTML and validation gates

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: End-to-end, responsive, keyboard, and accessibility tests

**Files:**

- Create: `playwright.config.ts`, `e2e/navigation.spec.ts`, `e2e/responsive.spec.ts`, `e2e/a11y.spec.ts`

**Interfaces:**

- Consumes: the built site served by `npm run preview` on port 4321.
- Produces: Playwright projects `chromium`, `firefox`, `webkit` (functional) and `visual` (Task 8).

- [ ] **Step 1: Install browsers**

Run: `npx playwright install chromium firefox webkit`
Expected: downloads complete (several hundred MB, one-time).

- [ ] **Step 2: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:4321";
const external = Boolean(process.env.BASE_URL);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "on-first-retry" },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled" } },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /visual|smoke/ },
    { name: "firefox", use: { ...devices["Desktop Firefox"] }, testIgnore: /visual|smoke/ },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, testIgnore: /visual|smoke/ },
    { name: "visual", use: { ...devices["Desktop Chrome"] }, testMatch: /visual\.spec\.ts/ },
    { name: "smoke", use: { ...devices["Desktop Chrome"] }, testMatch: /smoke\.spec\.ts/ },
  ],
  webServer: external
    ? undefined
    : {
        command: "npm run preview",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
```

- [ ] **Step 3: Write `e2e/navigation.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

let errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/");
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

for (const id of ["experience", "projects", "skills", "about"]) {
  test(`nav link scrolls to #${id}`, async ({ page }) => {
    await page
      .getByRole("navigation", { name: "Sections" })
      .getByRole("link", { name: new RegExp(id, "i") })
      .click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  });
}

test("skip link is the first tab stop and jumps to main", async ({ page }) => {
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("every link is reachable by keyboard with a visible focus ring", async ({ page }) => {
  const linkCount = await page.locator("a[href]").count();
  const seen = new Set<string>();
  for (let i = 0; i < linkCount + 5; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el.tagName !== "A") return null;
      const s = getComputedStyle(el);
      return {
        key: `${el.getAttribute("href")}|${el.textContent?.trim()}`,
        outline: s.outlineStyle,
        width: s.outlineWidth,
      };
    });
    if (!info) continue;
    expect(info.outline, info.key).not.toBe("none");
    expect(parseFloat(info.width), info.key).toBeGreaterThanOrEqual(2);
    seen.add(info.key);
  }
  expect(seen.size).toBe(
    await page.evaluate(
      () =>
        new Set(
          [...document.querySelectorAll("a[href]")].map(
            (a) => `${a.getAttribute("href")}|${a.textContent?.trim()}`,
          ),
        ).size,
    ),
  );
});

test("resume downloads as a PDF", async ({ request }) => {
  const res = await request.get("/resume.pdf");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/pdf");
  expect((await res.body()).subarray(0, 5).toString()).toBe("%PDF-");
});

test("contact and profile links are correct", async ({ page }) => {
  await expect(page.locator('a[href="mailto:dominguezdanieldev@gmail.com"]').first()).toBeVisible();
  await expect(page.locator('a[href="https://github.com/danieldominguez8"]').first()).toBeVisible();
  await expect(
    page.locator('a[href="https://www.linkedin.com/in/dannyddominguez/"]').first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "App Store" })).toHaveAttribute(
    "href",
    /apps\.apple\.com/,
  );
  await expect(page.locator('a[href*="play.google.com"]')).toHaveCount(0);
});
```

- [ ] **Step 4: Write `e2e/responsive.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

const widths = [320, 390, 768, 1024, 1280, 1920];

for (const width of widths) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("no horizontal scroll", async ({ page }) => {
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test("header stays one row", async ({ page }) => {
      await page.goto("/");
      const box = await page.locator(".site-header").boundingBox();
      expect(box!.height).toBeLessThanOrEqual(65);
    });

    test("project grid columns", async ({ page }) => {
      await page.goto("/");
      const cols = await page
        .locator("#projects .grid")
        .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
      expect(cols).toBe(width >= 768 ? 2 : 1);
    });
  });
}

test.describe("phone header", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("hides section links but keeps Resume", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Sections" });
    await expect(nav.getByRole("link", { name: "Experience" })).toBeHidden();
    await expect(nav.getByRole("link", { name: "Resume" })).toBeVisible();
  });
});
```

- [ ] **Step 5: Write `e2e/a11y.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [390, 1280]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test("zero axe violations (WCAG 2.2 AA)", async ({ page }) => {
      await page.goto("/");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  });
}

test("palette text colors meet 4.5:1 on the ground color", async () => {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  for (const fg of ["#1a1a1a", "#3a3a3a", "#4a4a4a", "#6b6b6b", "#1e3a8a"]) {
    expect(ratio(fg, "#fafaf7"), fg).toBeGreaterThanOrEqual(4.5);
  }
});
```

- [ ] **Step 6: Run the suites**

Run: `npm run build && npm run test:e2e`
Expected: all tests pass in chromium, firefox, and webkit. If the keyboard test fails on webkit because Safari skips links on Tab by default, add `test.skip(browserName === "webkit", "Safari tabs to links only with Option+Tab")` to that one test only.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: e2e navigation, responsive, keyboard and axe suites

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Visual regression, 404 page, Lighthouse, and link checks

**Files:**

- Create: `e2e/visual.spec.ts`, `src/pages/404.astro`, `lighthouserc.json`, `scripts/check-external-links.mjs`, `e2e/visual.spec.ts-snapshots/*.png` (generated)
- Modify: `astro.config.mjs` (sitemap), `package.json`

- [ ] **Step 1: Failing 404 test**

Append to `tests/html/dist.test.ts`:

```ts
describe("404 page", () => {
  test("exists, is noindex, and links home", () => {
    const page = readFileSync("dist/404.html", "utf8");
    expect(page).toContain('<meta name="robots" content="noindex"');
    expect(page).toMatch(/<h1[^>]*>Page not found<\/h1>/);
    expect(page).toContain('href="/"');
    expect(page).toContain('href="/resume.pdf"');
  });
});
```

Run: `npm run build && npm run test:dist` → Expected: FAIL (`dist/404.html` missing).

- [ ] **Step 2: Implement `src/pages/404.astro`**

```astro
---
import Base from "../layouts/Base.astro";
---

<Base
  title="Page not found — Danny Dominguez"
  description="This page doesn't exist. Head back to Danny Dominguez's home page or download the resume."
>
  <meta slot="head" name="robots" content="noindex" />
  <section class="notfound">
    <h1>Page not found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <p>
      <a href="/">Back to the home page</a> · <a href="/resume.pdf">Download resume</a>
    </p>
  </section>
</Base>

<style>
  .notfound {
    padding-block: 96px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  h1 {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 48px;
  }
</style>
```

Add a named head slot to `Base.astro` just before `</head>`: `<slot name="head" />`.

Run: `npm run build && npm run test:dist` → Expected: PASS.

- [ ] **Step 3: Sitemap**

```bash
npm install -D @astrojs/sitemap
```

`astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.dannydominguez.dev",
  output: "static",
  build: { inlineStylesheets: "auto" },
  integrations: [sitemap({ filter: (page) => !page.includes("404") })],
});
```

Add to `tests/html/dist.test.ts`:

```ts
test("sitemap lists the home page only", () => {
  const xml = readFileSync("dist/sitemap-0.xml", "utf8");
  expect(xml).toContain("<loc>https://www.dannydominguez.dev/</loc>");
  expect(xml).not.toContain("404");
});
```

Run: `npm run build && npm run test:dist` → PASS.

- [ ] **Step 4: Visual regression spec**

`e2e/visual.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

for (const [name, width, height] of [
  ["phone", 390, 844],
  ["desktop", 1280, 900],
] as const) {
  test(`full page matches baseline — ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`home-${name}.png`, { fullPage: true });
  });
}
```

- [ ] **Step 5: Generate baselines on Linux (matches CI)**

```bash
npm run build
docker run --rm -v "$PWD":/work -v /work/node_modules -w /work mcr.microsoft.com/playwright:v1.63.0-noble \
  bash -lc "npm ci && npx playwright test --project=visual --update-snapshots"
```

Expected: two PNGs under `e2e/visual.spec.ts-snapshots/` with `-linux` in the name.
The anonymous `-v /work/node_modules` volume keeps the container's Linux `node_modules` from overwriting your macOS one. The Playwright `webServer` starts `npm run preview` inside the container, so no port mapping is needed.

- [ ] **Step 6: Owner review of baselines against the canvas (manual gate)**

Open both PNGs next to the canvas (https://claude.ai/artifact/Hep6tziYybVXnz6B8hwD6c). Show them to the owner. List every visible difference, including the known ones: project rows show stack on its own line on desktop (Task 5 note). Only commit baselines the owner accepts; fix and regenerate otherwise.

- [ ] **Step 7: Lighthouse CI**

`lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3,
      "autodiscoverUrlBlocklist": ["/404.html"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 1 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 1 }],
        "resource-summary:total:size": ["error", { "maxNumericValue": 512000 }]
      }
    },
    "upload": { "target": "filesystem", "outputDir": ".lighthouseci" }
  }
}
```

Run: `npm run lhci`
Expected: all assertions pass. If performance < 0.95, first check image sizes in `public/images` (lazy-load, dimensions) before changing budgets.

- [ ] **Step 8: External link report**

`scripts/check-external-links.mjs`:

```js
import { LinkChecker } from "linkinator";

const checker = new LinkChecker();
const result = await checker.check({
  path: "dist",
  recurse: true,
  retry: true,
  retryErrors: true,
  retryErrorsCount: 3,
  timeout: 15000,
  linksToSkip: ["^mailto:", "linkedin\\.com"],
});
const broken = result.links.filter((l) => l.state === "BROKEN" && !l.url.startsWith("file:"));
for (const l of broken) console.log(`BROKEN ${l.status ?? "-"} ${l.url} (on ${l.parent})`);
console.log(`${result.links.length} links checked, ${broken.length} broken`);
process.exitCode = 0; // report-only: external sites are flaky
```

(LinkedIn blocks bots with 999, hence the skip.)
Run: `npm run links:external`
Expected: `0 broken` (App Store, GitHub links resolve).

- [ ] **Step 9: Full local gate**

Run: `npm run test:all && npm run test:visual`
Expected: everything green.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "test: visual baselines, 404 page, sitemap, Lighthouse and link checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: CI workflow and Amplify build settings

**Files:**

- Create: `.github/workflows/ci.yml`, `amplify.yml`

- [ ] **Step 1: Write `amplify.yml`**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm install 24
        - nvm use 24
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

- [ ] **Step 2: Write `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push:
    branches: [main, redesign]
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  static:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - run: npm run check
      - run: npm run lint
      - run: npm run format:check
      - run: npm test
      - run: npm run build
      - run: npm run test:dist
      - run: npm run validate:html
      - run: npm run links
      - run: npm run links:external
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }

  e2e:
    needs: static
    runs-on: ubuntu-latest
    container: mcr.microsoft.com/playwright:v1.63.0-noble
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
      - run: npm run test:visual
      - if: failure()
        uses: actions/upload-artifact@v4
        with: { name: playwright-report, path: playwright-report }

  lighthouse:
    needs: static
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - run: npm run build
      - run: npm run lhci
      - if: always()
        uses: actions/upload-artifact@v4
        with: { name: lighthouse, path: .lighthouseci }
```

- [ ] **Step 3: Validate YAML locally**

Run: `npx --yes yaml-lint amplify.yml .github/workflows/ci.yml`
Expected: both files valid.

- [ ] **Step 4: Commit and push the branch (owner approval already covers pushing `redesign`; it does not deploy production)**

```bash
git add -A
git commit -m "ci: GitHub Actions gates and Amplify build settings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin redesign
```

- [ ] **Step 5: Watch CI**

Run: `gh run watch --exit-status $(gh run list --branch redesign --limit 1 --json databaseId -q '.[0].databaseId')`
Expected: all three jobs succeed. Fix and push until green; a visual diff on CI means baselines were not generated in the Linux image (redo Task 8 Step 5).

- [ ] **Step 6: Owner step — branch protection**

Ask the owner to enable, on GitHub → Settings → Branches → `main`: "Require status checks to pass" with `static`, `e2e`, `lighthouse`. Only the owner can change this setting.

---

### Task 10: Preview deploy, cutover, and production smoke tests

**Files:**

- Create: `e2e/smoke.spec.ts`

- [ ] **Step 1: Write `e2e/smoke.spec.ts`**

```ts
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
```

Commit and push:

```bash
git add e2e/smoke.spec.ts
git commit -m "test: deployment smoke tests

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

- [ ] **Step 2: Connect `redesign` as an Amplify preview branch (console)**

Amplify → app `personalwebsite` (`d35z4qbmiwxwvf`, us-east-2) → Overview → "Add branch" → `redesign` → save. Amplify reads `amplify.yml` from the branch. Wait for the build to finish.
Expected: branch URL `https://redesign.d35z4qbmiwxwvf.amplifyapp.com` serves the new site.

- [ ] **Step 3: Smoke the preview**

Run: `BASE_URL=https://redesign.d35z4qbmiwxwvf.amplifyapp.com npx playwright test --project=smoke`
Expected: home, resume, pass; the 404 test **fails** at this point because the app-wide SPA rewrite rule still sends unknown paths to `index.html` with 200. That is expected until Step 6 and is the reason the rule change waits for cutover.

- [ ] **Step 4: Manual review on the preview (owner gate)**

Owner opens the preview on a phone and a desktop, compares to the canvas, and taps the resume link on the phone. Record any change requests; fix on `redesign`, push, re-check. Proceed only on the owner's explicit "ship it".

- [ ] **Step 5: Merge to `main` (deploys production — requires the owner's explicit yes)**

Rollback line to show the owner first: "Revert with `git revert -m 1 <merge-commit> && git push`; Amplify rebuilds the old site in ~2 minutes."

```bash
git checkout main
git pull --ff-only
git merge --no-ff redesign -m "Merge redesign: Astro rebuild of dannydominguez.dev

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push origin main
```

Wait for the Amplify `main` build; confirm `https://www.dannydominguez.dev` shows the new `<h1>`.

- [ ] **Step 6: Update Amplify rewrite rules (after production shows the new site)**

Amplify → Hosting → Rewrites and redirects → Manage redirects → replace the JSON with:

```json
[
  {
    "source": "https://dannydominguez.dev",
    "status": "301",
    "target": "https://www.dannydominguez.dev"
  },
  { "source": "</^\\/static\\/media\\/.*\\.pdf$/>", "status": "301", "target": "/resume.pdf" },
  { "source": "/<*>", "status": "404", "target": "/404.html" }
]
```

Rollback: paste back the previous three rules (302 apex redirect, `/<*>` 404-200 → `/index.html`, and the extension regex 200 → `/index.html`).
Order matters: this must happen after Step 5, because the old site's resume lives under `/static/media/` and would be redirected to a `/resume.pdf` it does not have.

- [ ] **Step 7: Production smoke**

Run: `BASE_URL=https://www.dannydominguez.dev npx playwright test --project=smoke`
Expected: all 5 tests pass, including the 301s and the real 404.

- [ ] **Step 8: Clean up**

Amplify → delete the `redesign` branch deployment (optional). Locally: `git branch -d redesign` after confirming `main` contains it. Record follow-ups in the README: Google Play link, Rally link, sharper headshot.
