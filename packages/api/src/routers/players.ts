import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getGroup } from "../lib/helpers";
import { groupSchema } from "../lib/schemas";

export const playerRouter = router({
	list: publicProcedure.input(groupSchema).query(async ({ input }) => {
		return await db.players.findMany({
			orderBy: { name: "asc" },
			where: { group: getGroup(input) },
			select: { name: true, role: true, avatar: true },
		});
	}),
});
