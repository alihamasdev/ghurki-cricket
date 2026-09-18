import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";

export const datesRouter = router({
	list: publicProcedure.query(async () => {
		const [totalDates, rivalries, years] = await db.$transaction([
			db.dates.count(),
			db.rivalries.findMany({
				orderBy: { startedAt: "desc" },
				select: { title: true, _count: { select: { dates: true } } },
			}),
			db.$queryRaw<{ year: number; count: number }[]>`
				SELECT 
					EXTRACT(YEAR FROM "date")::int AS year,
					COUNT(*)::int AS count
				FROM "dates"
				GROUP BY EXTRACT(YEAR FROM "date")
				ORDER BY year DESC
			`,
		]);

		return { totalDates, years, rivalries: rivalries.map((rivalry) => ({ name: rivalry.title, count: rivalry._count.dates })) };
	}),
});
