import { env } from "@ghurki-cricket/env/server";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { PrismaClient } from "../prisma/generated/client";

export { Prisma } from "../prisma/generated/client";

// SAFETY: globalThis persists the Prisma client instance across hot module reloads in development.
const globalForPrisma = globalThis as {
	prisma?: PrismaClient;
};

type PrismaQueryEvent = {
	query: string;
	params: string;
	duration: number;
};

type QueryEventEmitter = {
	$on(event: "query", cb: (e: PrismaQueryEvent) => void): void;
};

export function createPrismaClient() {
	const pool = new pg.Pool({
		connectionString: env.DATABASE_URL,
		max: env.NODE_ENV === "production" ? 2 : 5,
		idleTimeoutMillis: 15000,
		connectionTimeoutMillis: 5000,
	});

	pool.on("error", (err) => {
		console.error("Unexpected error on idle pg pool client:", err);
	});

	const adapter = new PrismaPg(pool);

	const isDev = env.NODE_ENV === "development";

	const client = new PrismaClient({
		adapter,
		log: isDev
			? [
					{ emit: "event", level: "query" },
					{ emit: "stdout", level: "error" },
					{ emit: "stdout", level: "warn" },
				]
			: [{ emit: "stdout", level: "error" }],
	});

	if (isDev && "$on" in client && client.$on instanceof Function) {
		// SAFETY: Prisma client exposes $on when event logging is enabled.
		(client as QueryEventEmitter).$on("query", (e) => {
			console.log(`\x1b[36mprisma:query\x1b[0m ${e.query} \x1b[33m+${Math.round(e.duration)}ms\x1b[0m`);
		});
	}

	return client;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = db;
