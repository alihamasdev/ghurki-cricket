import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { formatDate } from "../lib/utils";

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
});
