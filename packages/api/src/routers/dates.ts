import { db } from "@ghurki-cricket/db";
import { z } from "zod";

import { publicProcedure, router } from "../index";
import { type ExpenseStats } from "../lib/types";
import { formatDate } from "../lib/utils";

const yearSchema = z.object({
	year: z.number().optional().catch(undefined),
});

export const datesRouter = router({
	getTotalCount: publicProcedure.query(async () => {
		return db.dates.count();
	}),
	listRivalries: publicProcedure.query(async () => {
		const data = await db.rivalries.findMany({
			orderBy: { startedAt: "desc" },
			select: { title: true, _count: { select: { dates: true } } },
		});
		return data.map((rivalry) => ({ name: rivalry.title, count: rivalry._count.dates }));
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
  		GROUP BY 1, 2
  		ORDER BY 1 DESC
		`;
		return data.map((period) => ({ starts: formatDate(period.starts), ends: formatDate(period.ends), count: period.count }));
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
	listExpense: publicProcedure.input(yearSchema).query(async ({ input }): Promise<ExpenseStats[]> => {
		const expense = await db.dates.groupBy({
			by: "ground",
			where: input.year ? { date: { gte: new Date(input.year, 0, 0), lte: new Date(input.year, 11, 31) } } : undefined,
			_sum: { groundFee: true },
			_count: true,
		});

		return expense
			.map((exp) => ({
				ground: exp.ground,
				days: exp._count,
				expense: exp._sum.groundFee ?? 0,
			}))
			.sort((a, b) => b.expense - a.expense);
	}),
});
