import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getDate } from "../lib/helpers";
import { dateSchema } from "../lib/schemas";
import { formatDate } from "../lib/utils";

export const filtersRouter = router({
	listOvers: publicProcedure.input(dateSchema.optional()).query(async ({ input }) => {
		const where = input ? getDate(input) : undefined;

		const [totalMatches, overs] = await db.$transaction([
			db.matches.count({ where }),
			db.matches.groupBy({
				by: ["overs"],
				where,
				orderBy: { overs: "asc" },
				_count: true,
			}),
		]);

		return {
			totalMatches,
			overs: overs.map((o) => ({ overs: o.overs, count: o._count })),
		};
	}),
	listPeriods: publicProcedure.query(async () => {
		const data = await db.$queryRaw<{ starts: Date; ends: Date; count: number }[]>`
  		SELECT
  		  CASE
  		    WHEN EXTRACT(MONTH FROM date) <= 6
  		      THEN make_date(EXTRACT(YEAR FROM date)::int, 1, 1)
  		    ELSE make_date(EXTRACT(YEAR FROM date)::int, 7, 1)
  		  END AS starts,
  		  CASE
  		    WHEN EXTRACT(MONTH FROM date) <= 6
  		      THEN make_date(EXTRACT(YEAR FROM date)::int, 6, 30)
  		    ELSE make_date(EXTRACT(YEAR FROM date)::int, 12, 31)
  		  END AS ends,
  		  COUNT(*)::int AS count
  		FROM dates
  		WHERE "hasStats" = true
  		GROUP BY 1, 2
  		ORDER BY 1 DESC
		`;
		return data.map((period) => ({ starts: formatDate(period.starts), ends: formatDate(period.ends), count: period.count }));
	}),
	listRivalries: publicProcedure.query(async () => {
		const data = await db.rivalries.findMany({
			where: { dates: { some: { hasStats: true } } },
			orderBy: { startedAt: "desc" },
			select: {
				title: true,
				_count: {
					select: {
						dates: {
							where: { hasStats: true },
						},
					},
				},
			},
		});
		return data.map((rivalry) => ({ name: rivalry.title, count: rivalry._count.dates }));
	}),
	listYears: publicProcedure.query(async () => {
		const [totalDays, years] = await db.$transaction([
			db.dates.count(),
			db.$queryRaw<{ year: number; count: number }[]>`
				SELECT 
					EXTRACT(YEAR FROM "date")::int AS year,
					COUNT(*)::int AS count
				FROM "dates"
				GROUP BY EXTRACT(YEAR FROM "date")
				ORDER BY year DESC
			`,
		]);

		return { totalDays, years };
	}),
});
