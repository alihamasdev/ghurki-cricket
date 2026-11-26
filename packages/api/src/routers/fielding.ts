import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getStatWhere } from "../lib/helpers";
import { statSchema } from "../lib/schemas";
import { type FieldingStats } from "../lib/types";

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
});
