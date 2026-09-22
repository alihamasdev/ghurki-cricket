# Deployment Guide

This project is a monorepo containing a web frontend (`apps/web`), an Express backend with tRPC (`apps/server`), and a React Native mobile app (`apps/native`), built using [better-t-stack](https://www.better-t-stack.dev/).

It is deployed to **Vercel** using **Vercel Services**, running both the Vite SPA and the Express backend serverless function under a unified domain.

---

## 1. Architecture Overview

```
                          Internet / User
                                 │
                                 ▼
                     Vercel Domain / Custom Domains
              (ghurki-cricket.vercel.app, stats.alihamas.pk)
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
           Path: /*                        Path: /api/*
                 │                               │
                 ▼                               ▼
       Web Service (apps/web)        Server Service (apps/server)
          Vite SPA Static                   Express + tRPC
       (TanStack Router + React)         (Node.js Serverless)
```

- **Frontend (`apps/web`)**: Built with Vite and served statically by Vercel edge. Client requests to the backend use `VITE_SERVER_URL=/api`.
- **Backend (`apps/server`)**: Bundled via `tsdown` into a standalone `dist/index.mjs` and executed as an Express Serverless Function on Vercel.
- **Rewrites (`vercel.json`)**: All `/api/*` routes are transparently routed to the Express server.

---

## 2. Environment Variables

Environment variables are defined in `.env` files and synced to Vercel:

| Variable          | Target               | Description                                                      |
| :---------------- | :------------------- | :--------------------------------------------------------------- |
| `DATABASE_URL`    | Production & Preview | Supabase / PostgreSQL pooled connection string                   |
| `DIRECT_URL`      | Production & Preview | Supabase / PostgreSQL direct connection string (for migrations)  |
| `VITE_SERVER_URL` | Production & Preview | Set to `/api` for same-origin proxying on Vercel                 |
| `PORT`            | Production & Preview | Port for server execution (defaults to `8000`)                   |
| `CORS_ORIGIN`     | Production & Preview | Allowed origins (defaults to `*`, supports comma-separated list) |

### Syncing Environment Variables to Vercel

Whenever you add or update secrets in `.env`:

```bash
# Sync local .env variables to Vercel Preview
bun env:preview

# Sync local .env variables to Vercel Production
bun env:production
```

---

## 3. Deployments

Since automatic Git deployments are intentionally disabled, all deployments are controlled via the terminal.

### Production Deployment

To ship changes directly to production:

```bash
bun deploy:prod
```

This runs `vercel deploy --prod`. It will update:

- `https://ghurki-cricket.vercel.app`
- Any attached production domains (e.g. `stats.alihamas.pk`, `gh.alihamas.pk`).

### Preview Deployment

To test changes on a real Vercel URL without touching production:

```bash
bun deploy
```

This runs `vercel deploy` without `--prod`. It creates an isolated deployment URL:

- e.g. `https://ghurki-cricket-<hash>-alihamasdev-team.vercel.app`
- Preview deployments share the `preview` target environment variables (database connection, etc.).

### Dry Run (Validation)

To verify deployment configurations before uploading:

```bash
bun deploy:check
```

---

## 4. Custom Domains (`*.alihamas.pk`)

To attach custom subdomains such as `stats.alihamas.pk` or `gh.alihamas.pk`:

1. Open your [Vercel Dashboard](https://vercel.com).
2. Navigate to: **Project (`ghurki-cricket`)** &rarr; **Settings** &rarr; **Domains**.
3. Enter your domain (e.g. `stats.alihamas.pk` and `gh.alihamas.pk`).
4. In your DNS provider (Cloudflare, Namecheap, etc.), add the corresponding DNS record:
   - **Type**: `CNAME`
   - **Name**: `stats` (or `gh`)
   - **Target / Value**: `cname.vercel-dns.com`

---

## 5. CORS Configuration

The Express backend ([`apps/server/src/index.ts`](file:///Users/mac/Developer/ghurki-cricket/apps/server/src/index.ts)) features dynamic origin resolution:

- **Wildcard & Subdomains**: Automatically allows all `*.alihamas.pk` and `alihamas.pk` domains.
- **Vercel Previews**: Automatically allows all `*.vercel.app` preview URLs.
- **Localhost**: Allows `http://localhost:*` and `127.0.0.1` for local development.
- **Explicit Origins**: Accepts custom comma-separated origins passed via the `CORS_ORIGIN` environment variable.

No code modifications are required when adding new subdomains under `alihamas.pk`.

---

## 6. Key Configuration Details

1. **Self-Contained Serverless Bundle (`apps/server/tsdown.config.ts`)**:
   In Bun/npm monorepos, dependencies are hoisted to the root `node_modules`. To prevent `Cannot find module` errors on Vercel's isolated service runner, `deps.alwaysBundle: [/.*/]` bundles all dependencies into `dist/index.mjs`.

2. **Headless CI Builds (`turbo.json`)**:
   `db:generate` has `"cache": false` without `"interactive": true`, allowing non-TTY CI runners on Vercel to generate Prisma clients without failing.

3. **Schema Parse Fallback (`packages/db/prisma.config.ts`)**:
   A fallback connection string is provided during schema generation so that `bun install` succeeds even before secrets are injected during CI bundle phase.
