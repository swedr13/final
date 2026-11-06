# ROADMAP: from rebuilt branch to live site

Status as of 2026-11-06: the redesign in [PLAN.md](PLAN.md) is **implemented but uncommitted** on `design-update`. That covers Vite + React 19, pre-rendering, all sections, the 3D hero, the design tokens and the CI config. Lint, 34 tests, size budgets and local Lighthouse pass (see "Implementation notes" at the end of PLAN.md). Nothing is deployed.

Each phase below is **one conversation**. Every phase ends with a commit, so the next conversation can start cold from `git log` plus this file.

**Rules for every phase (keeps token use low):**
- Read only the files the phase lists. Do not re-read PLAN.md in full; read the section the phase points to.
- Do not run multi-agent workflows unless the phase says so. Single-agent work is enough.
- Before committing, run `npm run check`, which does lint, tests, build and size-limit.
- Commit on `design-update` with the message given. Never push or deploy unless the phase says so.
- At the end, tick the phase's checkbox in this file and include that in the commit.

---

## Phase 1: Land the rebuild
- [x] Done

**Goal:** commit the rebuild as one reviewed baseline.

**Already done in the original conversation:**
- A 4-reviewer code review with adversarial verification confirmed 20 defects, and all 20 are fixed. They include:
  - a hydration break from the footer year
  - forced-colours visibility of the menu and filter
  - a motion pause control (WCAG 2.2.2)
  - glass contrast
  - a refresh-rate-aware 3D governor and the orb's colour space
  - the toast trapped by `content-visibility`
  - anchor jumps landing in the wrong place
  - the LHCI ready pattern
- The fixes were re-verified in a browser and with Lighthouse.

**Remaining:** check the diff, run `npm run check`, commit.

**Acceptance:** clean `git status`; `npm run check` green.

**Commit message:**
```
feat: rebuild portfolio on Vite + React 19 with pre-rendering and 3D hero

- Replace CRA, Bootstrap, react-router, react-pdf and tsparticles with a
  single pre-rendered page (react-dom/static) hydrated on the client
- Design tokens with dark/light/system themes, fluid type, CSS-only motion
  (scroll-driven reveals, @starting-style, View Transitions)
- Lazy, capability-gated three.js "Signal Orb" with SVG poster fallback,
  throttled loop, step-down governor, touch/gyro input
- Content moved to src/content/*; résumé rendered as HTML timeline
- AVIF/WebP image pipeline, self-hosted fonts, OG/JSON-LD/sitemap, 404 redirects
- ESLint + jsx-a11y, Vitest (smoke, SSR, token contrast), size-limit, LHCI, CI deploy
- Motion pause control (WCAG 2.2.2), forced-colors support, refresh-rate-aware 3D governor
```

**Prompt for this conversation:**
```
Phase 1 of ROADMAP.md in this repo. Read only ROADMAP.md (Phase 1). The code
is already reviewed and fixed. Run `git status` and `npm run check`; if green,
tick the Phase 1 checkbox and commit everything with the Phase 1 message from
ROADMAP.md (stage deletions too). Don't push. Single agent, no workflows.
```

---

## Phase 2: Preview deploy and real-device QA
- [ ] Done

**Goal:** see the site on real phones before touching production.

**Scope:**
- `npm run deploy:preview` publishes to `https://swedr13.github.io/final/preview/`. **This pushes to `gh-pages`; confirm first.**
- On an iPhone (Safari) and an Android phone (Chrome), check:
  - **Hero:** the orb renders, vertical scroll is never blocked by the canvas, and "Tilt to explore" asks permission on iOS.
  - **Navigation:** the mobile menu opens and closes, and Escape works with a hardware keyboard.
  - **Work:** the filter works and `?f=mobile` deep links work.
  - **Theme:** the toggle works, and light/dark follows the OS setting.
- Fix what's broken. Note each device and browser version in the commit body.

**Files likely touched:** `src/components/hero3d/input.js`, `src/sections/Hero.css`, `src/components/layout/Header.css`

