import { createContext } from "@ghurki-cricket/api/context";
import { appRouter as router } from "@ghurki-cricket/api/router";
import { env } from "@ghurki-cricket/env/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

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
			hostname.endsWith(".vercel.app") ||
			hostname.endsWith(".alihamas.pk") ||
			hostname === "alihamas.pk"
		) {
			return true;
		}
	} catch {
		return false;
	}

	return false;
};

app.use(helmet());
app.use(
	cors({
		origin: (origin, callback) => {
			if (isAllowedOrigin(origin)) {
				callback(null, true);
			} else {
				callback(new Error(`Origin ${origin} not allowed by CORS`));
			}
		},
		methods: ["GET", "POST", "OPTIONS"],
	}),
);

app.use(express.json());

app.use(["/trpc", "/api/trpc"], createExpressMiddleware({ router, createContext }));

app.get(["/", "/api"], (_req, res) => {
	res.status(200).send("OK");
});

app.listen(env.PORT, () => {
	console.log(`Server is running on http://localhost:${env.PORT}`);
});

export default app;
