# PLAN.md: Portfolio Redesign for `swedr13/final` (revision 2)

**Repo:** `C:/Users/jcsuaybaguio/Documents/GitHub/final` · **Branch:** `design-update` · **Live site:** https://swedr13.github.io/final

**Status:** implemented on `design-update` (2026-11-06). See "Implementation notes" at the end for deviations from this plan.

## Executive summary

- **Fix the live site first.** Phase 0 hotfixes the current CRA app: routing under `/final`, the preloader, metadata and quick accessibility fixes. Before any production deploy, the owner reviews the content. The live `gh-pages` build dates from 2024-01-27 and comes from older source, so redeploying `design-update` would add 4 projects and remove 2 (the laser-machine and Next.js portfolio projects).
- **Stack.** Vite plus React 19 (current stable majors, pinned exactly) on a single page with anchor sections. Remove react-router, react-pdf/pdfjs, tsparticles and, one section at a time, Bootstrap. No Next.js: GitHub Pages static export costs more than it gives for one page.
- **CSS first, no Motion library.** The mobile menu uses `<dialog>` with CSS `@starting-style` transitions. The project-filter reflow and the theme cross-fade use the View Transitions API. Motion and GSAP are excluded under an ADR. They may be added later only inside a lazy chunk, and only for an effect CSS cannot do.
- **Cascade without a fight.** Bootstrap and the legacy `style.css` are imported into explicit early layers (`@layer vendor, legacy, reset, tokens, …`), so the new layered CSS wins without `!important` while sections migrate.
- **Pre-render moves up to Phase 5**, straight after the single-page shell, using React 19 `react-dom/static` `prerender`. All sections are then written SSR-safe from the start. A "no `window` in render" lint rule and an SSR smoke test run from Phase 3.
- **The 3D "Signal Orb" is a progressive enhancement.** It is vanilla `three` in a lazy chunk (≤ 150 KB gz, with an OGL port as fallback). The capability probe runs inside the idle callback, shaders compile asynchronously, and the loop is throttled and paused when not visible. The governor only steps down. An inline-SVG poster is the first paint and the fallback.
- **Budgets are realistic and testable.** Lab LCP ≤ 2.0 s, initial JS ≤ 80 KB gz and CSS ≤ 14 KB gz. Lighthouse CI runs `?no3d`, because headless CI has no GPU. The 3D is accepted on manual traces on real GPUs.
- **Measure two baselines in P0:** the live 2024 build and a build of the current `design-update` source.
- **Known facts are used, not placeholders.** Location is "Davao City, Philippines" (`README.md:10`) and the email is `junelleXIII@gmail.com` (`README.md:27`, to be confirmed). Decisions still needed from the owner: the two removed projects, contact form vs mailto, email obfuscation, analytics, React Native in the stack, and the remaining copy.
- **Scope was cut for a 13-project portfolio:**
  - no governor step-up
  - no chip-to-orb skill-point bus
  - no magnetic CTA, CTA pulse or speed "breathing"
  - no circular theme reveal
  - no `vitest-axe` or `web-vitals` logger
  - 10 phases of small, reversible PRs

---

## Corrections carried forward

- `style.css` has **234** `!important` declarations.
- `pre.svg` is used as the `#preloader` background (`style.css:36`). Delete it only together with `Pre.js` and that rule.
- `IcosahedronGeometry(r, detail)` has `20 × (detail+1)²` triangles. Vertex counts are for non-indexed geometry (3 per triangle).
- **Location is known:** `README.md:10` gives "Davao City, Philippines".
- **Email is known:** `README.md:27` gives `junelleXIII@gmail.com`. `README.md:11` has the typo `.cokm`, which is fixed in 0.10. The owner only needs to confirm it.
- **The live build is stale.** `origin/gh-pages` was deployed 2024-01-27 from older source:
  - It ships `lasermachine.png`, `nextJS portfolio.png` and `public/favicon.png`.
  - It lacks the `dcwd-*`, `atchupikolq` and `expense-monitoring` projects.
  - The 1,002,462 B `main.js` and the 185,661 B `main.css` figures describe that build, not `design-update`.
- **`lasermachine.png` and `nextJS portfolio.png` are live content.** They are not imported by the current source, but they are on the public site, and `README.md:7` mentions Next.js. Deleting them is an owner decision (open question 3), not a result of grep.

---

## A. Target stack decision

| Concern | Decision | Why, for this repo |
|---|---|---|
| Build | **Vite, current stable major (≥ 7), pinned exactly**, plus `@vitejs/plugin-react`. `base: '/final/'`, or `'/final/preview/'` when `PREVIEW=1`. | CRA 5 (`react-scripts` 5.0.0) is deprecated and untested on the Node 24 installed here. About 20 components, no env vars, no proxy. The only CRA-specific items are `%PUBLIC_URL%` and `process.env.PUBLIC_URL`, so the migration is mechanical. **Next.js is rejected:** GitHub Pages static export needs `basePath`, `trailingSlash`, `.nojekyll` and `ssr:false` around every canvas, and `next/image` optimisation does not work there. |
| React | **React 19.x (current minor, pinned)** with `createRoot` / `hydrateRoot` | Tasks 1.1 and 1.2 remove every React-17-only dependency first, so nothing blocks 19. It also provides `react-dom/static` `prerender` for Phase 5. `src/index.js` still uses `ReactDOM.render`. |
| Pre-render | **Build time, with React 19 `prerender`.** `vite build --ssr src/entry-server.jsx`, then `scripts/prerender.mjs` (about 40 lines) injects the markup at `<!--app-->` in `dist/index.html`. The client calls `hydrateRoot`. Alternative if this is hard to maintain: `vite-react-ssg`. | Today `#root` is empty: crawlers see nothing and LCP waits for JS. Pre-rendered, **the LCP element is the h1 text in the first HTML response.** Timeboxed (Phase 5). If hydration problems overrun, ship client-rendered and keep the JS budget. |
| Routing | **Remove react-router.** One page with `#home #about #stack #work #resume #contact`. `public/404.html` maps `/final/about`, `/final/project` and `/final/resume` to their anchors, and shows a **styled "Page not found"** for anything else. | Removes every current routing bug: missing `basename`, `<Navigate to="/">` escaping `/final`, and `Navbar.Brand href="/"`. Saves about 13 KB gz and suits scroll storytelling. |
| Styling | Plain CSS in `@layer vendor, legacy, reset, tokens, base, layout, components, utilities`. CSS Modules per component, Grid/Flex, `clamp()` fluid type, container queries for cards. **Bootstrap goes into `layer(vendor)` and `style.css` into `layer(legacy)`** while sections migrate. | Unlayered CSS beats every layered rule, so leaving Bootstrap unlayered would make the new tokens lose. Layering the legacy CSS fixes the normal cascade. With `!important` the layer order reverses, so the 234 legacy `!important`s now **beat** new code, even plain rules. Task 3.1 audits them and removes them per section. Bootstrap is deleted when the last section is off it. |
| Animation | **CSS only, with no animation library.** That means transitions, keyframes, `@starting-style` plus `transition-behavior: allow-discrete` (menu), scroll-driven animations (`animation-timeline: view()` in `@supports`; shipped in Chromium and Safari 26, with an IntersectionObserver fallback mainly for Firefox), and **same-document View Transitions** for the filter reflow and the theme cross-fade (instant where unsupported). | The request allows CSS first. This removes `LazyMotion`, the `domMax` vs `domAnimation` problem (Motion `layout` needs `domMax`, about 25 KB gz) and an 18 KB lazy chunk. **ADR:** Motion or GSAP may be added only in a lazy chunk, for an effect CSS and View Transitions cannot do, inside the size-limit budget. |
| 3D | **Vanilla `three`** (named imports, custom `ShaderMaterial`) in a lazy chunk. No R3F, no drei. | One orb and one point field do not justify a reconciler. Budget ≤ 150 KB gz. If over, port the GLSL to **OGL** (about 10–15 KB gz) behind the same `mount()` interface. |
| Icons | `react-icons` v5, imported per icon | Keeps the existing ai/fa/si/di icons at a few KB. |
| Fonts | **Inter Variable** (latin, wght axis) from `@fontsource-variable/inter` and **Instrument Serif Italic** (latin) from `@fontsource/instrument-serif`. `scripts/copy-fonts.mjs` copies the latin woff2 files to `public/fonts/`. Optional further subsetting with `pyftsubset` (`--unicodes=U+0000-00FF,U+2013-2014,U+2018-201D,U+2190-2199,U+2713`). Mono uses the system stack. | Replaces the Google Fonts `@import` in `src/index.css` (Raleway 500 only, synthesised bold, wrong fallback). Both are preloaded with `crossorigin`. |
| Removed deps | `@react-pdf/renderer`, `axios`, `react-pdf`/pdfjs, `react-tsparticles`, `typewriter-effect`, `react-parallax-tilt`, `react-github-calendar`, `bootstrap`, `react-bootstrap`, `react-router-dom`, `react-scripts`, `web-vitals@2`, `@testing-library/*@12` | Each is unused, React-17-only, or replaced by a few dozen lines of local code or a static asset. |
| Tooling (kept small) | **Gates:** `@lhci/cli`, `size-limit`, `eslint-plugin-jsx-a11y`, plus a custom ESLint `no-restricted-globals` rule for render code. **Tests:** Vitest with `@testing-library/react@16` and **`@testing-library/dom`** (required peer), covering a smoke test, the token contrast-ratio test and the SSR render test. **On demand:** `rollup-plugin-visualizer` (`npm run analyze`), `vite-imagetools`, `sharp` (one-off scripts). | Dropped: `vitest-axe` and the `web-vitals` logger. jsdom cannot check contrast or focus visibility anyway. The token test, Lighthouse and the manual axe DevTools pass cover those. |
| Deploy | `gh-pages -d dist --dotfiles` with `public/.nojekyll`. Each phase goes to `/final/preview/` first. GitHub Actions build plus LHCI before deploy in Phase 10. | Same host, same URL. |

