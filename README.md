# dannydominguez.dev

Personal site of Danny Dominguez, built with [Astro](https://astro.build) as a static, single-page site and hosted on AWS Amplify at https://www.dannydominguez.dev.

## Editing content

All copy lives in typed data files — change a job, project, or skill in one place:

| File                     | What it holds                                                |
| ------------------------ | ------------------------------------------------------------ |
| `src/data/profile.ts`    | Name, headline, intro, links, photos, About and Contact text |
| `src/data/experience.ts` | Jobs, roles, bullets, education                              |
| `src/data/projects.ts`   | Projects (cards need an image; rows may have a thumbnail)    |
| `src/data/skills.ts`     | Skill groups, in display order                               |

Every file is validated by a Zod schema (`src/data/schema.ts`) at build time, and `tests/unit/data.test.ts` checks dates, images, links, and that no placeholder text ships.
Images live in `public/images/` and must include `width`, `height`, and descriptive `alt` text. The resume is `public/resume.pdf`.

## Design

The "Lotería frame" look: a quiet black-on-white page with one bold element, the cobalt Personal Projects band of Lotería-style cards (heavy black frame, year in the corner, marigold name band).

- Tokens live at the top of `src/styles/global.css`: paper `#FFFFFF`, ink `#000000`, graphite `#4D4D4D`, cobalt `#1C3FAA`, rosa `#C8005F` (focus ring and the Lotería figure), marigold `#F5B700` (name bands, footer focus ring).
- Fonts are self-hosted: Big Shoulders Display (headlines, card names, the DD badge) and IBM Plex Sans (everything else).
- Contrast pairs and focus-ring contrast are tested in `e2e/a11y.spec.ts`; change both together.

## Commands

Requires Node 24 (see `.nvmrc`).

| Command                             | What it does                                                |
| ----------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                       | Local dev server                                            |
| `npm run build` / `npm run preview` | Production build into `dist/` / serve it                    |
| `npm test`                          | Unit, data, and component tests (Vitest)                    |
| `npm run test:dist`                 | Checks on the built HTML (run after `build`)                |
| `npm run test:e2e`                  | Browser tests in Chromium, Firefox, and WebKit (Playwright) |
| `npm run test:visual:docker`        | Screenshot comparisons in the same Linux image CI uses      |
| `npm run lhci`                      | Lighthouse budgets (performance, accessibility, SEO)        |
| `npm run test:all`                  | Everything above except visual                              |

First-time setup for browser tests: `npx playwright install chromium firefox webkit`.

Visual baselines are Linux-only. After an intended visual change, regenerate them with:

```bash
docker run --rm -v "$PWD":/work -v /work/node_modules -w /work mcr.microsoft.com/playwright:v1.63.0-noble \
  bash -lc "npm ci && npx playwright test --project=visual --update-snapshots"
```

Local browser tests reuse any server already listening on port 4321. If results look stale, stop old previews first (`npx astro preview stop`).

## Deploying

- Pushes to `main` deploy automatically through Amplify (`amplify.yml`).
- `main` is protected: the `static`, `e2e`, and `lighthouse` GitHub Actions checks must pass on pull requests.
- The Amplify rewrite rules live in the console; `infra/amplify-rewrites.json` is the source of truth to paste into Hosting → Rewrites and redirects → Manage redirects.
- Changing those rules can leave stale CDN copies of affected URLs; a redeploy of `main` clears them.
- Smoke-test production after a deploy: `BASE_URL=https://www.dannydominguez.dev npx playwright test --project=smoke`.
