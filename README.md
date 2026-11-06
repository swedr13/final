# Junelle Suaybaguio — Portfolio

![Portfolio preview](public/og-image.png)

Personal portfolio of **Junelle Suaybaguio**, full-stack developer in Davao City, Philippines.
Live at **https://swedr13.github.io/final**.

- **Email:** junelleXIII@gmail.com
- **LinkedIn:** https://www.linkedin.com/in/junelle-suaybaguio/
- **GitHub:** https://github.com/swedr13

## Stack

| Concern | Choice |
|---|---|
| Build | Vite 8, React 19 (pinned), single page with anchor sections |
| Rendering | Pre-rendered at build time (`react-dom/static`), hydrated on the client |
| Styling | Plain CSS in cascade layers, design tokens, fluid `clamp()` type, dark/light/system themes |
| Motion | CSS only: transitions, `@starting-style`, scroll-driven animations, View Transitions |
| 3D | Vanilla `three` "Signal Orb", lazy-loaded only on capable devices; SVG poster fallback |
| Fonts | Self-hosted Inter Variable + Instrument Serif Italic (latin subsets) |
| Quality gates | ESLint + jsx-a11y, Vitest (smoke, SSR, token contrast), size-limit, Lighthouse CI |

The full design and engineering plan is in [PLAN.md](PLAN.md).

## Develop

Requires Node 20.19+ (CI uses Node 22).

```bash
npm install
npm run dev        # http://localhost:5173/final/
npm run check      # lint + tests + production build + size budgets
npm run preview    # serve the production build at http://localhost:4173/final/
```

Append `?no3d` to any URL to force the static poster instead of the WebGL orb.

## Editing content

All copy lives in `src/content/`:

- `profile.js` — name, roles, bio, quote, facts, email
- `projects.js` — Work section (each `image` is a key in `src/assets/img/manifest.json`)
- `skills.js`, `socials.js`, `resume.js`

### Images

Source images live in `src/assets/` (`avatar.png`, `projects/*.png`). After adding or changing one, run:

```bash
npm run assets     # regenerates AVIF/WebP sizes + blur placeholders, icons, OG image, fonts
```

and commit the generated files in `src/assets/img/` and `public/`.

### Résumé PDF

Replace `public/Junelle-Suaybaguio-Resume.pdf` and update `src/content/resume.js` (the on-page timeline) and
`resumePdfSize` in `profile.js` to match.

## Deploy

GitHub Pages serves the `gh-pages` branch under `/final/`.

- **Automatic:** pushing to `main` runs CI (`.github/workflows/ci.yml`); if every gate passes, `dist/` is published to `gh-pages`.
- **Manual:** `npm run deploy`.
- **Preview first:** `npm run deploy:preview` publishes to `/final/preview/` without touching production.

`public/404.html` redirects the old URLs (`/final/about`, `/final/project`, `/final/resume`) to the matching sections and
shows a styled "Page not found" for anything else.