**Hosting limits we accept:**
- **Caching.** GitHub Pages serves everything with `Cache-Control: max-age=600` and no `immutable`. Hashed filenames still make revalidation cheap (304s), but repeat visits cannot get long-lived caching. A service worker is out of scope; revisit after launch.
- **CSP.** Pages cannot set headers. A `<meta http-equiv="Content-Security-Policy">` is **out of scope for launch**. If it is added later, the inline theme script needs a `sha256-` hash in `script-src`.

---

## B. Architecture and design tokens

### File tree
```
final/
├─ index.html                  # shell: meta/OG/JSON-LD, theme bootstrap script, font preloads (crossorigin), <!--app-->
├─ vite.config.js              # base (PREVIEW switch), imagetools, manualChunks { three: ['three'] }
├─ lighthouserc.json  .size-limit.json  eslint.config.js
├─ scripts/
│  ├─ prerender.mjs            # SSR build → React 19 prerender → inject into dist/index.html
│  ├─ copy-404.mjs             # P0–P3 only (CRA/Vite SPA fallback); deleted in 4.1
│  ├─ copy-fonts.mjs           # fontsource latin woff2 → public/fonts
│  ├─ optimize-images.mjs      # sharp: avatar, OG, icons, resume-preview (from committed PNG)
├─ public/
│  ├─ .nojekyll  404.html (legacy map + styled not-found)  robots.txt  sitemap.xml
│  ├─ fonts/inter-var-latin.woff2  instrument-serif-italic-latin.woff2
│  ├─ og-image.png (1200×630)  apple-touch-icon.png  icon-192.png  icon-512.png  favicon.svg
│  ├─ manifest.webmanifest
│  └─ Junelle-Suaybaguio-Resume.pdf
└─ src/
   ├─ main.jsx  entry-server.jsx  App.jsx    # <SkipLink/><Header/><main id="main">…</main><Footer/>
   ├─ content/                               # single source of truth
   │  ├─ profile.js   # name, roles[], bioShort, bioLong, quote, email, location: 'Davao City, Philippines'
   │  ├─ socials.js   # {label, href, Icon} (dedupes Footer.js + Home2.js)
   │  ├─ skills.js    # Techstack.js:21-50 + Toolstack.js:14-28 (+ React Native if owner confirms)
   │  ├─ projects.js  # entries from Projects.js:34-153 (+ 2 legacy entries if owner keeps them)
   │  └─ resume.js    # experience/skills/education transcribed from the PDF
   ├─ assets/resume-page1.png                # one-time manual PDF export, committed (see 0.11)
   ├─ styles/ layers.css tokens.css base.css layout.css utilities.css motion.css fonts.css
   ├─ hooks/  useTheme.js  useReducedMotion.js  useMediaQuery.js  useInView.js  useActiveSection.js
   ├─ components/
   │  ├─ layout/  Header.jsx(.module.css)  MobileMenu.jsx (<dialog>)  Footer.jsx  SkipLink.jsx  Section.jsx
   │  ├─ ui/      Button  Chip  IconLink  SocialLinks  ThemeToggle  Picture  Skeleton  Toast  VisuallyHidden  Logo
   │  └─ hero3d/  Hero3D.jsx (gate + poster, main bundle)  capability.js  OrbPoster.jsx (inline SVG)
   │              scene.js (lazy)  shaders.js  input.js (pointer/drag/gyro)
   ├─ sections/  Hero  About  Stack  Work  ProjectCard  ProjectFilter  Resume  Contact
   └─ assets/   avatar.png  projects/*.png (sources; imagetools emits AVIF/WebP)
```

**`src/styles/layers.css`**, imported first:
```css
@layer vendor, legacy, reset, tokens, base, layout, components, utilities;
@import url("bootstrap/dist/css/bootstrap.min.css") layer(vendor);   /* removed in 6.7 */
@import url("../style.css") layer(legacy);                           /* shrinks per section; removed in 6.7 */
```
Inside the layers, new code wins on normal declarations. The legacy `!important`s win over everything new, so task 3.1 lists them, and each section PR deletes the ones in its area before restyling.

**To delete, each in the phase noted in section I:**
- **Files and boilerplate:** `App.css`, `index.css`, `style.css` (after porting), `Pre.js` + `pre.svg` + the `#preloader`/`#no-scroll` rules, `Particle.js`, `Home/Type.js`, `About/Github.js`, `App.test.js`, `setupTests.js`, `reportWebVitals.js`.
- **Assets, after owner decision Q3:** `about.png`, `home-bg.jpg`, `logo.png`, `logo.svg`, `public/favicon.png`. `Projects/lasermachine.png` and `Projects/nextJS portfolio.png` are **kept and re-added to `projects.js` if the owner keeps those projects**.
- **Config and metadata:** the stale `Server/` lines in `.gitignore`, and the duplicate description and soumyajit OG tags in `public/index.html`.
- **README images:** `Images/readme-img.png` and `readme-img1.png` are **regenerated** at launch from the new site (9.4), and the README uses the new OG image.

### Design tokens (`src/styles/tokens.css`)
```css
@layer tokens {
  :root {
    color-scheme: light dark;
    --c-bg:#0b0a12; --c-surface:#14121e; --c-surface-2:#1c1929;
    --c-text:#ecebf2; --c-text-muted:#a9a6b8;
    --c-accent:#c770f0; --c-accent-ink:#0b0a12;          /* ≈6.5:1 on --c-bg */
    --c-border:rgb(255 255 255 / .08);
    --c-glass:rgb(20 18 30 / .62); --glass-blur:14px; --c-header-solid:rgb(11 10 18 / .92);
    --c-focus:#f0c1ff;
    --font-sans:"Inter Var","Inter Fallback",system-ui,sans-serif;
    --font-display:"Instrument Serif","Serif Fallback",Georgia,serif;
    --font-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
    --step--1:clamp(.83rem,.8rem + .15vw,.94rem);  --step-0:clamp(1rem,.96rem + .2vw,1.125rem);
    --step-1:clamp(1.25rem,1.15rem + .5vw,1.5rem); --step-2:clamp(1.56rem,1.35rem + 1vw,2.25rem);
    --step-3:clamp(2rem,1.5rem + 2.4vw,3.5rem);    --step-4:clamp(2.6rem,1.6rem + 5vw,6rem);
    --lh-tight:1.05; --lh-body:1.6; --measure:65ch;
    --sp-1:.25rem; --sp-2:.5rem; --sp-3:.75rem; --sp-4:1rem; --sp-6:1.5rem; --sp-8:2rem; --sp-12:3rem;
    --sp-section:clamp(4rem,3rem + 6vw,9rem);
    --gutter:clamp(1rem,.5rem + 2.5vw,2.5rem); --container:72rem; --header-h:64px; --tap:44px;
    --r-sm:.5rem; --r-md:.875rem; --r-lg:1.25rem; --r-pill:999px;
    --shadow-1:0 1px 2px rgb(0 0 0/.3),0 8px 24px -12px rgb(0 0 0/.5);
    --ease-out:cubic-bezier(.22,1,.36,1); --ease-in-out:cubic-bezier(.65,0,.35,1);
    --dur-1:120ms; --dur-2:200ms; --dur-3:320ms; --dur-4:600ms;
  }
  :root[data-theme="light"] {
    --c-bg:#faf9fc; --c-surface:#fff; --c-surface-2:#f2eff8;
    --c-text:#16131f; --c-text-muted:#55506a;
    --c-accent:#7b2cbf; --c-accent-ink:#fff;              /* ≈6.7:1; verified by token test */
    --c-border:rgb(22 19 31/.1); --c-glass:rgb(255 255 255/.72);
    --c-header-solid:rgb(250 249 252/.94); --c-focus:#5b1a99;
  }
  @media (prefers-color-scheme: light) { :root:not([data-theme]) { /* same values as the light block */ } }
  @media (prefers-reduced-motion: reduce) { :root { --dur-1:0ms; --dur-2:0ms; --dur-3:0ms; --dur-4:0ms; } }
  @media (prefers-reduced-transparency: reduce) { :root { --glass-blur:0px; --c-glass:var(--c-surface); } }
}
```

