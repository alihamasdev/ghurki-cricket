import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getDate, getGroup } from "../lib/helpers";
import { groupSchema, statSchema } from "../lib/schemas";
import { buildRaceTimeline } from "../lib/timeline";
import { type POTMStats, type TimelineData } from "../lib/types";

export const potmRouter = router({
	/**
	 * Lists Player of the Match (POTM) award counts aggregated per player.
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of players and their total POTM award counts sorted descending.
	 */
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

	/**
	 * Finds the highest number of POTM awards won by each player in a single playing day.
	 *
	 * @param input - Player group filter ("core", "friends", "family", or "all").
	 * @returns Array of players with their personal record of most POTMs in a day sorted descending.
	 */
	mostInSingleDay: publicProcedure.input(groupSchema).query(async ({ input }): Promise<POTMStats[]> => {
		const data = await db.matches.groupBy({
			by: ["potmId", "dateId"],
			where: { potm: { group: getGroup(input) } },
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

	/**
	 * Returns cumulative Player of the Match awards over time by date for racing bar charts.
	 *
	 * @param input - Optional date range, rivalry, and player group filter.
	 * @returns Array of timeline frames with cumulative POTM awards per player by date.
	 */
	raceTimeline: publicProcedure.input(statSchema.omit({ date: true })).query(async ({ input }): Promise<TimelineData> => {
		const rows = await db.matches.findMany({
			where: {
				...getDate(input),
				potmId: { not: null },
				potm: { group: getGroup(input) },
			},
			select: { dateId: true, potmId: true },
			orderBy: { dateId: "asc" },
		});

		return buildRaceTimeline(
			rows
				.filter((r): r is typeof r & { potmId: string } => r.potmId !== null)
				.map((r) => ({
					dateId: r.dateId,
					playerId: r.potmId,
				})),
			() => 1,
		);
	}),
});
