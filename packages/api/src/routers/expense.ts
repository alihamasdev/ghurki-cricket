import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { type ExpenseStats } from "../lib/types";

export const expenseRouter = router({
	list: publicProcedure.query(async (): Promise<ExpenseStats[]> => {
		const expense = await db.expenses.groupBy({
			by: "ground",
			_count: true,
			_sum: { groundFee: true },
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