**Theme.** There are three modes: System, Light and Dark.
- The choice is saved in `localStorage.theme` (read and written in try/catch).
- A blocking inline script in `<head>`, before the CSS, sets the theme so it never flashes:
  ```html
  <script>try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}</script>
  <meta name="theme-color" media="(prefers-color-scheme: dark)"  content="#0b0a12">
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#faf9fc">
  ```
- `useTheme` cycles System → Light → Dark. System removes both the attribute and the storage key.
- The hook updates `theme-color` and follows OS changes live on System. Where supported and motion is allowed, it wraps the switch in a **plain `document.startViewTransition` root cross-fade** (no circular reveal). It also dispatches `themechange` for the 3D uniforms.
- The markup is theme-agnostic. `ThemeToggle` uses `useSyncExternalStore` with server snapshot `'system'`, so hydration never mismatches.
- **Glass** (`backdrop-filter`) is used only on the sticky header (after the hero, see C) and the mobile sheet, behind `@supports`, with a solid fallback.

---

## C. Section-by-section redesign

All copy comes from `src/content/*`. The name, bio, socials and projects each exist in exactly one file.

### Navigation
- **Desktop (≥ 48rem): sticky 64 px header.**
  - **At the top:** transparent.
  - **While the hero is in view:** after 8 px of scroll it gets a solid `--c-header-solid` background with a hairline border and **no blur**. That avoids a blur over the live WebGL canvas.
  - **Past the hero:** it switches to glass (`--c-glass` + `backdrop-filter`).
  - Both states come from IntersectionObservers (an 8 px sentinel and the hero stage), not a scroll listener. This fixes the leak at `Navbar.js:27`.
  - **Contents:** `Logo` ("Js.", links to `#home`); About · Stack · Work · Resume · Contact; ThemeToggle; an optional "Available for work" pill (Q10); and "GitHub ↗" pointing to **`swedr13/final`**.
- **Active section:** `useActiveSection` uses an IntersectionObserver with `rootMargin: '-45% 0px -50% 0px'` and sets `aria-current="true"`. A single underline span glides between links with a CSS transform. The hook sets state only in effects, so the server snapshot is "no active section".
- **Mobile (< 48rem): 44×44 toggle**
  - The toggle has `aria-expanded`, `aria-controls="mobile-menu"` and the label "Open menu" / "Close menu". Its three spans morph into an X.
  - It opens **`<dialog id="mobile-menu">` with `showModal()`**. The browser makes the rest of the page inert, traps Tab and closes on Escape.
  - Focus moves to the first link. On `close`, focus is explicitly returned to the toggle, as a safeguard for older engines.
  - Entry and exit use CSS `@starting-style` and `transition-behavior: allow-discrete` on `opacity` and `transform` and on the `::backdrop`. Links fade in with a staggered CSS delay (`--i` index). Under reduced motion this is instant.
  - Links are at least 56 px tall, in the display serif at `--step-3`, with socials at the bottom.
  - A backdrop tap or choosing a link closes the menu. Scroll is locked with `html:has(#mobile-menu[open]) { overflow: clip }`. **The 3D loop pauses while it is open.**
- **Global:**
  - The skip link goes to `<main id="main" tabindex="-1">`.
  - `scroll-padding-top: calc(var(--header-h) + 16px)`.
  - Smooth scroll applies only under `prefers-reduced-motion: no-preference`.

### Hero (`#home`, the LCP section)
- **Layout:** 12-column grid at `min-height: 100svh`. Text in columns 1–7, the 3D stage in columns 6–12, behind the text.
- **Eyebrow** (mono): `// Front-end Developer · Davao City, Philippines`.
- **h1:** "Junelle Suaybaguio" in **Inter 700** at `--step-4`, followed by the serif-italic span *"brings designs to life."* Both woff2 files are preloaded with `crossorigin` and have metric-matched fallbacks (`size-adjust`, `ascent-override`).
- **LCP rule: the h1 never starts at `opacity: 0`.** Entrance effects only use `clip-path` or `transform` on spans that are already painted.
- **Roles** (`Type.js:8-12`): Front-end Developer, WordPress Developer, Freelancer.
  - A CSS-only rotator with `aria-hidden` spans, plus a `VisuallyHidden` sentence that lists all three.
  - It is pure CSS keyframes, so pre-render and hydration render the same markup and no JS state is involved.
  - Under reduced motion it stays on the first role.
- **CTAs:**
  - "View work" (primary, links to `#work`).
  - "Download CV" (ghost, `/final/Junelle-Suaybaguio-Resume.pdf`, "PDF · 388 KB").
- **"Signal Orb":**
  - **Orb:** `IcosahedronGeometry(1, detail)`, detail 12 on tier 2 (3,380 triangles, about 10k vertices) and detail 6 on tier 1 (980 triangles, about 2.9k vertices).
    - Vertex shader: 3D simplex-noise displacement, 3 octaves on tier 2 and 2 on tier 1, amplitude 0.12, slow time.
    - Fragment shader: fresnel rim and a two-stop gradient (`--c-accent` to a cool indigo), with uniforms taken from the tokens.
  - **Point field:** one `Points` draw call with 240 points (tier 2) or 120 (tier 1) drifting in a thin shell. All points are decorative. There are no skill points and no event bus.
  - **Interaction:** three behaviours only.
    1. Pointer parallax of ±0.35 rad, critically damped.
    2. Horizontal drag with inertia on touch.
    3. Click or tap ripple (`uImpulse`, 900 ms decay, rate-limited).

    Gyro is opt-in on mobile (D8).
  - **Total:** 2 draw calls, no textures, no post-processing.
- **Mobile:** the orb sits top-right at about 70vw, partly cropped, with a `--c-bg` scrim behind the text. `touch-action: pan-y`, so vertical scroll is never hijacked.
- **Fallback:** `OrbPoster.jsx` is an inline SVG under 4 KB in the same composition, coloured with CSS vars.
  - It is in the pre-rendered HTML, so it is the first-paint visual.
  - It is also the visual under reduced motion, Save-Data, `?no3d`, no GPU or WebGL failure.
  - The canvas cross-fades over it after its first frame.
- **Removed:** `home-main.svg` (110 KB), tsparticles and the 1.2 s preloader. The 👋 stays only if the owner wants it (Q10), as `<span role="img" aria-label="waving hand">`.

### About (`#about`)
- **Layout:** two columns, one column below 48rem.
- **Bio:** `profile.bioLong` (base chosen in Q4), left-aligned at `--measure`, never justified.
- **Avatar:** `avatar.png` (2,051,572 B) becomes `<picture>` AVIF/WebP at 320/480/640w, ≤ 35 KB.
  - Explicit `width`/`height`, `loading="lazy"`, alt "Portrait of Junelle Suaybaguio".
  - A `--r-lg` frame with an accent glow.
- **Avatar tilt:** about 25 lines, at most 6°, rAF-coalesced `--rx`/`--ry`. Fine pointers only, and off under reduced motion. Replaces `react-parallax-tilt`.
- **Pull quote:** "Rest at the end, not in the middle" as `<blockquote><p>…</p><footer>— Junelle Suaybaguio</footer></blockquote>`. It lights word by word with `animation-timeline: view()`. Without support the words are fully visible.
- **Facts `<dl>`** (mono): years of experience (`TODO(owner)`), "13 shipped projects" (or the confirmed count) and "Web · WordPress · Mobile".

### Tech stack (`#stack`)
- **Chips:** labelled, with an `aria-hidden` icon plus a visible name. This fixes the icon-only `Techstack.js` and `Toolstack.js`.
- **Groups:**
  - Languages: HTML5, CSS3, JavaScript, PHP, C#
  - Frameworks: React, Next.js, Node.js, plus **React Native if the owner confirms (Q5)**. It is in the bio but not in `Techstack.js`.
  - CMS: WordPress
  - Data: MySQL
  - Tools: VS Code, Postman, Slack, GitHub, Windows
- **Layout:** auto-fill grid `minmax(9rem, 1fr)`, chips at least 44 px tall. Hover or focus lifts a chip by 2 px.
- **GitHub calendar dropped.** It was dead code pointing at `soumyajit4419` and made a third-party API call. A text link takes its place: "See activity on GitHub ↗".

### Work (`#work`)
- **Data** (`content/projects.js`):
  - **Shape:** `{ slug, title, summary, category: 'web'|'mobile', tags[], image, links: { demo?, repo? }, year?, featured? }`. The dead `isBlog` prop is removed.
  - **Web (10):** DCWD Billing, DCWD DMA, GetCCN, Net512, RCDigital, IMAWC, Autohub, Oconee (`oraj.png`), AKR, Pima.
  - **Mobile (3):** AtchupikolQ, Expense Monitoring, Partsman.
  - **Legacy:** the laser-machine and Next.js portfolio projects come back if the owner keeps them (Q3).
  - **Links:**
    - Partsman: demo and repo.
    - GetCCN, Net512, RCDigital, IMAWC, Autohub, Oconee, AKR, Pima: demo only.
    - The two DCWD projects, AtchupikolQ and Expense Monitoring: none.
  - Tags and years are `TODO(owner)`.
