# TripBuddy AI — frontend

Next.js 15 **App Router** frontend, exported as a static site.

This project is plain JavaScript (no TypeScript) with Tailwind CSS v4
(CSS-first config — there is no `tailwind.config.js`).

## Commands

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export to dist/
npm run start   # serve dist/ locally to check the production output
npm run lint    # oxlint
```

`npm run start` uses `serve dist`, not `next start`: `next start` refuses to run
against an `output: 'export'` project because there is no server build to start.
It is only a local preview — in production the host serves the same static files.

## How it fits together

`output: 'export'` in `next.config.mjs` produces a fully static `dist/`, so the
build has no server runtime. Two consequences:

- `images.unoptimized` is required; use plain `<img>` rather than `next/image`.
- `metadata` is exported from the route files in `app/`, which are server
  components, so tags are baked into the prerendered HTML. Per-page tags
  therefore do not depend on JavaScript running.

## Layout

```
app/                    App Router routes
  layout.js             html shell, fonts, global metadata, Navbar/Footer
  page.js               /            + WebApplication JSON-LD
  planner/page.js       /planner     wrapped in <Suspense> for useSearchParams
  privacy-policy/       /privacy-policy
  terms/                /terms
  not-found.js          404
src/
  screens/              page bodies (client components)
  components/           landing/ layout/ planner/
  services/api.js       the only module that calls the backend
  lib/metadata.js       buildMetadata() used by the route files
  lib/useHashLink.js    client-side hash navigation
```

`src/screens` is deliberately **not** named `pages` — Next treats a `pages`
directory as the legacy Pages Router and would try to treat those files as
routes.

## Talking to the backend

`src/services/api.js` resolves the base URL in this order:

1. `NEXT_PUBLIC_API_BASE_URL`
2. `window.location.origin` (when not on localhost — the static host and API
   share an origin in production)
3. `http://127.0.0.1:8000` for local development

Requests carry a timeout via `AbortController`, and the planner aborts an
in-flight request if you navigate away.

## Deploying

Build command `npm run build`, publish directory `dist`. The API base URL is
baked in at build time, so set `NEXT_PUBLIC_API_BASE_URL` before building.
