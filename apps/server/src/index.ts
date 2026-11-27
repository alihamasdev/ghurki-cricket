import { createContext } from "@ghurki-cricket/api/context";
import { appRouter as router } from "@ghurki-cricket/api/router";
import { env } from "@ghurki-cricket/env/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import { isAllowedOrigin } from "./helpers";
import { handleOgImage } from "./og";
import { handlePlayerImage } from "./player-image";

const app: Express = express();

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

app.use(express.json({ limit: env.NODE_ENV === "development" ? "50mb" : "1mb" }));

app.get(["/", "/api"], (_req, res) => {
	res.status(200).send("OK");
});

app.get(["/og", "/api/og"], handleOgImage);

app.use(["/trpc", "/api/trpc"], createExpressMiddleware({ router, createContext }));

app.get(["/players/:playerId.webp", "/players/:playerId/:variant.webp"], handlePlayerImage);

if (env.NODE_ENV === "development") {
	try {
		const { exportTimelineHandler, getExportProgressHandler, downloadExportedVideoHandler } = await import("./render-timeline");

		app.post(["/export-timeline", "/api/export-timeline"], exportTimelineHandler);
		app.get(["/export-timeline/progress/:renderId", "/api/export-timeline/progress/:renderId"], getExportProgressHandler);
		app.get(["/export-timeline/download/:renderId", "/api/export-timeline/download/:renderId"], downloadExportedVideoHandler);
	} catch {
		// Render module is dev-only and omitted from production builds
	}
}

app.listen(env.PORT, () => {
	console.log(`Server is running on http://localhost:${env.PORT}`);
});

export default app;