- **Filter:** a segmented `role="radiogroup"` with All / Web / Mobile. Counts come from the data.
  - Arrow keys move between options (roving tabindex), and each option is at least 44 px tall.
  - The choice is mirrored to `?f=` via `history.replaceState`.
  - **Hydration:** the initial render is always "All". The `?f=` value is read **in an effect** after hydration, so the pre-rendered state never mismatches.
  - **Reflow:** `document.startViewTransition(() => flushSync(setFilter(v)))`, with a `view-transition-name: card-{slug}` on each card. It is instant where unsupported or under reduced motion.
  - A polite live region announces "Showing 3 mobile projects". Focus stays on the radio.
- **Card:**
  - A 16:10 frame with `--r-md` radius.
  - The title is an h3 in Inter 600, followed by a 2-line summary and mono tags.
  - "Live site ↗" and "Code ↗" are real `<a>`s with `rel="noopener noreferrer"` and hidden "(opens in new tab)" text.
  - A stretched `::after` on the title link makes the whole card clickable. Secondary links sit above it in z-order, so nothing interactive is nested.
  - Cards with no links show a "Private / internal" badge.
- **Featured:** the first two cards span 2 columns at ≥ 64rem. Suggested: Partsman and IMAWC (Q7).
- **Hover and focus:** the image scales to 1.03 inside a clipped frame, the border goes accent and the shadow lifts. On fine pointers a rAF-throttled `--mx`/`--my` spotlight follows the cursor.
- **Images:** `vite-imagetools` (`?w=480;800;1200&format=avif;webp&as=picture`) feeds `<Picture>`.
  - `sizes="(min-width:64rem) 33vw, (min-width:40rem) 50vw, 100vw"`, lazy, `decoding="async"`, intrinsic size.
  - Alt text: `"{title} website screenshot"`.
  - A blurred LQIP of at most 400 B serves as the skeleton.
  - Target ≤ 60 KB per 800w AVIF.

### Resume (`#resume`)
- **Remove react-pdf and pdfjs.** This also removes the cdnjs worker and the issues at `ResumeNew.js:5-36`.
- **Replacement:**
  1. A semantic HTML timeline from `content/resume.js`.
  2. A page-1 preview built from **`src/assets/resume-page1.png`**: a one-time manual export at 1400 px wide, committed to the repo. `sharp` can read PNG but cannot rasterize PDF. `optimize-images.mjs` converts it to AVIF/WebP at 800/1400w, ≤ 80 KB. It is lazy, in an A4 frame with a skeleton.
  3. **Download CV** ("PDF · 388 KB") and **Open in new tab** buttons.
- **If the PDF changes, re-export it** with `pdftoppm -png -r 150 -f 1 -l 1 resume.pdf resume-page1` (poppler) or `mutool draw -r 150 -o resume-page1.png resume.pdf 1`. Both commands are documented in the README. No runtime or CI dependency.

### Contact and Footer (`#contact`)
- **Contact:**
  - Headline: "Let's build something *beautiful* together", over a static `OrbPoster` echo (no second WebGL context).
  - **Default contact method: mailto only**, to `junelleXIII@gmail.com` once confirmed (Q1).
  - **Obfuscation default (Q2):**
    - The pre-rendered HTML holds the address split into `data-user`/`data-domain` attributes.
    - A visible `<noscript>` shows the address as "junelleXIII [at] gmail [dot] com".
    - An effect assembles the `href` and text after hydration.
  - A form (Formspree or Web3Forms) is offered only if the owner wants one. It would add a third-party origin, and the budget would be updated.
  - "Copy email" uses the Clipboard API. The button changes to "Copied ✓" for 1.6 s, and a toast appears in an `aria-live="polite"` region.
- **Footer:**
  - A `<footer>` landmark with `<p>© {year} Junelle Suaybaguio</p>`. The h3s at `Footer.js:17/20` become paragraphs.
  - `SocialLinks` as 44×44 targets with `aria-label`s.
  - "Built with React + Vite", "Back to top ↑" and a second ThemeToggle.

---

## D. 3D component spec (`components/hero3d/`)

**Order dependency:** Phase 8 (3D) uses the `useSyncExternalStore` media hooks and the SSR-safe patterns set up in Phase 5. Do not start Phase 8 before Phase 5 is merged.

**1. Gate (`Hero3D.jsx`, about 1.5 KB in the main bundle).** It renders `OrbPoster` immediately. It does **not** probe WebGL during render or on mount. A tier is computed only after `window` `load`, then `requestIdleCallback` (2500 ms timeout, `setTimeout` fallback), and only once the hero is intersecting. The probe creates a WebGL context, which costs 10–50 ms on the main thread, so it must stay off the LCP/TBT path.

```js
export function getTier() {                 // called only inside the idle callback
  const mq = q => matchMedia(q).matches;
  if (new URLSearchParams(location.search).has('no3d')) return 0;
  try { if (sessionStorage.getItem('tier') === '0') return 0; } catch {}
  if (mq('(prefers-reduced-motion: reduce)')) return 0;
  const c = navigator.connection;
  if (c?.saveData || /(^|-)2g/.test(c?.effectiveType ?? '')) return 0;
  const gl = document.createElement('canvas')
    .getContext('webgl2', { failIfMajorPerformanceCaveat: true, powerPreference: 'low-power' });
  if (!gl) return 0;
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  const mem = navigator.deviceMemory ?? 4, cores = navigator.hardwareConcurrency ?? 4;
  const coarse = mq('(pointer: coarse)');
  if (mem < 4 || cores < 4) return coarse ? 0 : 1;
  return coarse ? 1 : 2;
}
```

**2. Lazy loading.** For tier ≥ 1 the gate calls `import('./scene.js')` (its own chunk via `manualChunks: { three: ['three'] }`), then `mount(canvas, { tier, colors, onFirstFrame, onFail })`. Tier 0 never requests the chunk.

**3. Renderer and DPR clamp.**
- `new WebGLRenderer({ canvas, antialias: tier===2, alpha: true, powerPreference: 'low-power', stencil: false, depth: true })`.
- `setPixelRatio(Math.min(devicePixelRatio, tier===2 ? 1.5 : 1.25))`.
- Size comes from a `ResizeObserver` on the stage, coalesced to rAF.

**4. Asynchronous shader compile.** Shader compile on throttled mobile can be a 50–200 ms long task.
- After building the scene, call **`await renderer.compileAsync(scene, camera)`**. It uses `KHR_parallel_shader_compile` when available, otherwise it falls back to a normal compile.
- The first `render()` runs only after that.
- The compile time is measured with `performance.now()`. **A compile over 250 ms on tier 2 starts at tier-1 settings, and over 400 ms on tier 1 calls `onFail('slow-compile')`.**

**5. Loop: on demand, throttled, pausable.**
```js
const frameMs = tier === 2 ? 1000/60 : 1000/30;
let raf = 0, last = 0, running = false;
const active = () => visible && !document.hidden && !menuOpen;
function tick(t) {
  raf = requestAnimationFrame(tick);
  if (t - last < frameMs - 1) return;
  const dt = Math.min((t - last) / 1000, 0.05); last = t;
  const settled = step(dt);
  renderer.render(scene, camera); governor.sample(dt);
  if (!active() || (settled && !autoAnimate)) stop();
}
const start = () => { if (!running && active()) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); } };
const stop  = () => { running = false; cancelAnimationFrame(raf); };
```
- An IntersectionObserver (`threshold: 0`) sets `visible`.
- `visibilitychange` stops and starts the loop.
- A `menuOpen` signal comes from the `<dialog>` `toggle` and `close` events.
- Input (pointer, drag, gyro, theme, impulse) calls `start()`.

**6. Governor (step-down only).** It takes the median frame time over the first 90 rendered frames.
- **Over 22 ms on tier 2:** switch to tier-1 settings (DPR 1.25, 30 fps, 2 octaves, half the points).
- **Over 40 ms on tier 1:** call `onFail('slow')`, which cross-fades to the poster, disposes everything and stores `sessionStorage tier=0` (try/catch).
- **No step-up.**

**7. Reduced motion** is tier 0. A live `matchMedia` `change` to `reduce` disposes the scene and shows the poster.

**8. Pointer, touch and gyro.**
- **Fine pointer:** a rAF-coalesced `pointermove` sets the target rotation to ±0.35 rad, lerped with `k = 1 - Math.exp(-8*dt)`.
- **Touch:** pointer events on the canvas only, with `touch-action: pan-y`. An intent lock starts rotation only if |dx| > |dy| after 8 px. Inertia uses friction 0.92 per 60 fps frame, normalised by time.
- **Tap:** `uImpulse = 1`, at most once every 400 ms.
- **Gyro:** offered only on `(pointer: coarse)` devices that have `DeviceOrientationEvent`.
  - **iOS 13+:** a 44 px glass `<button>`, "Tilt to explore", calls `requestPermission()` inside its click handler. On `granted` the chip hides and the choice is stored in `sessionStorage`. On `denied` the chip hides for the session and drag keeps working.
  - **Android:** gyro is enabled after the first touch on the stage.
  - **Mapping:** `beta`/`gamma` are clamped to ±20°, low-passed at 0.1 and corrected for `screen.orientation.angle`. The latest reading is consumed on the tick. The listener is attached only while the hero is visible.

