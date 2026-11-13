# Portfolio Svelte

Svelte/SvelteKit SSR implementation of Karsh Sharma's portfolio. It deliberately shares the Angular portfolio's visual and usability contract across `/home`, `/news`, `/sait`, and `/contact`.

Start with [docs/architecture.md](docs/architecture.md) for the application flow, directory map,
external services, and guidance for making changes safely.

## Development

Requires Node 22+.

```bash
npm install
npm run dev
```

The main routes are:

- `/home` — portfolio introduction and server-loaded Environment Canada weather
- `/news` — server-loaded Calgary news, traffic incidents, and detours
- `/sait` — education, skills, and project history
- `/contact` — Turnstile-protected form delivered through the server

Copy `.env.example` to `.env` to configure Cloudflare Turnstile and Resend. Contact addresses and provider credentials remain server-only.

## Verification

```bash
npm run check
npm run lint
npm run test:unit -- --run
npm run build
npm run test:e2e
```

`npm run test:visual:update` intentionally refreshes the committed desktop/mobile baselines after an approved design change.

Run `npm run format` before committing. CI-style verification should use `npm run lint`, which
checks both ESLint rules and Prettier formatting without changing files.
