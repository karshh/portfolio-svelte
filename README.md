# Portfolio Svelte

Svelte/SvelteKit SSR implementation of Karsh Sharma's portfolio. It deliberately shares the Angular portfolio's visual and usability contract across `/home`, `/news`, `/sait`, and `/contact`.

## Development

Requires Node 22+.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` to configure Cloudflare Turnstile and Resend. Contact addresses and provider credentials remain server-only.

## Verification

```bash
npm run check
npm run test:unit -- --run
npm run build
npm run test:e2e
```

`npm run test:visual:update` intentionally refreshes the committed desktop/mobile baselines after an approved design change.
