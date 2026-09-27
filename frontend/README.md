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

The static site and the API are **separate** services:

- site — `https://tripbuddy-multiagent-travel-planner-1.onrender.com`
- API — `https://tripbuddy-multiagent-travel-planner.onrender.com`

`src/services/api.js` resolves the base URL in this order:

1. `http://127.0.0.1:8000` on localhost, so local dev never leaves the machine
2. the `<meta name="api-base-url">` tag emitted by `app/layout.js`
3. the known API service as a fallback

It never falls back to `window.location.origin`. An earlier version did, and
that was the production bug: the static host answers `/api/travel` with the
exported HTML, so `response.json()` produced `{}`, the success check passed,
and the planner rendered an empty plan with no error. A non-JSON response is
now rejected outright, and a base equal to the page origin is refused, so the
failure can no longer be silent.

Next inlines `NEXT_PUBLIC_*` at build time, which is why the value is also
emitted as a meta tag: `scripts/set-api-base.mjs` can rewrite it in the built
HTML afterwards, so a deployed site can be repointed without a full rebuild.

Requests carry a timeout via `AbortController`, and the planner aborts an
in-flight request if you navigate away.

## Routes and URLs

`trailingSlash: true` is required, and not cosmetic. The build emits
`planner/index.html` rather than a flat `planner.html`, because a static host
resolves a URL against the filesystem: a request for the extensionless
`/planner` finds no matching file and falls back to `index.html`, which
silently renders the home page.

Consequences to keep in mind:

- `/planner/` is canonical. Every `<Link>` is rewritten to it automatically.
- `router.push` is **not** rewritten, so any programmatic navigation must
  include the trailing slash or a refresh breaks. `npm run build` fails the
  build if one does not.
- Render's static host does not honour a `_redirects` file, and does not
  redirect `/planner` to `/planner/`. The extensionless URL keeps serving the
  home page. Use the canonical trailing-slash form in links and docs.
- Canonical tags, `og:url`, and `public/sitemap.xml` all use the trailing
  slash, and the export check asserts they stay consistent.

`scripts/check-planner-export.mjs` runs as part of `npm run build` and fails it
if the planner page stops being prerendered, if a route is emitted as a flat
file, or if any canonical URL drifts from its route.

## Deploying

Build command `npm run build`, publish directory `dist`.

Set `NEXT_PUBLIC_API_BASE_URL` to the **API** service URL, not the site URL. A
value equal to the site URL is ignored in favour of the known API default, but
setting it correctly avoids relying on that fallback.

