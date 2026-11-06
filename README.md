<p align="center">
  <img src="./logo.png" alt="Ghurki Cricket Logo" width="140" />
</p>

<h1 align="center">Ghurki Cricket</h1>

<p align="center">
  A modern, end-to-end type-safe cricket analytics and tournament management platform built for tracking matches, performance statistics, player rivalries, and expenses across web and mobile.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Runtime-Bun-black?logo=bun" alt="Bun" />
  <img src="https://img.shields.io/badge/Framework-React_19-blue?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Mobile-Expo_SDK_58-000020?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/API-tRPC_v11-2596be?logo=trpc" alt="tRPC" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Monorepo-Turborepo-ef4444?logo=turborepo" alt="Turborepo" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Player Media Management](#player-media-management)
- [UI Components & Design System](#ui-components--design-system)
- [Deployment](#deployment)

---

## Overview

**Ghurki Cricket** is a high-performance cricket tracking platform tailored for local leagues, club matches, and friendly rivalries. The platform tracks ball-by-ball performance, match results, player-of-the-match accolades, head-to-head batter vs. bowler rivalries, and ground expenses.

Built as an integrated monorepo using **Turborepo** and **Bun**, the workspace shares database schemas, business logic, environment validation, and type definitions between a responsive web client, a cross-platform Expo mobile app, and an Express-powered tRPC API server.

---

## Key Features

- **Match & Session Tracking**: Log match dates, venue details, overs, winning margins, innings scorecards, and highlight video links.
- **Deep Cricket Analytics**:
  - **Batting**: Runs, strike rates, fours, sixes, ducks, 30s, and 50s.
  - **Bowling**: Wickets, balls bowled, dots, extras (wides, no-balls), and multi-wicket milestones (2-fers, 3-fers).
  - **Fielding & Attendance**: Catches, run-outs, and participation history across sessions.
- **Rivalry & Duel Records**: Track head-to-head records between individual batters and bowlers over time.
- **Cross-Platform Access**:
  - **Web Application**: Fast Single Page Application (SPA) with TanStack Router, TanStack Table, Recharts, and shadcn/ui.
  - **Mobile Application**: Native iOS and Android application built with React Native 0.88, Expo SDK 58, and Expo Router.
- **End-to-End Type Safety**: Shared tRPC router contracts and Zod runtime schema validation prevent client-server contract mismatches.
- **Asset Pipeline**: Automatic image optimization and WebP conversion for player profile photos and avatars stored via Supabase Storage.
- **Match Expense Auditing**: Record and audit ground fees, gear costs, and player contributions per match day.

---

## Tech Stack

| Layer                | Technologies                                                                                                                                                                                                                   |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo & Build** | [Turborepo](https://turbo.build/), [Bun](https://bun.sh/) Workspaces, [Oxlint](https://oxc.rs/) & [Oxfmt](https://github.com/oxc-project/oxc)                                                                                  |
| **Web Frontend**     | [React 19](https://react.dev/), [Vite](https://vite.dev/), [TanStack Router](https://tanstack.com/router), [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Recharts](https://recharts.org/) |
| **Mobile App**       | [React Native](https://reactnative.dev/), [Expo SDK 58](https://expo.dev/), [Expo Router](https://docs.expo.dev/router/introduction/), [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)          |
| **API Server**       | [Express 5](https://expressjs.com/), [tRPC v11](https://trpc.io/), [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors)                                                                            |
| **Database & Cache** | [PostgreSQL](https://www.postgresql.org/), [Prisma ORM](https://www.prisma.io/), [Supabase Storage](https://supabase.com/storage)                                                                                              |
| **Configuration**    | [@t3-oss/env-core](https://env.t3.gg/) for runtime environment validation, [Zod](https://zod.dev/)                                                                                                                             |

---

## Project Structure

```text
ghurki-cricket/
├── apps/
│   ├── native/            # Cross-platform mobile app (React Native & Expo Router)
│   ├── server/            # Express backend serving tRPC endpoints and media proxy
│   └── web/               # Web client (Vite, React 19, TanStack Router, Tailwind v4)
├── packages/
│   ├── api/               # Shared tRPC routers, procedures, and query contexts
│   ├── config/            # Shared TypeScript and compiler configurations
│   ├── db/                # Prisma ORM schema, migrations, and generated client
│   └── env/               # Validated environment configurations for server, web, and native
├── players/               # Raw player images (avatars and profile portraits)
├── scripts/
│   ├── sync-vercel-env.ts # CLI script to push local environment variables to Vercel
│   └── upload-player-images.ts # Image optimization and Supabase Storage upload script
├── logo.png               # Project branding asset
├── turbo.json             # Turborepo task pipeline configuration
└── vercel.json            # Vercel Services multi-service configuration
```

---

## Prerequisites

Before setting up the project, make sure you have the following installed:

- **[Bun](https://bun.sh/)** (`>= 1.3.0`)
- **[Node.js](https://nodejs.org/)** (`>= 20.0.0`, required for native dependencies and Expo CLI tooling)
- **[PostgreSQL](https://www.postgresql.org/)** database instance (local instance, Docker container, or hosted service such as Supabase / Neon)
- **[Expo Go](https://expo.dev/go)** mobile app on iOS or Android (optional, for testing the mobile application on physical hardware)

---

## Quickstart

### 1. Clone the repository and install dependencies

```bash
git clone https://github.com/your-username/ghurki-cricket.git
cd ghurki-cricket
bun install
```

### 2. Configure environment variables

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env.local
```

> [!NOTE]
> The backend server loads variables from `.env.local` or `apps/server/.env`. Refer to [Environment Variables](#environment-variables) for configuration details.

### 3. Initialize the database

Generate the Prisma client and synchronize the database schema:

```bash
bun run db:generate
bun run db:push
```

### 4. Start the development servers

Start all workspaces concurrently (web dashboard, Express API, and Expo dev server):

```bash
bun run dev
```

Once running, the applications are accessible at:

| Application                   | Address                                        |
| :---------------------------- | :--------------------------------------------- |
| **Web Dashboard**             | [http://localhost:3000](http://localhost:3000) |
| **API Server (tRPC & Media)** | [http://localhost:8000](http://localhost:8000) |
| **Expo Dev Tools**            | `http://localhost:8081`                        |

> [!TIP]
> To launch individual applications instead of the entire monorepo, use `bun run dev:web`, `bun run dev:server`, or `bun run dev:native`.

---

## Database Setup

The database schema and models are managed under `packages/db` using Prisma ORM with PostgreSQL.

### Core Domain Models

- **`Players`**: Personal info, player groups (`core`, `family`, `friends`), roles, avatars, and match statistics.
- **`Teams`**: Team identities, match win records, and date session results.
- **`Dates`**: Session dates, ground details, financial breakdowns, and associated matches.
- **`Matches` & `Innings`**: Match results, target/score calculations, overs, win margins, and Player of the Match awards.
- **`Batters`, `Bowlers`, `Fielders`**: Per-session statistical scorecards for every participating player.
- **`Rivalries` & `Records`**: Lifetime head-to-head records tracking matchups between individual batters and bowlers.

### Database Workflows

```bash
# Push schema changes directly to the database during development
bun run db:push

# Generate the type-safe Prisma client
bun run db:generate

# Run migration scripts for staging or production
bun run db:migrate

# Open the visual Prisma Studio database manager
bun run db:studio
```

> [!IMPORTANT]
> Always run `bun run db:generate` whenever you modify `packages/db/prisma/schema/schema.prisma` to keep TypeScript typings synchronized across `packages/api` and `apps/server`.

---

## Environment Variables

Environment variables are validated at runtime via `@ghurki-cricket/env` backed by `@t3-oss/env-core` and Zod.

### Server & Database (`apps/server/.env` or `.env.local`)

| Variable               | Description                                           | Example                                                              |
| :--------------------- | :---------------------------------------------------- | :------------------------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string                          | `postgresql://user:pass@localhost:5432/ghurki_cricket?schema=public` |
| `PORT`                 | HTTP port for the Express server (defaults to `8000`) | `8000`                                                               |
| `CORS_ORIGIN`          | Allowed CORS origins (comma-separated or `*`)         | `http://localhost:3000`                                              |
| `SUPABASE_STORAGE_URL` | Upstream Supabase Storage URL for player assets       | `https://<project-ref>.supabase.co/storage/v1/object/public/players` |

### Web Client (`apps/web/.env` or root `.env.local`)

| Variable           | Description                                        | Default                                       |
| :----------------- | :------------------------------------------------- | :-------------------------------------------- |
| `VITE_SERVER_URL`  | Absolute URL or same-origin path to the API server | `http://localhost:8000` (dev) / `/api` (prod) |
| `VITE_STORAGE_URL` | Optional direct Supabase Storage public CDN URL    | _(optional)_                                  |

### Mobile Client (`apps/native/.env`)

| Variable                 | Description                                    | Example                     |
| :----------------------- | :--------------------------------------------- | :-------------------------- |
| `EXPO_PUBLIC_SERVER_URL` | Accessible API endpoint URL for mobile clients | `http://192.168.1.100:8000` |

---

## Available Scripts

Run these scripts from the repository root:

| Command                        | Action                                                         |
| :----------------------------- | :------------------------------------------------------------- |
| `bun run dev`                  | Start web, server, and native apps in watch mode via Turborepo |
| `bun run dev:web`              | Start only the Vite web application                            |
| `bun run dev:server`           | Start only the Express tRPC server                             |
| `bun run dev:native`           | Start the Expo development server for the mobile app           |
| `bun run build`                | Build all packages and applications for production             |
| `bun run check`                | Run Oxlint and Oxfmt across the codebase                       |
| `bun run check-types`          | Typecheck all monorepo workspaces (`tsc --noEmit`)             |
| `bun run db:generate`          | Generate the Prisma client in `packages/db`                    |
| `bun run db:push`              | Synchronize database schema with the Prisma schema             |
| `bun run db:migrate`           | Apply pending database migrations                              |
| `bun run db:studio`            | Open Prisma Studio in the browser                              |
| `bun run upload-player-images` | Optimize and upload player photos to Supabase Storage          |
| `bun run env:prev`             | Sync local `.env` variables to Vercel preview environments     |
| `bun run env:prod`             | Sync local `.env` variables to Vercel production environments  |
| `bun run deploy:prev`          | Deploy a preview build using Vercel CLI                        |
| `bun run deploy:prod`          | Deploy directly to Vercel production                           |

---

## Player Media Management

Player avatars and full portraits are processed and uploaded to Supabase Storage using Sharp:

1. Place source photos in the `players/` directory:
   - Avatars: `players/avatars/<player-name>.png`
   - Profiles: `players/profiles/<player-name>.png`
2. Ensure `SUPABASE_STORAGE_URL` (or `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) are present in `.env.local`.
3. Execute the image processing script:

```bash
bun run upload-player-images
```

The script automatically converts images to optimized WebP format, resizes them, and uploads them to the public `players` bucket. The Express backend serves cached, immutable WebP responses via `/players/:playerId.webp` and `/players/:playerId/:variant.webp`.

---

## UI Components & Design System

The web frontend uses **Tailwind CSS v4** and **shadcn/ui** components located in `apps/web/src/components/ui`.

To add more shadcn/ui primitives to the web application:

```bash
cd apps/web
bunx --bun shadcn@latest add <component-name>
```

Global styles and design tokens can be adjusted in `apps/web/src/index.css`.

---

## Deployment

### Vercel Services (Multi-Service Architecture)

The project is structured to deploy on Vercel using **Vercel Services** defined in `vercel.json`:

- **Web Service (`apps/web`)**: Static Vite SPA bundle with client-side routing.
- **Server Service (`apps/server`)**: Node.js/Express backend handling tRPC calls and image proxying.
- **Routing Rules**: Requests hitting `/api/*` and `/players/*.webp` route seamlessly to the server service, while all remaining routes point to the web SPA.

```text
Incoming Request
  ├── /api/*               ──>  Server Service (Express + tRPC)
  ├── /players/*.webp      ──>  Server Service (Image Cache & Proxy)
  └── /*                   ──>  Web Service (Vite React SPA)
```

### Deployment Workflow

1. Link the repository to your Vercel project:

   ```bash
   bunx vercel link
   ```

2. Push your environment variables to Vercel:

   ```bash
   bun run env:prev  # Push to Preview environment
   bun run env:prod  # Push to Production environment
   ```

3. Trigger a deployment:

   ```bash
   bun run deploy:prev # Deploy preview build
   bun run deploy:prod # Deploy to production
   ```
