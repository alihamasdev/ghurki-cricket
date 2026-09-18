import { db } from "@ghurki-cricket/db";
import { z } from "zod";

import { publicProcedure, router } from "../index";
import { type ExpenseStats } from "../lib/types";

const yearSchema = z.object({
	year: z.number().optional().catch(undefined),
});

export const expenseRouter = router({
	list: publicProcedure.input(yearSchema).query(async ({ input }): Promise<ExpenseStats[]> => {
		const expense = await db.expenses.groupBy({
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
	listYears: publicProcedure.query(async () => {
		const [totalDays, years] = await db.$transaction([
			db.expenses.count(),
			db.$queryRaw<{ year: number; count: number }[]>`
				SELECT 
					EXTRACT(YEAR FROM "date")::int AS year,
					COUNT(*)::int AS count
				FROM "expenses"
				GROUP BY EXTRACT(YEAR FROM "date")
				ORDER BY year DESC
			`,
		]);

		return { totalDays, years };
	}),
});
