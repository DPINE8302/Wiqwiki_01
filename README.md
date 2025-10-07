# Wiqnnc_’s Wiki OS

Offline-first knowledge operating system for Kirati "Win" Rattanaporn. Built with Astro, React islands, Tailwind, and an Orama search index so every fact, repo, and media entry is available instantly without network access.

## Stack
- Astro (static output, TypeScript strict)
- Tailwind CSS 4 + custom design tokens
- React + Framer Motion islands (animations queued)
- Orama local search (prebuilt JSON index)
- Service worker PWA with manifest + offline caching
- Zod data validation for `/data/*.json`

## Project Layout

```
.
├── data/                   # Authoritative JSON data sources
├── public/                 # Static assets, manifest, service worker, search index
├── scripts/                # Build utilities (search index generator)
├── src/
│   ├── components/         # React islands (SearchPanel, etc.)
│   ├── data/               # Zod schemas and typed data loader
│   ├── layouts/            # Site shell with PWA hooks and theming
│   ├── pages/              # Astro routes (home, bio, awards, repos, media)
│   └── styles/             # Tailwind entry + global tokens
└── docs/                   # Architecture notes and planning artifacts
```

## Getting Started

```sh
npm install
npm run dev
```

The dev server boots at `http://localhost:4321`. Tailwind and Astro support hot reload; the search index rebuilds automatically in dev as data files change.

## Build & Deploy

```sh
npm run build        # Generates search index + static Astro build
npm run preview      # Serves the production build locally
npm run clean        # Removes dist/.astro caches and generated assets
```

The build pipeline runs `scripts/generate-search.mjs` before `astro build` to snapshot all entities into `public/search-index.json` plus `search-manifest.json`. Deploy the contents of `dist/` to any static host (Vercel, Netlify, S3, local file server). PWA assets live in `public/` so they are included automatically.

## Data & Search Workflow

- Update structured content in `/data/*.json`.
- Run `npm run build:search` to regenerate the search index (included automatically in `npm run build`).
- The React `SearchPanel` loads `/search-index.json` and hydrates Orama client-side, honoring deep links (`?q=`) and shortcut triggers (`⌘K`, `/`).

GitHub repository metadata is stubbed for now; hook a future script at `scripts/update-repos.ts` (placeholder) to fetch live data via the GitHub GraphQL API, then rerun the search generator.

## Offline & PWA

- `public/sw.js` precaches core routes and the search bundle; navigation falls back to the cached shell when offline.
- `public/manifest.webmanifest` defines install metadata (standalone, dark theme).
- `SiteLayout` registers the service worker, links the manifest, and manages the Space/Heritage themes with localStorage persistence.

## Verification Checklist

- `npm run build`
- Lighthouse / PWA audit (recommended)
- Validate JSON data via `npm run build:search` (fails on schema errors)

## Next Enhancements

1. Wire GitHub GraphQL fetcher for repository metadata + live previews.
2. Add Framer Motion transitions (reduced-motion aware) and starfield canvas fallback.
3. Implement awards filter chips, timeline scrubber, and repo heatmap visualizations.
4. Bundle local font files (SF Pro equivalents) for complete offline typography.
