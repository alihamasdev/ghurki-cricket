/* oxlint-disable shadcn/no-raw-colors */
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import type { Request, Response } from "express";
import satori from "satori";
import { z } from "zod";

import { OUTFIT_BOLD_BASE64, OUTFIT_REGULAR_BASE64 } from "./assets/outfit-font";
import { RESVG_WASM_BASE64 } from "./assets/resvg-wasm";

let cachedBoldFont: Buffer | null = null;
let cachedRegFont: Buffer | null = null;
let wasmInitialized = false;

async function ensureWasm(): Promise<void> {
	if (!wasmInitialized) {
		await initWasm(Buffer.from(RESVG_WASM_BASE64, "base64"));
		wasmInitialized = true;
	}
}

function getFonts() {
	if (!cachedBoldFont) {
		cachedBoldFont = Buffer.from(OUTFIT_BOLD_BASE64, "base64");
	}

	if (!cachedRegFont) {
		cachedRegFont = Buffer.from(OUTFIT_REGULAR_BASE64, "base64");
	}

	return { bold: cachedBoldFont, regular: cachedRegFont };
}

const ogQuerySchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
});

export async function handleOgImage(req: Request, res: Response): Promise<void> {
	const parsed = ogQuerySchema.safeParse(req.query);

	const rawTitle = parsed.success && parsed.data.title ? parsed.data.title.trim() : "Ghurki Cricket";

	const rawDescription =
		parsed.success && parsed.data.description
			? parsed.data.description.trim()
			: "Comprehensive cricket stats, match scoring, and player management for Ghurki Cricket.";

	const title = rawTitle.length > 70 ? `${rawTitle.slice(0, 67)}...` : rawTitle;
	const description = rawDescription.length > 160 ? `${rawDescription.slice(0, 157)}...` : rawDescription;

	try {
		await ensureWasm();
		const { bold, regular } = getFonts();

		const svg = await satori(
			<div
				style={{
					height: "100%",
					width: "100%",
					fontFamily: "Outfit",
					backgroundColor: "#ffffff",
					position: "relative",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<div
					style={{
						width: "85%",
						height: "80%",
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<div style={{ position: "absolute", top: "60px", left: "60px", display: "flex", alignItems: "center" }}>
						<svg viewBox="0 0 15.469 15.495" width="50" height="50" fill="#09090b">
							<path d="M2.763.499a.54.54 0 0 0-.196-.372.55.55 0 0 0-.405-.124L.514.157A.55.55 0 0 0 .14.353a.55.55 0 0 0-.125.404l.078.824 2.747-.257zm1.315 14.905a.27.27 0 0 0 .071-.212l-.276-2.929a4.98 4.98 0 0 1-.512-5.452l-.467-4.938-2.747.257 1.237 13.115a.276.276 0 0 0 .276.25h2.216a.27.27 0 0 0 .203-.092m2.264-11.02a4.95 4.95 0 0 1 2.759-.009l.02-2.399H6.363zm0 0" />
							<path d="M7.113 11.705a6.3 6.3 0 0 1-1.564-6.386 4.4 4.4 0 0 0-.604.412q-.062.22-.108.439a.276.276 0 0 1-.325.215.27.27 0 0 1-.142-.083 4.412 4.412 0 0 0 3.35 7.261.27.27 0 0 1 .028-.163.28.28 0 0 1 .165-.132.28.28 0 0 1 .21.024q.196.107.401.2a4.4 4.4 0 0 0 .968-.291 6.3 6.3 0 0 1-2.379-1.494M4.244 8.643a7 7 0 0 1-.092-1.148v-.146a.286.286 0 0 1 .281-.27.28.28 0 0 1 .194.085.28.28 0 0 1 .077.197v.134q0 .533.085 1.06a.276.276 0 0 1-.228.316l-.044.004a.276.276 0 0 1-.272-.232m1.241 2.534a.3.3 0 0 1-.138.037.28.28 0 0 1-.24-.138 7 7 0 0 1-.542-1.177.276.276 0 0 1 .169-.349.276.276 0 0 1 .351.165 6.6 6.6 0 0 0 .501 1.086.276.276 0 0 1-.102.377zm1.681 1.83a.276.276 0 0 1-.388.038 7 7 0 0 1-.526-.477 7 7 0 0 1-.398-.432.276.276 0 1 1 .421-.357q.177.208.368.399a7 7 0 0 0 .486.441c.117.097.134.27.037.388m0 0" />
							<path d="M10.846 11.801c.12.025.246.041.371.057a4.41 4.41 0 0 0 .78-3.866 4.41 4.41 0 0 0-2.624-2.944h-.002a.27.27 0 0 1-.156-.057 4.4 4.4 0 0 0-1.476-.257c-.106 0-.211.008-.315.015q-.084.168-.158.339a.28.28 0 0 1-.217.17.28.28 0 0 1-.256-.103.28.28 0 0 1-.039-.273l.017-.039a4 4 0 0 0-.517.151 5.78 5.78 0 0 0 .165 4.817 5.78 5.78 0 0 0 3.758 3.017 4.4 4.4 0 0 0 .597-.481l-.04-.006a.276.276 0 0 1-.155-.457.28.28 0 0 1 .268-.083zM6.359 6.975v-.033a5.6 5.6 0 0 1 .095-1.032.275.275 0 1 1 .542.102 5 5 0 0 0-.086.93.287.287 0 0 1-.272.292h-.004a.265.265 0 0 1-.276-.26zm.778 2.229a.276.276 0 0 1-.36-.149 5.5 5.5 0 0 1-.31-1.021.276.276 0 0 1 .216-.324.276.276 0 0 1 .324.215q.094.473.279.919a.276.276 0 0 1-.149.36m1.208 1.621a.276.276 0 0 1-.39-.002 5.6 5.6 0 0 1-.675-.826.28.28 0 0 1-.028-.282.276.276 0 0 1 .486-.024 5 5 0 0 0 .607.745.276.276 0 0 1 0 .39m1.728 1.048a.276.276 0 0 1-.362.145 5.5 5.5 0 0 1-.937-.513.276.276 0 0 1-.055-.371.276.276 0 0 1 .366-.082 5 5 0 0 0 .842.461.276.276 0 0 1 .145.361zm0 0" />
							<path d="M12.117 6.809a4.98 4.98 0 0 1-.513 5.454l-.277 2.928a.28.28 0 0 0 .071.212.28.28 0 0 0 .205.09h2.216a.276.276 0 0 0 .276-.25L15.33 2.13l-2.747-.257zM14.962.157 13.314.003a.55.55 0 0 0-.404.123.55.55 0 0 0-.197.374l-.078.825 2.747.257.078-.825a.553.553 0 0 0-.497-.599zM8.481 14.053a4.8 4.8 0 0 1-2.123-.135v1.3c0 .152.124.276.276.276h2.207a.276.276 0 0 0 .276-.276v-1.3a5 5 0 0 1-.554.123.3.3 0 0 1-.08.012zM9.131.608a.55.55 0 0 0-.548-.556L6.928.039h-.005a.55.55 0 0 0-.552.547l-.006.839h2.759zm0 0" />
						</svg>
					</div>

					<h1 style={{ fontSize: "78px", fontWeight: 700, color: "#09090b", textAlign: "center" }}>{title}</h1>
					<p style={{ fontSize: "32px", fontWeight: 400, color: "#71717a", textAlign: "center", marginTop: 0 }}>{description}</p>
				</div>
			</div>,
			{
				width: 1200,
				height: 630,
				fonts: [
					{ name: "Outfit", data: bold, weight: 700, style: "normal" },
					{ name: "Outfit", data: regular, weight: 400, style: "normal" },
				],
			},
		);

		const resvg = new Resvg(svg, {
			fitTo: { mode: "width", value: 1200 },
		});

		const png = resvg.render().asPng();

		res.setHeader("Content-Type", "image/png");
		res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
		res.setHeader("CDN-Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
		res.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
		res.status(200).send(Buffer.from(png));
	} catch {
		res.status(500).send("Error generating Open Graph image");
	}
}
