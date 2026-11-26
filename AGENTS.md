# AGENTS.md

Instructions, architectural decisions, and context for AI agents working on the Ghurki Cricket codebase.

---

## 1. Timeline & Video Export Architecture (Remotion)

### Local Development Only Feature

The Remotion MP4 video export feature (`@remotion/renderer` + headless Chrome + FFmpeg) is **intentionally scoped strictly to the local development environment**. Do not attempt to move it to production or re-introduce serverless cloud rendering without explicit user instruction.

#### Context & Why It Is Local Only:

1. **Production Deployment (Vercel)**:
   - Vercel Serverless Functions have a strict **10-second timeout** on the Hobby/Free tier. Rendering a 45-second 1080p 60fps video (2,700 frames) takes ~20–30 seconds and will immediately fail with a `504 Gateway Timeout`.
   - Chromium and FFmpeg binaries are heavy (>200 MB), exceeding Vercel's serverless package size limit (50 MB compressed / 250 MB uncompressed).
   - In production, users only view the interactive in-browser `<Player />`. The export button is strictly an admin/creator tool for generating recap videos locally on macOS to share on Instagram/WhatsApp/YouTube.

2. **Server Dependency Isolation (`apps/server`)**:
   - `@remotion/renderer`, `@remotion/bundler`, `@remotion/tailwind-v4`, `remotion`, `react`, and `react-dom` in `apps/server/package.json` **must remain in `devDependencies`**.
   - In `apps/server/src/index.ts`, `./render-timeline` is loaded **dynamically** inside a `try/catch` and only when `env.NODE_ENV === "development"`.
   - In `apps/server/tsdown.config.ts`, `neverBundle: [/^@remotion\/.*/, /render-timeline/]` ensures production builds (`tsdown`) do not bundle or trace Webpack, Terser, or Remotion into `dist/index.mjs`.

3. **Web Overlay Button (`apps/web`)**:
   - In `apps/web/src/components/timeline.tsx`, the floating export button is gated behind `{import.meta.env.DEV && (...)}`. It is completely stripped/omitted in production client builds.

---

## 2. Animation & Motion Rules in Remotion Compositions

When modifying or creating Remotion compositions (such as `TimelineComposition` in `apps/web/src/components/timeline.tsx`):

1. **NEVER use CSS `transition` or CSS animations**:
   - In Remotion offline rendering, headless Chromium steps through time frame-by-frame (e.g. frame 100 &rarr; snapshot &rarr; frame 101 &rarr; snapshot).
   - CSS transitions depend on real-world wall clock (`performance.now()`). When offline rendering captures frames faster or slower than 1x wall clock, CSS transitions fail to interpolate and cause abrupt, jerky rank teleporting.
2. **All motion must be driven mathematically by `frame`**:
   - Use precomputed frame trajectories (`smoothY`) or Remotion's `interpolate()` / `spring()`.
   - Rank transitions, bar widths, and opacity fades must be pure functions of `frame` (or `useCurrentFrame()`).

---

## 3. General Workflow & Tooling Constraints

1. **Git Staging**:
   - **Do NOT stage files** (`git add ...`) after completing tasks. The user prefers to review diffs and stage files manually.
2. **Linting and Typechecking**:
   - Always verify changes with `bun run check && bun run check-types`.
   - Respect the project's anti-slop rules:
     - No unsafe type assertions (`as ...`) without a preceding `// SAFETY:` invariant comment. Prefer parsing with Zod schemas.
     - Filenames must follow kebab-case.
     - Do not restyle shadcn UI components (e.g., `<Button>`) with raw color or shadow utility overrides.
