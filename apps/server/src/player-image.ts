import { env } from "@ghurki-cricket/env/server";
import type { Request, Response } from "express";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { z } from "zod";

const paramSchema = z.object({
	playerId: z.string().trim().min(1),
	variant: z.string().optional(),
});

export async function handlePlayerImage(req: Request, res: Response): Promise<void> {
	const parsed = paramSchema.safeParse(req.params);

	if (!parsed.success) {
		res.status(400).send("Invalid playerId");

		return;
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
}