**9. Theme.** On `themechange`, read the tokens with `getComputedStyle`, update `uColorA`, `uColorB` and `uRim`, and render once. Points use additive blending in dark mode and normal blending in light mode.

**10. Failure and disposal.**
- `webglcontextlost`, any throw, or a failed import calls `onFail`, and the poster stays.
- `unmount()` cancels rAF, removes listeners and observers, disposes geometry and material, then calls `renderer.dispose()` and `forceContextLoss()`.

**11. Accessibility.** The stage, canvas and poster are `aria-hidden="true"` and not focusable. No information exists only in the 3D.

**12. CLS 0.** The poster always occupies the stage box (`aspect-ratio: 1`). The canvas starts at `opacity: 0` and fades in over `--dur-4` after `onFirstFrame`.

---

## E. Performance budget and measurement

| Metric (Lighthouse mobile, simulated Slow 4G, Moto G Power) | Budget | Baselines (recorded in P0) |
|---|---|---|
| Lighthouse Perf / A11y / BP / SEO | ≥ 95 / 100 / 100 / 100 | live 2024 build; current `design-update` build |
| LCP | **≤ 2.0 s** lab; field p75 ≤ 2.5 s (no aspirational 1.2 s target) | both |
| CLS | ≤ 0.02 | both |
| TBT (lab) / INP (manual, real device) | ≤ 100 ms / ≤ 150 ms | both |
| FCP | ≤ 1.5 s | both |
| Initial JS (gz) | **≤ 80 KB**: React 19 + react-dom about 58–60, app ≤ 20 | live: `main.js` 1,002,462 B min |
| Initial CSS (gz) | **≤ 14 KB**, critical hero CSS inlined (≤ 6 KB) | live: `main.css` 185,661 B raw |
| 3D chunk (gz, after load and idle, tier ≥ 1) | **≤ 150 KB** (fallback: OGL) | – |
| Fonts | ≤ 75 KB woff2 total; 2 preloads with `crossorigin` | Raleway via a late `@import` |
| Requests before LCP | **≤ 7** (HTML, CSS, 2 fonts, JS, and headroom; LCP is pre-rendered text, so JS is not on its critical path) | – |
| First-view transfer, `?no3d` | ≤ 250 KB | over 3 MB |
| Images | AVIF first, WebP fallback. Avatar ≤ 35 KB, card ≤ 60 KB at 800w, resume preview ≤ 80 KB, OG PNG ≤ 150 KB | PNGs 136–708 KB; avatar 2.05 MB |
| Third-party origins at runtime | **0** by default (owner may opt into a form or analytics, Q2/Q8) | 3 |
| GPU while idle | 0 frames off-screen, with the tab hidden, or with the menu open | particles run everywhere |
| Caching | Hashed assets; GH Pages fixes `max-age=600` (known limit, no SW at launch) | same |

**How to measure:**
1. **P0 baselines:**
   - **Live build:** run `npx lighthouse https://swedr13.github.io/final --form-factor=mobile` three times and take the median.
   - **Current source:** build `design-update` locally (`npm ci && npm run build`), serve `build/` under `/final/` with `npx serve`, and run Lighthouse three times.
   - Record both in the PR, including JS and CSS byte sizes.
2. **Lighthouse CI** (GitHub Action, PRs to `main`) runs against `vite preview --base /final/` with `numberOfRuns: 3`, on the **`?no3d` URL**. CI Chrome has no GPU, so 3D would be tier 0 anyway, and this makes it explicit.
   - Assertions: `categories:performance >= 0.95`, `categories:accessibility = 1`, `largest-contentful-paint <= 2000`, `cumulative-layout-shift <= 0.02`, `total-blocking-time <= 100`, `resource-summary:script:size <= 85000` (transfer; initial JS only, because the three chunk is not requested at tier 0), `total-byte-weight <= 300000`.
3. **size-limit** is the gate for chunk sizes, independent of runtime: `index-*.js` ≤ 80 KB gz, `three-*.js` ≤ 150 KB gz, `index-*.css` ≤ 14 KB gz. `npm run analyze` opens the visualizer on demand.
4. **3D acceptance is manual, on a real GPU** (CI cannot cover it):
   - **DevTools Performance traces** on a desktop with a GPU at 4× and 6× CPU throttle. Check:
     - no long task over 50 ms after `load` caused by the scene, with compile included
     - tier-1 loop at ≥ 30 fps
     - the governor falls back at 6×
     - the dev frame counter shows 0 frames off-screen
   - **Lighthouse with 3D on**, run locally in headed Chrome without `?no3d`: Performance within ±2 of the `?no3d` run, total weight ≤ 500 KB.
   - **Real devices:** a mid-tier Android with Chrome and an iPhone with Safari, including the gyro permission flow. Measure INP on each with the DevTools Performance panel (live metrics) or remote debugging.

---

## F. Accessibility checklist

- [ ] **Headings:** one h1 (the name). h2 for each section, h3 for card titles. This fixes `Home.js:16,23`, `Home2.js:18,55`, `About.js:23,41,47` and `Footer.js:17,20`.
- [ ] **Landmarks:** `<header>`, `<nav aria-label="Primary">`, `<main id="main" tabindex="-1">`, `<section aria-labelledby>` and `<footer>`. The skip link is the first focusable element.
- [ ] **Focus:** delete `style.css` L21, L110 and L527. Add `:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 3px }`, with ≥ 3:1 contrast in both themes and on glass. `scroll-padding-top` keeps focused items clear of the header.
- [ ] **Icon-only controls** (socials, GitHub link, theme toggle "Theme: System. Switch to light", menu, copy email) have an `aria-label`. Their SVGs get `aria-hidden="true" focusable="false"`.
- [ ] **External links:** `rel="noopener noreferrer"`, visually hidden "(opens in new tab)" text and a visible ↗.
- [ ] **Chips** have visible text labels.
- [ ] **Alt text:**
  - Projects: `"{title} website screenshot"`.
  - Avatar: "Portrait of Junelle Suaybaguio".
  - Decorative SVG and canvas: `aria-hidden`.
  - Emoji: `role="img" aria-label="waving hand"`.
- [ ] **Rotating roles:** the animated spans are `aria-hidden`, the full sentence is visually hidden, and there is no `aria-live`.
- [ ] **Mobile menu:** a native modal `<dialog>` (inert background, Escape, focus contained), plus `aria-expanded`/`aria-controls` on the toggle. Focus returns to the toggle, and choosing a link closes the menu.
- [ ] **Filter:** `role="radiogroup"` with arrow keys and the count in `aria-live="polite"`. Focus is kept through the View Transition.
- [ ] **Touch targets:** at least 44×44 with 8 px spacing (nav, menu, toggle, socials, filter, card links, gyro chip).
- [ ] **Contrast AA in both themes:**
  - A Vitest **token contrast-ratio test** covers body text ≥ 4.5:1 and large text and UI ≥ 3:1.
  - Remove the 0.8/0.9 opacities and the `#934cce5e` buttons.
  - Text over glass gets a minimum-opacity background.
- [ ] **Preferences:**
  - Reduced motion: poster instead of the orb, instant reveals and View Transitions, no smooth scroll, frozen roles, no tilt, no shimmer.
  - `prefers-reduced-transparency`: no blur.
  - `forced-colors`: borders use `CanvasText`.
- [ ] **Text:** left-aligned (remove the justify at `AboutCard.js:9` and `ProjectCards.js:13`), ≤ 65ch, line-height 1.6. No horizontal scroll at 320 px or at 200% zoom.
- [ ] **Resume** available as HTML. The PDF link states its size.
- [ ] **Head:** `lang="en"`, a meaningful `<title>`, **one** meta description (the current file has two, at lines 9 and 12).
- [ ] **Toasts** never steal focus.
- [ ] **Not-found page** (`404.html`) has an h1, explanatory text and a link home, and follows the theme.
- [ ] **Automated checks:**
  - `eslint-plugin-jsx-a11y` in CI.
  - Lighthouse a11y = 100 in CI.
  - The token contrast test.
  - Note: jsdom-based axe cannot check contrast or focus visibility, so it is not used. Those are covered by the token test, Lighthouse (real Chrome) and the manual pass.
- [ ] **Manual checks:**
  - an axe DevTools scan of each section in both themes
  - keyboard only
  - NVDA (Windows), VoiceOver (iOS) and TalkBack (Android)

---

## G. CX polish

