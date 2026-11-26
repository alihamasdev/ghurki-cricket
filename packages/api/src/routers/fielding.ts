import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getStatWhere } from "../lib/helpers";
import { statSchema } from "../lib/schemas";
import { type FieldingStats, type TimelineData } from "../lib/types";

export const fieldingRouter = router({
	/**
	 * Lists aggregated fielding stats (catches, run outs, innings) per player.
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of player fielding statistics sorted by catches descending.
	 */
	list: publicProcedure.input(statSchema).query(async ({ input }): Promise<FieldingStats[]> => {
		const data = await db.fielders.groupBy({
			by: ["playerId"],
			where: getStatWhere(input),
			_sum: {
				innings: true,
				catches: true,
				runOuts: true,
			},
		});

		return data
			.map((val) => ({
				player: val.playerId,
				innings: val._sum.innings ?? 0,
				catches: val._sum.catches ?? 0,
				runOuts: val._sum.runOuts ?? 0,
			}))
			.sort((a, b) => b.catches - a.catches);
	}),

	/**
	 * Calculates average fielding metrics per playing day (catches, run outs).
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of players with average fielding statistics per day sorted by catches.
	 */
	listAvgPerDay: publicProcedure.input(statSchema.omit({ date: true })).query(async ({ input }): Promise<FieldingStats[]> => {
		const data = await db.fielders.groupBy({
			by: ["playerId"],
			where: getStatWhere(input),
			_avg: {
				innings: true,
				catches: true,
				runOuts: true,
			},
		});

		return data
			.map((val) => ({
				player: val.playerId,
				innings: val._avg.innings ?? 0,
				catches: val._avg.catches ?? 0,
				runOuts: val._avg.runOuts ?? 0,
			}))
			.sort((a, b) => b.catches - a.catches);
	}),

	/**
	 * Finds the highest single-day fielding performance for each player (most catches, run outs).
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of players with personal best single-day fielding records sorted by catches.
	 */
	mostInSingleDay: publicProcedure.input(statSchema.omit({ date: true })).query(async ({ input }): Promise<FieldingStats[]> => {
		const data = await db.fielders.groupBy({
			by: ["playerId"],
			where: getStatWhere(input),
			_max: {
				innings: true,
				catches: true,
				runOuts: true,
			},
		});

		return data
			.map((val) => ({
				player: val.playerId,
				innings: val._max.innings ?? 0,
				catches: val._max.catches ?? 0,
				runOuts: val._max.runOuts ?? 0,
			}))
			.sort((a, b) => b.catches - a.catches);
	}),

	/**
	 * Returns cumulative fielding catches over time by date for racing bar charts.
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of timeline frames with cumulative catches per player by date.
	 */
	raceTimeline: publicProcedure.input(statSchema.omit({ date: true })).query(async ({ input }): Promise<TimelineData> => {
		const rows = await db.fielders.findMany({
			where: getStatWhere(input),
			select: { dateId: true, playerId: true, catches: true },
			orderBy: { dateId: "asc" },
		});

		const dateMap = new Map<string, { playerId: string; catches: number }[]>();

		for (const row of rows) {
			const dateStr = row.dateId.toISOString().split("T")[0] ?? "";

			if (!dateStr) continue;
			let list = dateMap.get(dateStr);

			if (!list) {
				list = [];
				dateMap.set(dateStr, list);
			}

			list.push({ playerId: row.playerId, catches: row.catches });
		}

		const cumulative: Record<string, number> = {};
		const frames: { date: string; scores: Record<string, number> }[] = [];

		for (const [date, playerEntries] of dateMap.entries()) {
			for (const entry of playerEntries) {
				cumulative[entry.playerId] = (cumulative[entry.playerId] ?? 0) + entry.catches;
			}

			frames.push({
				date,
				scores: { ...cumulative },
			});
		}

		const players = Object.keys(cumulative);

		return { players, frames };
	}),
});
