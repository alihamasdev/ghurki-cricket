import { db } from "@ghurki-cricket/db";
import { publicProcedure, router } from "../index";

export const expenseRouter = router({
	list: publicProcedure.query(async () => {
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
