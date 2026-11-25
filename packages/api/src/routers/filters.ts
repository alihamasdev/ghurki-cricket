import { db, Prisma } from "@ghurki-cricket/db";
import { z } from "zod";

import { publicProcedure, router } from "../index";
import { getDate } from "../lib/helpers";
import { dateSchema } from "../lib/schemas";
import { formatDate } from "../lib/utils";

export const filtersRouter = router({
	/**
	 * Retrieves the total count of match dates, optionally filtering for dates with stats enabled.
	 *
	 * @param input - Optional boolean flag to filter only dates with stats.
	 * @returns Total count of dates.
	 */
	getDatesCount: publicProcedure.input(z.object({ hasStats: z.boolean().optional() }).optional()).query(async ({ input }) => {
		return db.dates.count({
			where: input?.hasStats ? { hasStats: true } : undefined,
		});
	}),

	/**
	 * Lists all match dates that have recorded stats, ordered newest first.
	 *
	 * @returns Array of objects containing formatted date string and event title.
	 */
	listDates: publicProcedure.query(async () => {
		const data = await db.dates.findMany({
			where: { hasStats: true },
			orderBy: { date: "desc" },
			select: { date: true, title: true },
		});

		return data.map((d) => ({
			date: formatDate(d.date),
			title: d.title,
		}));
	}),

	/**
	 * Lists all rivalries with recorded stats alongside their total match dates count.
	 *
	 * @returns Array of rivalry names and date counts, ordered by rivalry start date descending.
	 */
	listRivalries: publicProcedure.query(async () => {
		const data = await db.rivalries.findMany({
			where: { dates: { some: { hasStats: true } } },
			orderBy: { startedAt: "desc" },
			select: {
				title: true,
				_count: { select: { dates: { where: { hasStats: true } } } },
			},
		});

		return data.map((rivalry) => ({ name: rivalry.title, count: rivalry._count.dates }));
	}),

	/**
	 * Aggregates match calendar years with boundary date ranges and total days played.
	 *
	 * @param input - Optional boolean flag to count only dates with stats enabled.
	 * @returns Array of year objects with formatted start date, end date, and count.
	 */
	listYears: publicProcedure.input(z.object({ hasStats: z.boolean().optional() }).optional()).query(async ({ input }) => {
		const whereClause = input?.hasStats ? Prisma.sql`WHERE "hasStats" = true` : Prisma.empty;

		const data = await db.$queryRaw<{ year: number; starts: Date; ends: Date; count: number }[]>`
			SELECT 
				EXTRACT(YEAR FROM "date")::int AS year,
				make_date(EXTRACT(YEAR FROM "date")::int, 1, 1) AS starts,
				make_date(EXTRACT(YEAR FROM "date")::int, 12, 31) AS ends,
				COUNT(*)::int AS count
			FROM "dates"
			${whereClause}
			GROUP BY EXTRACT(YEAR FROM "date")
			ORDER BY year DESC
		`;

		return data.map((item) => ({
			starts: formatDate(item.starts),
			ends: formatDate(item.ends),
			count: item.count,
		}));
	}),

	/**
	 * Retrieves the distinct match overs available along with total match counts under active filters.
	 *
	 * @param input - Optional date, rivalry, starts, and ends filter.
	 * @returns Object with total match count and per-over breakdown.
	 */
	listOvers: publicProcedure.input(dateSchema).query(async ({ input }) => {
		const [totalMatches, overs] = await db.$transaction([
			db.matches.count({ where: getDate(input) }),
			db.matches.groupBy({
				by: ["overs"],
				where: getDate(input),
				orderBy: { overs: "asc" },
				_count: true,
			}),
		]);

		return {
			totalMatches,
			overs: overs.map((o) => ({ overs: o.overs, count: o._count })),
		};
	}),
});
