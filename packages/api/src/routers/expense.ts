import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { expenseSchema } from "../lib/schemas";
import { type ExpenseData } from "../lib/types";

export const expenseRouter = router({
	list: publicProcedure.input(expenseSchema).query(async ({ input }): Promise<ExpenseData> => {
		const where = input.year ? { date: { gte: new Date(input.year, 0, 1), lte: new Date(input.year, 11, 31) } } : undefined;

		const [expense, totals] = await db.$transaction([
			db.dates.groupBy({
				by: "ground",
				where,
				_sum: { groundFee: true },
				_count: true,
			}),
			db.dates.aggregate({
				where,
				_sum: { groundFee: true, gearCost: true },
				_count: true,
			}),
		]);

		const groundExpense = totals._sum.groundFee ?? 0;
		const gearExpense = totals._sum.gearCost ?? 0;

		return {
			summary: {
				days: totals._count,
				groundExpense,
				gearExpense,
				totalExpense: groundExpense + gearExpense,
			},
			expenses: expense
				.map((exp) => ({
					ground: exp.ground,
					days: exp._count,
					expense: exp._sum.groundFee ?? 0,
				}))
				.sort((a, b) => b.expense - a.expense),
		};
	}),
});