**Acceptance:** no blocking issue on either phone; production `/final/` unchanged.

**Commit message:**
```
fix(mobile): address real-device QA findings from preview deploy

Tested on <iPhone model / iOS x / Safari> and <Android model / Chrome x>.
- <one line per fix>
```

**Prompt:**
```
Phase 2 of ROADMAP.md. Read only ROADMAP.md (Phase 2). Ask me to confirm before
running `npm run deploy:preview` (it pushes to gh-pages /preview only). Then I'll
test on my phones and report issues; fix them one by one (files: src/components/
hero3d/input.js, src/sections/Hero.css, src/components/layout/Header.css as needed),
run `npm run check`, redeploy preview, and commit with the Phase 2 message
(fill in devices + fixes). Tick the Phase 2 checkbox. Single agent, no workflows.
```

---

## Phase 3: Content and copy review
- [ ] Done

**Goal:** every word on the site is confirmed by the owner.

**Scope:** walk through the copy in `src/content/*.js` with the owner.
- **profile.js:** tagline, intro, bio, facts row (4+ years, 13 projects), and the "Open to…" line in `Contact.jsx`.
- **projects.js:** tags and years per project, featured picks (currently DCWD Billing and Partsman), and the private/internal descriptions.
- **socials.js:** keep Facebook and Instagram, or show professional links only?
- **resume.js:** matches the current PDF.

Section headlines and ledes in `src/sections/*.jsx` are also open for review.

**Acceptance:** owner sign-off; `npm run check` green.

**Commit message:**
```
content: finalize copy, project tags and featured work

- <summary of edits>
```

**Prompt:**
```
Phase 3 of ROADMAP.md. Read only ROADMAP.md (Phase 3) and src/content/*.js.
Show me each content file's user-facing text as a compact list and ask what to
change; apply my edits (also section headlines/ledes in src/sections/*.jsx if I
ask). If projects.js changes the project count, update profile.facts. Run
`npm run check`, commit with the Phase 3 message, tick the checkbox. Single agent.
```

---

## Phase 4: Manual accessibility pass
- [ ] Done

**Goal:** go past the automated 100 score to real assistive-tech behaviour.

**Scope:**
- **Keyboard only:** skip link, header, menu, filter (arrow keys), cards, copy email, footer.
- **NVDA + Edge/Chrome on Windows:** headings list, landmarks list, the filter announcement, the copy toast.
- **axe DevTools** scan in both themes.
- **200% zoom** and Windows High Contrast (forced colours).
- Fix anything found.

**Files likely touched:** `src/sections/Work.jsx`, `src/sections/Contact.jsx`, `src/components/layout/*`, `src/styles/base.css`

**Acceptance:** no axe serious/critical issues; every interactive element reachable and announced sensibly.

**Commit message:**
```
fix(a11y): resolve manual screen-reader, keyboard and forced-colors findings

- <one line per fix>
```

**Prompt:**
```
Phase 4 of ROADMAP.md. Read only ROADMAP.md (Phase 4). Give me a short manual
test script (keyboard, NVDA, axe DevTools, 200% zoom, forced colors) for
`npm run preview` at http://localhost:4173/final/. I'll report findings; fix
each in the smallest change, run `npm run check`, commit with the Phase 4
message, tick the checkbox. Single agent, no workflows.
```

---

## Phase 5: Performance hardening (LCP ≤ 2.0 s lab)
- [ ] Done

**Goal:** close the 0.2–0.3 s LCP gap noted in PLAN.md.

**Scope**, in order (stop once the target is hit):
1. Replace the duplicated social and icon SVGs (about 16 copies) with one inline `<svg><symbol>` sprite and `<use>`.
2. Render the mobile-menu dialog contents only after first open, so they're not in the pre-rendered HTML.
3. Trim the inlined CSS, or only inline the critical hero CSS (≤ 6 KB) and load the rest non-blocking.
4. Optional: port the scene to OGL behind the same `mount()` interface if the three chunk grows past 150 KB gz.

Measure with Lighthouse mobile (3 runs, `?no3d` and with 3D) against `npm run preview`.

