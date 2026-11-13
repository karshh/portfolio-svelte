# Architecture and maintenance guide

This application uses Svelte 5 and SvelteKit 3 in server-rendered mode. Its visible output is kept
in parity with `portfolio-angular`, while private configuration and external API calls stay on the
server.

## Request flow

```text
Browser request
  -> SvelteKit route loader (+page.server.ts)
  -> server data service (src/lib/server/data.ts)
  -> Environment Canada or City of Calgary API
  -> rendered page (+page.svelte)
  -> optional browser-only enhancement (clock, Leaflet, Turnstile)
```

The contact flow is separate:

```text
Contact page
  -> GET /api/contact/config (public Turnstile site key only)
  -> Cloudflare Turnstile challenge in the browser
  -> POST /api/contact
  -> input validation and Turnstile verification on the server
  -> Resend email API in production
```

Email addresses, Turnstile secrets, and Resend credentials must never be returned to the browser.

## Directory map

| Path                           | Responsibility                                              |
| ------------------------------ | ----------------------------------------------------------- |
| `src/routes/+layout.svelte`    | Shared navigation, metadata, page shell, and footer         |
| `src/routes/*/+page.svelte`    | Page markup and browser-only interactions                   |
| `src/routes/*/+page.server.ts` | SSR data loading for a page                                 |
| `src/routes/api/contact`       | Server endpoints for contact configuration and delivery     |
| `src/lib/CalgaryMap.svelte`    | Browser-only Leaflet map integration                        |
| `src/lib/NewsPanel.svelte`     | Reusable news-card presentation                             |
| `src/lib/server/data.ts`       | Typed adapters for external weather and Calgary datasets    |
| `src/lib/server/contact.ts`    | Pure contact payload validation                             |
| `src/lib/portfolio.ts`         | Static skills and project content                           |
| `src/app.css`                  | Shared visual contract inherited from the Angular portfolio |
| `src/routes/*.e2e.ts`          | Functional, responsive, and visual Playwright coverage      |

## Server and browser boundaries

Files under `src/lib/server` and `+page.server.ts` run only on the server. Keep upstream API calls
there so credentials and cross-origin details are not exposed to the client.

Leaflet and Turnstile require browser globals. They are initialized from `onMount`, which does not
run during SSR. When adding another browser-only dependency, follow the same pattern and clean up
resources in the function returned by `onMount`.

## External data

- Weather: Environment and Climate Change Canada GeoMet API
- News, incidents, and detours: City of Calgary Open Data (Socrata)
- Maps: Leaflet with OpenStreetMap tiles
- Bot protection: Cloudflare Turnstile
- Contact delivery: Resend

Each upstream call has a server-side adapter that validates or normalizes its response before the
page receives it. A failed source should degrade to an empty or unavailable state rather than crash
the entire page.

## Environment variables

Copy `.env.example` to `.env` for local configuration. Development falls back to Cloudflare's
published Turnstile test keys and deliberately skips email delivery. Production requires all five
variables in `.env.example`.

## Making a visual change

1. Update the relevant Svelte component or `src/app.css`.
2. Run `npm run format`, `npm run lint`, `npm run check`, and the unit tests.
3. Run `npm run test:e2e` to compare against the committed desktop/mobile screenshots.
4. Only when the visual change is intentional, run `npm run test:visual:update` and review every
   changed image before committing.

## Adding a page

1. Create `src/routes/<route>/+page.svelte`.
2. Add `+page.server.ts` when the page needs server-side data.
3. Add the route to `navigationItems` in `src/routes/+layout.svelte`.
4. Extend the functional and visual route lists in the Playwright tests.
5. Verify desktop and 390-pixel mobile layouts.