**Micro-interactions.** They animate only `transform` and `opacity`, last at most `--dur-3`, and are all off under reduced motion.
1. **Buttons:** press scales to 0.97. On hover the arrow nudges 3–4 px and an accent sheen slides across. No magnetic pull.
2. **Links:** the underline grows from the left. External links nudge their ↗.
3. **Nav:** the active underline glides, the header goes solid then glass, and the hamburger morphs into an X.
4. **Theme toggle:** a sun-to-moon SVG-mask morph, with a View Transition root cross-fade where supported.
5. **Project cards:** cursor spotlight, image zoom to 1.03, accent border and shadow lift. Focus mirrors hover.
6. **Tech chips:** lift by 2 px on hover or focus.
7. **Orb:** pointer parallax, drag inertia, tap ripple, and the opt-in gyro chip.
8. **Copy email:** the label changes to "Copied ✓" and a polite toast appears.
9. **Global:** `::selection` and the scrollbar use the accent token.
10. **Deliberately excluded:** custom cursor, magnetic CTA, CTA-to-orb pulse, pointer-speed "breathing", circular theme reveal and the chip-to-orb point highlights.

**Loading and skeleton states.**
- **Preloader:** none. It is deleted in P0, and the content is in the HTML from Phase 5.
- **Hero:** `OrbPoster` is the 3D loading state, with a cross-fade on the first frame and no spinner.
- **Project images and the resume preview:** a fixed-ratio frame with a blurred LQIP and a shimmer pseudo-element (static under reduced motion). On `load` the image fades in.
- **Fonts:** metric-matched fallbacks, so the swap causes no jump.
- **3D chunk failure or slow compile:** stays on the poster silently.

**Scroll-storytelling beats.** CSS `animation-timeline: view()` inside `@supports`, which covers Chromium and Safari 26. Firefox gets an IntersectionObserver `.is-in` fallback. Each reveal is a rise of at most 16 px plus a fade, with a 40 ms stagger, and runs once.
1. **Hero exit:** the stage scales to 0.85 and drifts up 6vh (a CSS transform). The brand name fades into the header.
2. **About:** the avatar reveals through a clip-path wipe, the bio rises and the quote lights up word by word.
3. **Stack:** chips cascade in, and the heading's accent word gets a highlighter sweep.
4. **Work:** a sticky mono label ("Selected Work · {count}"), cards rising row by row, and a sticky filter bar inside the section.
5. **Resume:** the timeline rail draws (scaleY with view progress) and the dots fill.
6. **Contact:** the headline scales from 0.96 to 1 with an accent bloom, and the orb echo fades in.
7. **Progress:** a 2 px reading bar (`animation-timeline: scroll(root)`). It is decorative and absent where unsupported.

---

## H. Owner decisions and open questions

**Blocking for the P0 production deploy:**
1. **Laser-machine and Next.js portfolio projects** (Q3) are live today but missing from current source. Redeploying from `design-update` removes them and adds DCWD Billing, DCWD DMA, AtchupikolQ and Expense Monitoring. Keep them (re-add to `Projects.js` in P0) or drop them?

**Blocking for Phase 6 (placeholders `TODO(owner)` until answered):**
1. Confirm the email: `junelleXIII@gmail.com` (`README.md:27`).
2. Contact: mailto only (default) or a form (Formspree or Web3Forms, which adds a third-party origin)? Use the planned email obfuscation (default yes)?
3. See the P0 item above.
4. Which bio to use as the base: `Home2.js` or `AboutCard.js`?
5. Add React Native to the Stack section (it is in the bio, not in `Techstack.js`)?
6. Resume experience entries as text.
7. Tags, year and role per project; confirm the web/mobile split; descriptions for the private projects; featured picks (suggested: Partsman, IMAWC).
8. Analytics: none (default) or a privacy-friendly service (GoatCounter or Cloudflare Web Analytics, which adds a third-party origin)?
9. Keep Facebook and Instagram, or show professional links only?
10. Keep the 👋? Show the "Available for work" pill?
11. Numbers for the facts row (years of experience, freelancing since).

---

## I. Phased task list

**Release rules for every phase:**
- Work on sub-branches from `design-update` and open a PR into `main`.
- Before each production deploy, tag the live branch: `git tag deploy-pN origin/gh-pages && git push origin deploy-pN`.
- **Rollback** by redeploying from the previous source tag. A force-push of `gh-pages` happens only with the owner's explicit approval.
- From P1 on, each phase deploys to `/final/preview/` first: `PREVIEW=1 vite build && gh-pages -d dist --dest preview --add --dotfiles`.
- The production deploy runs without `--add`, which **clears `/preview` on purpose**. Preview is redeployed for each phase.
- **Preview caveat (P1–P3):** a hard refresh on a deep link such as `/final/preview/about` gets the *production* `/final/404.html` and loads the production app. **Test preview from `/final/preview/` and navigate in-app, never by deep-link refresh.** This goes away in Phase 4, when there are no client routes and `404.html` handles both bases.

### Phase 0: Hotfixes on the current CRA app (no visual change)
| # | Task | Files | Acceptance criteria |
|---|---|---|---|
| 0.0 | Run `npm ci && npm run build` on Node 24. If it fails, switch to Node 20 LTS with nvm-windows and record the version in `.nvmrc` | – | The CRA build succeeds; the Node version is documented |
| 0.1 | Record both baselines (live 2024 build and current source build, Lighthouse mobile ×3, bytes); tag `deploy-p0-baseline` | git | Numbers in the PR; tag exists |
| 0.2 | **Content gate:** the owner answers the P0 blocking question. Re-add the two legacy projects to `Projects.js` if they are kept | `Projects.js` | The owner has approved the project list before production deploy |
| 0.3 | `<Router basename={process.env.PUBLIC_URL}>` | `src/App.js` | `/final/` stays inside `/final/` |
| 0.4 | `"postbuild": "node scripts/copy-404.mjs"`, `public/.nojekyll`, `gh-pages -d build --dotfiles` | `package.json`, `scripts/copy-404.mjs`, `public/.nojekyll` | A hard refresh of `/final/about` renders About |
| 0.5 | `Navbar.Brand as={Link} to="/"`; GitHub link points to `swedr13/final` | `Navbar.js:37,90` | The logo stays in the app |
| 0.6 | Move the scroll listener into `useEffect` with cleanup and `{passive:true}`; `expanded` becomes a boolean | `Navbar.js:27,43` | One listener after 20 re-renders |
| 0.7 | Delete the preloader: `load` state, `Pre.js`, `pre.svg`, the `#preloader`/`#no-scroll` rules | `App.js:21-34`, `Pre.js`, `Assets/pre.svg`, `style.css` | No 1.2 s delay |
| 0.8 | Fix `public/index.html` (one description, own `og:url`/`og:image`, new 1200×630 `og-image.png`, canonical) and the `manifest.json` names and colours | `public/*` | `grep -ri soumyajit public src` returns nothing |
| 0.9 | Remove `axios`, `@react-pdf/renderer`, `react-github-calendar`, `About/Github.js`, `App.test.js`; quick a11y fixes (labels, `rel`, `:focus-visible` replacing L21/L110/L527) | `package.json`, lockfile, `Footer.js`, `Home2.js`, `Navbar.js`, `ProjectCards.js`, `ResumeNew.js`, `style.css` | Build passes; axe DevTools shows no serious or critical issues on the 4 routes |
| 0.10 | Fix the README email typo (`.cokm` to `.com`) | `README.md` | – |
| 0.11 | **Decide the PDF rasterizer:** export page 1 of the resume once to `src/assets/resume-page1.png` (any PDF viewer at 150 dpi, or `pdftoppm`/`mutool`) and commit it; document the command in the README | `src/assets/resume-page1.png`, `README.md` | PNG committed; no runtime PDF dependency needed for 1.1 |
| 0.12 | Production deploy from the current source | – | Live site matches `design-update` plus the hotfixes; compare with both baselines |

### Phase 1: Vite + React 19 migration with visual parity
| # | Task | Files | Acceptance criteria |
|---|---|---|---|
| 1.1 | **Remove the React-17-only deps first:** delete `Particle.js` (use CSS grain instead); make `ResumeNew.js` a temporary static page (download and open buttons plus a preview built from `resume-page1.png` through `optimize-images.mjs`); remove `react-pdf` and `react-tsparticles`. Check the `typewriter-effect` and `react-parallax-tilt` peers. If either blocks React 19, bring its CSS replacement forward from 6.1/6.2. | `Particle.js`, `ResumeNew.js`, `scripts/optimize-images.mjs`, `package.json` | No pdfjs, tsparticles or cdnjs request |
| 1.2 | Add Vite (current major, exact pin), `@vitejs/plugin-react` and React/react-dom 19.x (exact pin). Remove `react-scripts`, `web-vitals@2` and `@testing-library/*@12`. Scripts: `dev/build/preview/deploy` | `package.json`, `vite.config.js` | `npm run dev` works on Node 24 (or the `.nvmrc` version); `engines >=20` |
| 1.3 | Move `public/index.html` to the root `index.html`; replace `%PUBLIC_URL%`; add the module script | `index.html` | Favicon and manifest resolve under `/final/` |
| 1.4 | Rename `.js` to `.jsx`; `main.jsx` uses `createRoot`; basename from `import.meta.env.BASE_URL`; fix the `Pre` style imports | `src/**` | No StrictMode console errors |
| 1.5 | Vitest + `@testing-library/react@16` + `@testing-library/dom` + jsdom; smoke test ("renders the owner's name"); delete `setupTests.js` and `reportWebVitals.js`; clean the `Server/` lines from `.gitignore` | `src/App.test.jsx`, `.gitignore` | `npm test` passes |
| 1.6 | Deploy script `vite build && node scripts/copy-404.mjs && gh-pages -d dist --dotfiles`, plus the preview variant | `package.json` | Preview and production screenshots match at 360/768/1280 (navigated in-app) |

