import { createContext } from "@ghurki-cricket/api/context";
import { appRouter as router } from "@ghurki-cricket/api/router";
import { env } from "@ghurki-cricket/env/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { z } from "zod";

const app: Express = express();

const isAllowedOrigin = (origin: string | undefined): boolean => {
	if (!origin) return true;

	if (env.CORS_ORIGIN === "*" || env.CORS_ORIGIN === "") return true;

	const configuredOrigins = env.CORS_ORIGIN.split(",").map((s) => s.trim());

	if (configuredOrigins.includes("*") || configuredOrigins.includes(origin)) return true;

	try {
		const { hostname } = new URL(origin);

		if (
			hostname === "localhost" ||
			hostname === "127.0.0.1" ||
			hostname === "stats.alihamas.pk" ||
			hostname === "alihamas.pk" ||
			hostname.endsWith(".alihamas.pk") ||
			(hostname.startsWith("ghurki-cricket") && hostname.endsWith(".vercel.app"))
		) {
			return true;
		}
	} catch {
		return false;
	}

	return false;
};

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
	cors({
		origin: (origin, callback) => {
			if (isAllowedOrigin(origin)) {
				callback(null, true);
			} else {
				callback(null, false);
			}
		},
		methods: ["GET", "POST", "OPTIONS"],
	}),
);

app.use(express.json({ limit: "50mb" }));

app.use(["/trpc", "/api/trpc"], createExpressMiddleware({ router, createContext }));

if (env.NODE_ENV === "development") {
	try {
		const { startExportTimelineHandler, getExportProgressHandler, downloadExportedVideoHandler } = await import("./render-timeline");

		app.post(["/export-timeline", "/api/export-timeline"], startExportTimelineHandler);
		app.get(["/export-timeline/progress/:renderId", "/api/export-timeline/progress/:renderId"], getExportProgressHandler);
		app.get(["/export-timeline/download/:renderId", "/api/export-timeline/download/:renderId"], downloadExportedVideoHandler);
	} catch {
		// Render module is dev-only and omitted from production builds
	}
}

app.get(
	["/players/:playerId.webp", "/api/players/:playerId.webp", "/players/:playerId/:variant.webp", "/api/players/:playerId/:variant.webp"],
	async (req, res) => {
		const paramSchema = z.object({
			playerId: z.string().trim().min(1),
			variant: z.string().optional(),
		});

		const parsed = paramSchema.safeParse(req.params);

		if (!parsed.success) {
			return res.status(400).send("Invalid playerId");
		}

		const { playerId, variant } = parsed.data;

		const folder = variant === "avatar" ? "avatars" : "profiles";
		const upstreamUrl = `${env.SUPABASE_STORAGE_URL}/${folder}/${encodeURIComponent(playerId.trim().toLowerCase())}.webp`;

		try {
			const upstream = await fetch(upstreamUrl);

			if (!upstream.ok) {
				res.status(upstream.status).send(upstream.statusText);

				return;
			}

			res.setHeader("Content-Type", "image/webp");
			res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
			res.setHeader("CDN-Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
			res.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");

			if (upstream.body) {
				// SAFETY: Fetch ReadableStream is compatible with Node.js Readable.fromWeb stream adapter.
				const stream = Readable.fromWeb(upstream.body as NodeReadableStream);
				stream.pipe(res);
			} else {
				res.status(200).end();
			}
		} catch {
			res.status(500).send("Error fetching image");
		}
	},
);

app.get(["/", "/api"], (_req, res) => {
	res.status(200).send("OK");
});

app.listen(env.PORT, () => {
	console.log(`Server is running on http://localhost:${env.PORT}`);
});

export default app;
