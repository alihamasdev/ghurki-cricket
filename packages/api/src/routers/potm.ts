import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getDate, getGroup } from "../lib/helpers";
import { statSchema } from "../lib/schemas";
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

	mostInSingleDay: publicProcedure.input(statSchema).query(async ({ input }): Promise<POTMStats[]> => {
		const data = await db.matches.groupBy({
			by: ["potmId", "dateId"],
			where: { ...getDate(input), potm: { group: getGroup(input) } },
			_count: { potmId: true },
		});

		const playerMaxMap = new Map<string, number>();
		for (const row of data) {
			if (!row.potmId) continue;
			const current = playerMaxMap.get(row.potmId) ?? 0;
			if (row._count.potmId > current) {
				playerMaxMap.set(row.potmId, row._count.potmId);
			}
		}

		return Array.from(playerMaxMap.entries())
			.map(([player, potm]) => ({ player, potm }))
			.sort((a, b) => b.potm - a.potm);
	}),
});