### Phase 2: Content data and image pipeline
| # | Task | Files | Acceptance criteria |
|---|---|---|---|
| 2.1 | Create `content/{profile,socials,skills,projects,resume}.js` (location and email filled, other gaps `TODO(owner)`); components map over the data; drop `isBlog` | `src/content/*`, existing components | Name, social URLs and bio each appear in one file; rendered output unchanged |
| 2.2 | `vite-imagetools` + `<Picture>` (AVIF/WebP, srcset, lazy, width/height, LQIP) | `vite.config.js`, `ui/Picture.jsx` | Cards ≤ 60 KB at 800w; CLS 0 |
| 2.3 | `optimize-images.mjs`: avatar 320/480/640, OG image, icons 192/512, apple-touch, resume preview | `scripts/`, `public/` | Avatar ≤ 35 KB; preview ≤ 80 KB |
| 2.4 | Delete the unused assets **that the owner has cleared in P0** (keep the two legacy project images if they are kept) | `src/Assets`, `public/favicon.png` | Build passes; no 404s |
| 2.5 | Move the PDF to `public/` | `public/Junelle-Suaybaguio-Resume.pdf` | Download works from `/final/` |

### Phase 3: Foundations (alongside Bootstrap, layers fixed)
| # | Task | Files | Acceptance criteria |
|---|---|---|---|
| 3.1 | `layers.css` with the order `vendor, legacy, reset, tokens, base, layout, components, utilities`; Bootstrap imported `layer(vendor)` and `style.css` `layer(legacy)`. **Audit the 234 `!important`s**: list them by section in the PR, mark the ones that would override new code, and schedule their removal in the matching 6.x PR. Map the purples to tokens. | `src/styles/*`, `style.css` | A test rule in `@layer components` beats a Bootstrap rule of equal specificity; no dark-mode regression in screenshots; `!important` inventory committed |
| 3.2 | `copy-fonts.mjs` from `@fontsource-variable/inter` and `@fontsource/instrument-serif` (latin), optional `pyftsubset`; `@font-face` with fallback metric overrides; `<link rel="preload" as="font" type="font/woff2" crossorigin>` for both; delete the `index.css` `@import` | `scripts/`, `public/fonts`, `index.html`, `fonts.css`, `index.css` | No fonts.googleapis request; no duplicate font fetch (preload reused); font CLS 0; fonts total ≤ 75 KB |
| 3.3 | Theme script, `useTheme`, `ThemeToggle`, dual `theme-color`, VT cross-fade | `index.html`, `hooks/useTheme.js`, `ui/ThemeToggle.jsx` | No flash after a hard reload in any mode; choice persists; System follows the OS live; token contrast test passes |
| 3.4 | Primitives: `Section`, `Button`, `Chip`, `IconLink`, `SocialLinks`, `VisuallyHidden`, `Skeleton`, `Toast` | `components/ui/*` | `SocialLinks` used in 3 places; every link labelled |
| 3.5 | **SSR guardrails:** an ESLint `no-restricted-globals` rule (`window`, `document`, `localStorage`, `matchMedia`, `navigator`) on component render bodies, with an `// effects ok` override in hooks; a Vitest **SSR smoke test** that calls `renderToString(<App/>)` in the Node environment | `eslint.config.js`, `src/ssr.test.jsx` | CI fails if render code touches browser globals |

### Phase 4: Single-page shell and navigation
| # | Task | Files | Acceptance criteria |
|---|---|---|---|
| 4.1 | `App.jsx` holds SkipLink, Header, `<main>` with 6 sections, Footer. Remove react-router, `ScrollToTop.js` and `copy-404.mjs`. New `public/404.html`: it maps `/final/about`, `/final/project` and `/final/resume` (and the `/final/preview/` equivalents) to anchors, and shows a **styled "Page not found" with a link home** for anything else (no silent redirect) | `App.jsx`, `public/404.html`, `package.json` | No router in the bundle; `/final/about` lands on `/final/#about`; `/final/xyz` shows the not-found page; back and forward work with hashes |
| 4.2 | `Header.jsx` (IO sentinel and hero observer; solid over the hero, glass after; `useActiveSection`) and `MobileMenu.jsx` (`<dialog>` + `showModal`, `@starting-style` transitions, focus return, `:has()` scroll lock, close on link) | `components/layout/*`, `hooks/*` | Keyboard-only run passes; no `scroll` listeners on `window`; menu passes axe DevTools; initial JS grows by ≤ 3 KB |
| 4.3 | Delete `Navbar.js`; move `Logo.js` to `ui/` | – | No react-bootstrap Navbar import |

### Phase 5: Pre-rendering (moved up, before the section rebuild)
| # | Task | Acceptance criteria |
|---|---|---|
| 5.1 | `entry-server.jsx` exports `render()`, using React 19 `prerender` from `react-dom/static`; `scripts/prerender.mjs` injects the result at `<!--app-->`; `main.jsx` uses `hydrateRoot`. Media hooks use `useSyncExternalStore` with server snapshots. URL-dependent state (`?f=`, active section) and the email assembly are read in effects. **Timeboxed to 1–2 days.** If it overruns, try `vite-react-ssg`; otherwise ship client-rendered. | View Source shows the header, the hero h1 and all section text; no hydration warnings in either theme or with `?f=mobile`; SSR smoke test passes |
| 5.2 | Inline the critical hero CSS (≤ 6 KB) into `index.html` at build time | Requests before LCP ≤ 7; **lab LCP ≤ 2.0 s** on preview |

### Phase 6: Sections, static first (one PR each; each removes Bootstrap and its legacy `!important`s from its area)
| # | Task | Acceptance criteria |
|---|---|---|
| 6.1 | Hero: `OrbPoster`, h1 with serif span, CSS role rotator, CTAs. Delete `Home.js`, `Type.js`, `home-main.svg`, `typewriter-effect`. | Pre-rendered h1 is the LCP element; **lab LCP ≤ 2.0 s** (target ≤ 1.5 s) |
| 6.2 | About: merged bio, CSS tilt, pull quote, facts `<dl>`. Delete `Home2.js`, `About.js`, `AboutCard.js`, `react-parallax-tilt`. | Avatar not in the initial waterfall; one h2 |
| 6.3 | Stack: grouped, labelled chips (React Native per Q5). Delete `Techstack.js`, `Toolstack.js`. | Every item announced by a screen reader |
| 6.4 | Work: `ProjectCard` (stretched link, private badge, featured span) and `ProjectFilter` (radiogroup, `?f=` read in an effect, View Transition reflow, live count). Delete `Projects.js`, `ProjectCards.js`. | Filter works by keyboard; count announced; no hydration warning with `?f=mobile`; CLS 0 |
| 6.5 | Resume: HTML timeline, preview image, download and open buttons. Delete `ResumeNew.js`. | Text readable by a screen reader; no pdfjs |
| 6.6 | Contact and Footer: mailto with obfuscation (or a form per Q2), copy toast, socials, back to top. Delete `Footer.js`. | `<footer>` landmark; copy announced; address not present as plain `mailto:` in the HTML source |
| 6.7 | **Remove the Bootstrap import, `react-bootstrap`, `bootstrap`, `style.css`, `App.css` and the `vendor`/`legacy` layers** | CSS ≤ 14 KB gz; no `!important` outside utilities; screenshot diffs at 360/768/1280 reviewed |

### Phase 7: Motion and storytelling polish (CSS only)
| # | Task | Acceptance criteria |
|---|---|---|
| 7.1 | `motion.css`: scroll-driven reveals with the `useInView` fallback (Firefox), hero-exit settle, quote lighting, timeline draw, progress bar, Contact orb echo | Everything static under reduced motion; Layout Shift Regions clean |
| 7.2 | Micro-interactions G1–G9, LQIP and shimmer skeletons | INP ≤ 150 ms on a mid-tier Android for filter, menu and theme (manual) |

