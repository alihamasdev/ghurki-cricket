import { env } from "@ghurki-cricket/env/server";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { PrismaClient } from "../prisma/generated/client";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export function createPrismaClient() {
	const pool = new pg.Pool({
		connectionString: env.DATABASE_URL,
	});
	const adapter = new PrismaPg(pool);
	return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
