# Wiqnnc_’s Wiki OS — Architecture Overview

## Mission
Build an offline-first personal “Wiki OS” for Kirati “Win” Rattanaporn that provides instant global search, deep knowledge browsing, and cinematic presentation without any cloud dependencies.

## Core Stack
- **Framework:** Astro with React islands (for rich interactions) and strict TypeScript.
- **Styling:** Tailwind CSS + CSS variables for theming, with handcrafted starfield background.
- **Animations:** Framer Motion (React) for micro-interactions, reduced-motion fallbacks.
- **Fonts:** Local SF Pro/Inter fallbacks with bundled variable font files.
- **Icons:** Phosphor Icons (tree-shaken React components).

## Data & Content
- Structured JSON files in `/data` (bio, education, awards, repositories, media, presence).
- Repository metadata captured via a build-time GitHub GraphQL fetcher that snapshots stars, descriptions, languages, and last update timestamps.
- EXIF/metadata JSON for photography entries to power the lightbox overlay.
- Static markdown/MDX profiles rendered to curated pages (bio, projects, awards, timeline).

## Search Layer
- Orama WASM index generated at build: `scripts/build-search.ts` consumes `/data` and emits `/public/search-index.orama`.
- Client hydrates index once and caches via Service Worker; supports `/` search field, `/wiki/search?q=` deep links, keyboard shortcuts (`⌘K`, `/`), entity chips, and since-last-visit state (localStorage).

## Theming & UI
- Global space gradient (`#0b1624` → `#02060f`) with starfield canvas (prefers-reduced-motion fallback to static image).
- Dual theme switcher: **Space** (default) and **Heritage** (olive/gold acccents).
- Typography scale (Clamp-based): Display, Headline, Title, Body, Caption; limited to 60–72 CPL.
- Components: top loader, sticky TOC, repo cards with animated language bars, award medal filters, timeline scrub bar, PWA prompts.

## Offline & Performance
- PWA support via `astro-pwa` integration and custom Service Worker caching HTML, JSON, index, and media poster assets.
- Deploy target: fully static export deployable to Vercel/Netlify or local file server.
- Performance budgets: LCP < 1.5s, TTI < 2s, CLS < 0.02, JS ≤ 180kb gz (monitored with `astro build --experimental-flags` + Lighthouse CLI script).
- Accessibility: WCAG AA, focus-visible, semantic landmarks, skip links, focus trap for modals.

## Tooling & Scripts
- `pnpm` preferred package manager; `npm` fallback.
- `scripts/update-repos.ts` – fetch GitHub metadata and write to `/data/repos.json`.
- `scripts/generate-search.ts` – build Orama index from data.
- `scripts/lint` – run `biome` (or `eslint` + `stylelint`) for consistency.
- Husky hooks optional (pre-commit data validation).

