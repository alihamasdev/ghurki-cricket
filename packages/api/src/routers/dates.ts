import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";

export const datesRouter = router({
	list: publicProcedure.query(async () => {
		const data = await db.dates.findMany({
			orderBy: { date: "desc" },
			select: { date: true, title: true, rivalryId: true },
		});

		const rivalries = Object.entries(
			data.reduce(
				(acc, item) => {
					acc[item.rivalryId] = (acc[item.rivalryId] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			),
		).map(([name, dates]) => ({ name, count: dates }));

		const years = Object.entries(
			data.reduce(
				(acc, item) => {
					const year = item.date.getFullYear();
					acc[year] = (acc[year] || 0) + 1;
					return acc;
				},
				{} as Record<number, number>,
			),
		)
			.map(([year, dates]) => ({ year: Number(year), count: dates }))
			.sort((a, b) => b.year - a.year);

		return { dates: data, rivalries, years };
	}),
});