**Files:** `src/components/ui/ui.jsx`, `src/components/layout/MobileMenu.jsx`, `scripts/prerender.mjs`, `.size-limit.json`

**Acceptance:** median lab LCP ≤ 2.0 s; Perf ≥ 97 both ways; HTML ≤ 28 KB gz; size-limit tightened to the new numbers.

**Commit message:**
```
perf: cut pre-rendered HTML weight to bring lab LCP under 2.0 s

- Share one SVG sprite for repeated icons
- Defer mobile-menu markup until first open
- <CSS inlining change>
Lighthouse mobile (median of 3): LCP <x> s, Perf <y>, HTML <z> KB gz
```

**Prompt:**
```
Phase 5 of ROADMAP.md. Read only ROADMAP.md (Phase 5) and the "Measured"
table in PLAN.md's Implementation notes. Apply the Phase 5 steps in order,
measuring after each with Lighthouse mobile (Edge is at "C:/Program Files
(x86)/Microsoft/Edge/Application/msedge.exe"; install lighthouse in the
scratchpad, not the repo), stop when median LCP ≤ 2.0 s. Keep hydration
warning-free. Update .size-limit.json + PLAN.md measured table, run
`npm run check`, commit with the Phase 5 message (fill numbers), tick checkbox.
```

---

## Phase 6: CI on GitHub
- [ ] Done

**Goal:** green CI on a real pull request.

**Scope:**
- Push `design-update` and open a PR into `main`. **Confirm before pushing.**
- Make `.github/workflows/ci.yml` pass on `ubuntu-latest`: `npm ci` lockfile, lint, tests, build, size-limit, LHCI (`?no3d`).
- If LHCI fails only on runner noise, adjust thresholds in `lighthouserc.json` with justification in the PR.
- Prove the gates bite: one throwaway commit that breaks a budget makes CI fail, then revert it.

**Acceptance:** CI green on the PR; the deploy job is skipped on PRs.

**Commit message:**
```
ci: make lint/test/size/Lighthouse gates pass on GitHub runners

- <fixes, e.g. lockfile platform deps, LHCI server readiness>
```

**Prompt:**
```
Phase 6 of ROADMAP.md. Read only ROADMAP.md (Phase 6), .github/workflows/ci.yml
and lighthouserc.json. Confirm with me, then push design-update and open a PR
into main with `gh`. Watch the CI run (`gh run watch`), fix failures with
minimal changes, commit with the Phase 6 message, tick the checkbox, push.
Do not merge. Single agent.
```

---

## Phase 7: Launch
- [ ] Done

**Goal:** production at `https://swedr13.github.io/final/`.

**Scope:**
1. Tag the current live site so it can be restored: `git tag deploy-pre-redesign origin/gh-pages`, then push the tag.
2. Merge the PR. CI then deploys to `gh-pages`.
3. Post-launch checks:
   - Live Lighthouse (3 runs).
   - Legacy URLs (`/final/about`, `/final/project`, `/final/resume`) and an unknown URL.
   - The OG card in a share debugger (LinkedIn Post Inspector).
   - Submit `sitemap.xml` in Google Search Console.
4. Update the README if anything changed.

**Rollback:** redeploy from the `deploy-pre-redesign` tag. Force-pushing `gh-pages` needs explicit approval.

**Acceptance:** the live site meets the PLAN.md section E budgets; all legacy URLs resolve.

**Commit message** (only if fixes are needed after launch):
```
chore(launch): post-launch fixes and live measurements

Live Lighthouse mobile (median of 3): Perf <x>, LCP <y> s, CLS <z>
```

**Prompt:**
```
Phase 7 of ROADMAP.md. Read only ROADMAP.md (Phase 7). Walk me through launch:
create and push the rollback tag, merge the PR (ask me first), wait for the
deploy job, then verify the live site (Lighthouse x3, legacy URLs, 404, OG
tags via curl). Report results; commit only if fixes are needed, using the
Phase 7 message. Tick the checkbox and push. Single agent.
```
