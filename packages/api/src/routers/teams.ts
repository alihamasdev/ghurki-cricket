import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";

export const teamsRouter = router({
	list: publicProcedure.query(async () => {
		return await db.teams.findMany({
			orderBy: { name: "asc" },
			select: { name: true, slug: true, avatar: true },
		});
	}),
});
