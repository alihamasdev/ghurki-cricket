import { createContext } from "@ghurki-cricket/api/context";
import { appRouter as router } from "@ghurki-cricket/api/router";
import { env } from "@ghurki-cricket/env/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import helmet from "helmet";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, methods: ["GET", "POST", "OPTIONS"] }));

app.use(express.json());

app.use("/trpc", createExpressMiddleware({ router, createContext }));

app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

app.listen(env.PORT, () => {
	console.log(`Server is running on http://localhost:${env.PORT}`);
});