### Phase 8: 3D hero (progressive enhancement; requires Phase 5)
| # | Task | Acceptance criteria |
|---|---|---|
| 8.1 | `capability.js` and the `Hero3D.jsx` gate: `getTier()` runs **only inside the load, idle and in-view callback**; `?no3d`; session tier | Tier 0 (reduced motion, Save-Data, `?no3d`) never requests the three chunk; the trace shows no WebGL probe before `load` |
| 8.2 | `scene.js` + `shaders.js`: orb (detail 12/6), point field (240/120), DPR clamp, ResizeObserver, `compileAsync` with compile-time gating, throttled on-demand loop, IO/visibility/menu pause, step-down governor, context loss, dispose | size-limit: chunk ≤ 150 KB gz (else OGL port); 2 draw calls. **Manual real-GPU trace:** no scene long task over 50 ms after load (compile included) at 4× CPU; tier-1 ≥ 30 fps; 6× CPU falls back to the poster without jank; 0 frames off-screen, hidden or with the menu open (dev counter). Local headed Lighthouse with 3D within ±2 of `?no3d`. CI LHCI (`?no3d`) unchanged. |
| 8.3 | `input.js`: pointer parallax, `pan-y` drag with intent lock and inertia, tap `uImpulse`, iOS permission chip, Android gyro | Vertical scroll never blocked on a real iPhone or Android; iOS prompt only after a chip tap; drag still works after a denial |
| 8.4 | Theme uniforms | The orb recolours in the same frame as the CSS theme switch |

### Phase 9: SEO and content
| # | Task | Acceptance criteria |
|---|---|---|
| 9.1 | `index.html`: canonical `https://swedr13.github.io/final/`; OG/Twitter tags with `/final/og-image.png` and its dimensions; Person JSON-LD (`sameAs` = socials, `address` = Davao City, PH); `apple-touch-icon`; `manifest.webmanifest`; `sitemap.xml`; `robots.txt` | Lighthouse SEO and Best Practices = 100; share-card debugger correct |
| 9.2 | Owner-input gate: `grep -rn "TODO(owner)" src` returns nothing | Clean grep |
| 9.3 | Analytics per Q8 (none by default) | Third-party origin budget updated if one is added |
| 9.4 | Regenerate `Images/readme-img.png` and `readme-img1.png` from the new site; README uses `og-image.png` and gets dev, build, deploy and PDF re-export instructions | README images show the new design |

### Phase 10: CI and launch
| # | Task | Acceptance criteria |
|---|---|---|
| 10.1 | GitHub Actions on Node 22 LTS: build (including prerender), Vitest (smoke, SSR, token contrast), ESLint (jsx-a11y and the SSR rule), size-limit, LHCI on `?no3d`; deploy on `main` | CI fails on a deliberate budget breach and on a deliberate `window` access in render |
| 10.2 | Production deploy and QA matrix: iPhone Safari, mid-tier Android Chrome, desktop Chrome/Firefox/Safari; widths 320/375/768/1024/1440; both themes; reduced motion; keyboard only; VoiceOver/TalkBack/NVDA; legacy URLs and an unknown URL (not-found page) | All section E budgets met on the live URL; compared against both P0 baselines |

---

## J. Risks and mitigations

| Risk | Mitigation |
|---|---|
| The P0 deploy silently changes the live project list | Content gate 0.2. The owner approves the list before 0.12. |
| The CRA build fails on Node 24 | Task 0.0 falls back to Node 20 with `.nvmrc`. |
| The Vite migration breaks asset paths under `/final/` | P0 fixes routing first. P1 is verified on `/final/preview/` (navigated in-app, see the preview caveat). Tags allow a rollback by redeploy. |
| React-17-only peers block React 19 | Task 1.1 removes tsparticles and react-pdf first. Typewriter and tilt are checked, and their CSS replacements brought forward if needed. |
| Cascade fights during Bootstrap coexistence | Explicit `vendor`/`legacy` layers (3.1), a committed `!important` inventory, and removal per section. Bootstrap is gone in 6.7. |
| Hydration mismatches | Pre-render lands in Phase 5, before the sections. The SSR lint rule and smoke test run from Phase 3. URL, theme and media state are read in effects or through `useSyncExternalStore` server snapshots. Timeboxed, with `vite-react-ssg` and then client-rendering as fallbacks. |
| The three chunk exceeds 150 KB gz | size-limit gate. OGL port behind the same `mount()`. |
| Shader compile or the WebGL probe cause long tasks | Probe inside idle after `load`, `compileAsync` with `KHR_parallel_shader_compile`, and compile-time gating of the tier. |
| CI cannot see 3D regressions (no GPU) | LHCI is explicitly `?no3d`. 3D acceptance uses manual traces on real GPUs and local headed Lighthouse. |
| 3D hurts battery or INP | Tier gating, 30 fps on tier 1, pause when not visible, step-down governor with poster fallback. |
| Serif font on the LCP path | The h1 body is Inter. Both fonts are subset, preloaded with `crossorigin` and have metric-matched fallbacks. |
| Blur over the canvas is slow on low-end Android | The header is solid (no blur) while over the hero and glass only after it. `@supports` and reduced-transparency fallbacks. |
| View Transitions unsupported (older Firefox/Safari) | The filter and theme switch apply instantly. Functionality is unchanged. |
| Scroll-driven CSS missing (Firefox) | IntersectionObserver `.is-in` fallback. |
| The owner wants Framer Motion or GSAP | ADR: only inside a lazy chunk (Motion `layout` needs `domMax`, about 25 KB gz), only for effects CSS and View Transitions cannot do, and within size-limit. |
| GH Pages caching is short (600 s) | Hashed assets and small payloads. Accepted limit; a service worker is a post-launch option. |
| The email is scraped from pre-rendered HTML | Split data attributes assembled in an effect (Q2). |
| Legacy shared links or unknown URLs | The `404.html` map for `/about`, `/project` and `/resume`, plus a styled not-found page. |
| Content gaps stall Phase 6 | `TODO(owner)` placeholders unblock the code, and the grep gate 9.2 blocks launch. |
| Windows tooling quirks | Node scripts instead of shell `cp`; CI on Node 22 LTS. |

**Order dependencies:**
- Phase 0 must finish before Phase 1.
- Task 0.11 (PDF export) must be done before 1.1.
- The `!important` audit in 3.1 must be done before any 6.x.
- Phase 5 must be done before Phase 6 and before Phase 8.
- Owner question Q3 must be answered before 0.12 and 2.4.

**Key paths:**
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/package.json`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/README.md`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/src/App.js`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/src/style.css`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/src/index.css`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/src/components/Navbar.js`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/src/components/Pre.js`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/src/components/Home/Home2.js`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/src/components/Projects/Projects.js`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/src/components/Resume/ResumeNew.js`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/public/index.html`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/public/manifest.json`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/src/Assets/`
- `C:/Users/jcsuaybaguio/Documents/GitHub/final/Images/`
---

## Implementation notes (2026-11-06)

Built directly to the end state on `design-update` rather than through the ten incremental production deploys. Nothing has been deployed.

**Deviations from the plan**
- **Phases 0 and 3.1 skipped.** The CRA hotfixes and the Bootstrap/legacy cascade-layer coexistence only existed to keep production working between incremental deploys. Bootstrap, `style.css` and every legacy component were removed in one step.
- **Owner questions answered from the source of truth:**
  - The two legacy projects (laser-machine, Next.js portfolio) stay removed, following commit 4a8c196 where they were replaced by the DCWD projects.
  - Role and copy come from the current résumé PDF (Full-Stack Developer at DCWD).
  - Contact is mailto-only with obfuscation, no analytics, and all four socials kept.
  - React Native is in the stack.
- **No résumé preview image.** No PDF rasterizer is available (`pdftoppm` and `mutool` are absent). The section is a full HTML timeline transcribed from the PDF, plus Download and Open buttons.
- **Images are pre-generated** by `scripts/optimize-images.mjs` (sharp) and committed, instead of using `vite-imagetools` at build time.
- **JS budget raised from 80 KB to 100 KB gz.** React 19.3 + react-dom measured **68.6 KB gz on its own**; the plan assumed 58–60. The app adds about 28 KB.
- **The capability probe also rejects software WebGL renderers** (SwiftShader, llvmpipe and similar) and sends them to the poster.
- **`content-visibility: auto` on sections** and main-thread yields in the 3D setup were added after Lighthouse traces.
- **Only Inter is preloaded.** The serif tagline font is not on the LCP path.

**Measured** (Lighthouse 12, mobile preset, Edge headless, local GitHub-Pages mock with gzip, 3 runs each)

| | Perf | A11y | BP | SEO | LCP | TBT | CLS | Transfer |
|---|---|---|---|---|---|---|---|---|
| `?no3d` | 98 | 100 | 100 | 100 | 2.2–2.3 s | 10–40 ms | 0 | 218 KiB |
| with 3D | 97–98 | 100 | 100 | 100 | 2.2–2.3 s | 10–110 ms | 0 | 349 KiB |

Lab LCP is 0.2–0.3 s over the plan's 2.0 s target. The remaining time is simulated slow-4G transfer of the HTML (33 KB gz) and Inter (48 KB). LHCI asserts LCP ≤ 2.5 s.

Size-limit: initial JS 96.8 KB, 3D chunk 133.9 KB, HTML (with inlined CSS) 32.6 KB, all gz.

**Still requires a human**
- Real-device QA: iPhone Safari gyro permission flow, mid-tier Android INP, VoiceOver, TalkBack and NVDA passes.
- Confirming the copy.
- Merging to `main`, which triggers CI and the deploy.
