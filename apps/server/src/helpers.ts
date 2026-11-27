import { env } from "@ghurki-cricket/env/server";

export const isAllowedOrigin = (origin: string | undefined): boolean => {
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
