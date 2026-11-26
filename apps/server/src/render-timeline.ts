import type { TimelineData } from "@ghurki-cricket/api/types";
import { env } from "@ghurki-cricket/env/server";
import { bundle, webpack } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import type { Request, Response } from "express";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";

let cachedServeUrl: string | null = null;
let bundlingPromise: Promise<string> | null = null;

async function getOrCreateServeUrl(): Promise<string> {
	if (cachedServeUrl) {
		return cachedServeUrl;
	}

	if (bundlingPromise) {
		return bundlingPromise;
	}

	const rootDir = process.cwd().includes("apps/server") ? path.resolve(process.cwd(), "../..") : process.cwd();

	const entryPoint = path.resolve(rootDir, "apps/web/src/remotion/index.ts");
	const webSrcDir = path.resolve(rootDir, "apps/web/src");

	bundlingPromise = bundle({
		entryPoint,
		webpackOverride: (config) => {
			const withTailwind = enableTailwind(config);

			return {
				...withTailwind,
				plugins: [
					...(withTailwind.plugins ?? []),
					new webpack.DefinePlugin({
						"import.meta.env": JSON.stringify({
							VITE_SERVER_URL: `http://localhost:${env.PORT}`,
							DEV: true,
						}),
					}),
				],
				resolve: {
					...withTailwind.resolve,
					alias: {
						"@": webSrcDir,
					},
				},
			};
		},
	})
		.then((url) => {
			cachedServeUrl = url;
			bundlingPromise = null;

			return url;
		})
		.catch((err) => {
			bundlingPromise = null;

			throw err;
		});

	return bundlingPromise;
}

type ActiveRender = {
	id: string;
	progress: number;
	status: "bundling" | "rendering" | "done" | "error";
	filePath?: string;
	error?: string;
};

const activeRenders = new Map<string, ActiveRender>();

const timelineSchema: z.ZodType<TimelineData> = z.object({
	players: z.array(z.string()),
	frames: z.array(
		z.object({
			date: z.string(),
			scores: z.record(z.string(), z.number()),
		}),
	),
});

const startExportSchema = z.object({
	timeline: timelineSchema,
	title: z.string().optional().default("Most Batting Runs"),
	unit: z.string().optional().default("runs"),
});

/**
 * Initiates video render in development environment.
 */
export async function startExportTimelineHandler(req: Request, res: Response) {
	if (env.NODE_ENV === "production") {
		res.status(403).json({ error: "Video export is only supported in development environment." });

		return;
	}

	const parsed = startExportSchema.safeParse(req.body);

	if (!parsed.success) {
		res.status(400).json({ error: "Invalid timeline payload", details: parsed.error });

		return;
	}

	const { timeline, title, unit } = parsed.data;
	const renderId = `render_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

	const renderState: ActiveRender = {
		id: renderId,
		progress: 0,
		status: "bundling",
	};

	activeRenders.set(renderId, renderState);

	// Start asynchronous render in background
	(async () => {
		try {
			const serveUrl = await getOrCreateServeUrl();

			renderState.status = "rendering";

			const composition = await selectComposition({
				serveUrl,
				id: "TimelineRace",
				inputProps: {
					timeline,
					title,
					unit,
				},
			});

			const outDir = path.join(os.tmpdir(), "ghurki-exports");

			if (!fs.existsSync(outDir)) {
				fs.mkdirSync(outDir, { recursive: true });
			}

			const outputLocation = path.join(outDir, `${renderId}.mp4`);

			await renderMedia({
				composition,
				serveUrl,
				codec: "h264",
				outputLocation,
				inputProps: {
					timeline,
					title,
					unit,
				},
				onProgress: ({ progress }) => {
					renderState.progress = Math.round(progress * 100);
				},
			});

			renderState.progress = 100;
			renderState.status = "done";
			renderState.filePath = outputLocation;
		} catch (err: unknown) {
			renderState.status = "error";
			renderState.error = err instanceof Error ? err.message : String(err);
			console.error("Timeline render error:", err);
		}
	})();

	res.status(202).json({ renderId });
}

const paramSchema = z.object({
	renderId: z.string().min(1),
});

/**
 * Checks progress of an active render.
 */
export function getExportProgressHandler(req: Request, res: Response) {
	if (env.NODE_ENV === "production") {
		res.status(403).json({ error: "Video export is only supported in development environment." });

		return;
	}

	const parsed = paramSchema.safeParse(req.params);

	if (!parsed.success) {
		res.status(400).json({ error: "Invalid renderId" });

		return;
	}

	const { renderId } = parsed.data;

	if (!activeRenders.has(renderId)) {
		res.status(404).json({ error: "Render task not found" });

		return;
	}

	const state = activeRenders.get(renderId)!;

	res.json({
		id: state.id,
		status: state.status,
		progress: state.progress,
		error: state.error,
	});
}

/**
 * Downloads rendered MP4 file.
 */
export function downloadExportedVideoHandler(req: Request, res: Response) {
	if (env.NODE_ENV === "production") {
		res.status(403).json({ error: "Video export is only supported in development environment." });

		return;
	}

	const parsed = paramSchema.safeParse(req.params);

	if (!parsed.success) {
		res.status(400).json({ error: "Invalid renderId" });

		return;
	}

	const { renderId } = parsed.data;

	if (!activeRenders.has(renderId)) {
		res.status(404).json({ error: "Render task not found" });

		return;
	}

	const state = activeRenders.get(renderId)!;

	if (state.status !== "done" || !state.filePath || !fs.existsSync(state.filePath)) {
		res.status(400).json({ error: "Video is not ready for download", status: state.status });

		return;
	}

	const querySchema = z.object({ filename: z.string().optional() });
	const query = querySchema.safeParse(req.query);
	const filename = query.success && query.data.filename ? query.data.filename : "batting-race.mp4";

	res.download(state.filePath, filename, (err) => {
		if (err) {
			console.error("Error sending exported video:", err);
		}

		// Schedule file cleanup after sending
		setTimeout(() => {
			if (state.filePath && fs.existsSync(state.filePath)) {
				try {
					fs.unlinkSync(state.filePath);
				} catch {
					// Ignore deletion errors
				}
			}

			activeRenders.delete(renderId);
		}, 30_000);
	});
}
