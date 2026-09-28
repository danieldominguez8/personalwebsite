# dannydominguez.dev redesign — design spec

Date: 2026-09-28 · Status: approved design, awaiting spec review
Visual source of truth: Claude Design canvas https://claude.ai/artifact/Hep6tziYybVXnz6B8hwD6c (version 10, desktop 1280px + phone 390px artboards)

## Goal

Rebuild the site from scratch as a job-first professional profile that also signals openness to freelance work.
A recruiter should get name, current role, strongest work, and the resume within about ten seconds.

Success criteria:
- Everything on the canvas ships, with the same content, order, and look on desktop and phone.
- Lighthouse on the production URL: Performance ≥ 95, Accessibility = 100, SEO = 100.
- No horizontal scroll from 320px to 1920px wide.
- The live site stays up the whole time; the swap to the new site is one merge that can be reverted.

## Decisions already made

| Topic | Decision |
|---|---|
| Audience | Both, job-first |
| Look | "Editorial": off-white `#FAFAF7`, serif display, text-first, generous whitespace |
| Header | White strip from option C: navy `DD` badge + name left, nav + solid Resume button right, 1px bottom rule |
| Stack | Astro 7 (current `astro` on npm: 7.3.5), static output, no client JS framework |
| Photo | Small round headshot in the hero; larger photo in About |
| Links | GitHub, LinkedIn, email, resume download |

## Page structure (one page, top to bottom)

1. **Header** (sticky): `DD` badge + "Danny Dominguez" → `#top`; nav Experience · Projects · Skills · About; solid black pill "Resume". Phone: badge + name + Resume pill only (no hamburger).
2. **Hero**: round headshot (88px desktop / 64px phone) beside "Danny Dominguez" and "Software Engineer II at Invoice Cloud · McAllen, TX";
   h1 "I build reliable payment platforms and backend services in .NET and Azure.";
   intro "Four years shipping payment APIs, modernizing legacy .NET services, and building AI-assisted tooling that speeds up how my team works.";
   solid "Download resume" button, GitHub, LinkedIn, Email; "Open to new roles."
3. **Experience** (`#experience`): one "Invoice Cloud · Aug 2022 – Present" heading with two sub-roles (SE II Dec 2024 – Present, 4 bullets; SE I Aug 2022 – Nov 2024, 4 bullets incl. the Visual Basic/C# legacy refactor), then an Education row: Drexel University, M.S. Software Engineering, 2020 – 2022.
4. **Selected projects** (`#projects`):
   - Two image cards: **Lotería Tradicional** (figure "30,000+ downloads"; Personal project · 2020 – Present; React Native original rewritten natively in SwiftUI and Kotlin with custom voice profiles; App Store link only) and **FreeTogether** (Personal project · 2026; iOS group-availability app; SwiftUI · Firebase · Cloud Functions; no link).
   - Two compact text rows: **Rally Competitions** (Founder · 2026; Next.js · Expo / React Native · FastAPI · PostgreSQL · Docker · GitLab CI/CD; no link) and **Conversational Agent** (M.S. capstone, Drexel · 2021 – 2022; GitHub link).
5. **Skills** (`#skills`): definition list in this order — Backend & APIs, Payments, Languages (incl. Visual Basic), AI & automation, Cloud & delivery, Databases, Testing.
6. **About** (`#about`): large photo + two short paragraphs (McAllen; coding as a hobby; travel, staying active, family, friends, dog Todd).
7. **Contact** (`#contact`): serif "Let's talk.", "I'm open to new roles, and happy to hear about freelance projects.", email link.
8. **Footer**: © year, GitHub, LinkedIn, Resume. Header and footer content align to the 760px content column.

Exact copy is what the canvas shows; the canvas wins over this summary if they differ.

## Visual system

- Fonts: Newsreader (display: h1, h2, company/school names, project figures) and IBM Plex Sans (everything else), self-hosted woff2 subsets, `font-display: swap`.
- Colors: ground `#FAFAF7`, surface `#FFFFFF`, text `#1A1A1A`, body `#3A3A3A`/`#4A4A4A`, muted `#6B6B6B` (5.1:1 on ground), rules `#E3E1DA`, accent navy `#1E3A8A`.
- Content column 760px desktop, 20px side padding phone; section padding 56px desktop / 36px phone; in-section gap 32px / 24px.
- Accessibility: skip link, visible `:focus-visible` outline (2px navy), real links and buttons, alt text on every image, section ids for nav anchors, `prefers-reduced-motion` respected (no motion planned).

## Architecture

Replaces the Create React App code in this repo (same repo, same Amplify app `d35z4qbmiwxwvf`).

```
src/
  pages/index.astro        one page composed from section components
  layouts/Base.astro       <head>, meta/OG tags, fonts, header, footer
  components/              Header, Hero, Experience, Projects, Skills, About, Contact, Footer
  data/                    profile.ts, experience.ts, projects.ts, skills.ts  (all copy lives here)
  styles/global.css        tokens + base styles
public/
  resume.pdf               stable resume URL (replaces the hashed /static/media path)
  favicon.ico, favicon.svg, logo192.png, logo512.png, og.jpg, headshot/photos (optimized via astro:assets where possible)
```

Rule: components render data; editing a job, project, or skill is a change to one file in `src/data/`.

## Deployment

- Add `amplify.yml` to the repo so build settings live in git: `npm ci`, `npm run build`, artifacts `dist/`, on a Node version Astro 7 supports (confirmed during planning).
- Rewrites/redirects in Amplify:
  - keep `https://dannydominguez.dev` → `https://www.dannydominguez.dev` (change 302 → 301);
  - replace the SPA rewrite rule with a 404 fallback to `/404.html` (Astro emits one page per route; no SPA routing);
  - add `/static/media/<*>.pdf` → `/resume.pdf` (301) so old resume links keep working.
- Rollout: build on branch `redesign`, connect it as an Amplify preview branch, review the preview URL on desktop and phone, then merge to `main`. Rollback: revert the merge commit; Amplify redeploys the old site.

## Testing

- `npm run build` must pass with zero warnings.
- A `node:test` smoke test over `dist/index.html`: every section id exists, nav anchors resolve, every `<img>` has alt text, resume/GitHub/LinkedIn/mailto links present, no `[PLACEHOLDER]` text.
- Link check over external links (App Store, GitHub, LinkedIn) in CI-free local script; report, do not fail on network errors.
- Manual: preview URL at 390px and 1280px compared against the canvas; Lighthouse run on the preview.

## Out of scope / follow-ups

- Google Play link for Lotería once the Android app's listing is live.
- Rally Competitions link once rallycompetitions.com has real content.
- A higher-resolution head-and-shoulders photo to replace the 240px crop.
- Blog/writing section.
