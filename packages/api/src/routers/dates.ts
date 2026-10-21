import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";

export const datesRouter = router({
	getTotalCount: publicProcedure.query(async () => {
		return db.dates.count({
			where: { hasStats: true },
		});
	}),
});
