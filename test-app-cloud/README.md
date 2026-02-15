# Tailwind v3 Test App (Cloud - Cloudflare)

React 19 + Vite test app connected **directly to Cloudflare deployment**.

## Run

```bash
pnpm dev
```

Open http://localhost:5175.

## Configuration

This app connects directly to the production Cloudflare deployment:
- **Endpoint**: `https://quickbugs-dashboard.a-abdulkadir-ali.workers.dev/api/ingest`
- **Port**: 5175 (different from local test app on 5174)
- **Project Key**: `qb_wvw73zh91j5a`
- **No proxy needed** - direct cloud connection

## Comparison

- **test-app-tw3** (port 5174): Local development, proxied to `localhost:3000`
- **test-app-cloud** (port 5175): Production testing, direct to Cloudflare

## What it proves

- Library CSS (`styles.css`) works when imported through a Tailwind v3 + PostCSS pipeline
- No `@layer` or `var(--color-*)` conflicts with Tailwind v3's output
- Floating button is fixed at bottom-right with correct colors/spacing
- The host app's own Tailwind v3 classes render correctly alongside library styles
