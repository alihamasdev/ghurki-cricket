import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { statSchema } from "../lib/schemas";
import { getDate, getGroup } from "../lib/helpers";
import { type POTMStats } from "../lib/types";

export const potmRouter = router({
	list: publicProcedure.input(statSchema).query(async ({ input }): Promise<POTMStats[]> => {
		const data = await db.matches.groupBy({
			by: ["potmId"],
			where: { ...getDate(input), potm: { group: getGroup(input) } },
			_count: { potmId: true },
		});

		return data
			.filter((val) => val.potmId !== null)
			.map((val) => ({
				player: String(val.potmId),
				potm: val._count.potmId,
			}))
			.sort((a, b) => b.potm - a.potm);
	}),
});
