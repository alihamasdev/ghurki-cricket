import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getStatWhere } from "../lib/helpers";
import { statSchema } from "../lib/schemas";
import { mapBattingStats, mapOtherBattingStats } from "../lib/stats";
import { buildRaceTimeline } from "../lib/timeline";
import type { BattingStats, OtherBattingStats, TimelineData } from "../lib/types";

export const battingRouter = router({
	/**
	 * Lists aggregated batting stats (runs, innings, average, strike rate, boundaries, fifties).
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of player batting stats sorted by total runs descending.
	 */
	list: publicProcedure.input(statSchema).query(async ({ input }): Promise<BattingStats[]> => {
		const data = await db.batters.groupBy({
			by: ["playerId"],
			where: getStatWhere(input),
			_max: {
				highestScore: true,
			},
			_sum: {
				innings: true,
				runs: true,
				balls: true,
				notOuts: true,
				fours: true,
				sixes: true,
				ducks: true,
				thirties: true,
				fifties: true,
			},
		});

		return data.map(mapBattingStats).sort((a, b) => b.runs - a.runs);
	}),

	/**
	 * Calculates average batting metrics per playing day (innings, runs, balls, boundaries).
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of players with average batting statistics per day sorted by runs.
	 */
	listAvgPerDay: publicProcedure.input(statSchema.omit({ date: true })).query(async ({ input }): Promise<OtherBattingStats[]> => {
		const data = await db.batters.groupBy({
			by: ["playerId"],
			where: getStatWhere(input),
			_avg: {
				innings: true,
				runs: true,
				balls: true,
				notOuts: true,
				fours: true,
				sixes: true,
			},
		});

		return data.map(mapOtherBattingStats).sort((a, b) => b.runs - a.runs);
	}),

	/**
	 * Finds the highest single-day batting performance for each player (most runs, balls, boundaries).
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of players with their personal best single-day batting numbers sorted by runs.
	 */
	mostInSingleDay: publicProcedure.input(statSchema.omit({ date: true })).query(async ({ input }): Promise<OtherBattingStats[]> => {
		const data = await db.batters.groupBy({
			by: ["playerId"],
			where: getStatWhere(input),
			_max: {
				innings: true,
				runs: true,
				balls: true,
				fours: true,
				sixes: true,
			},
		});

		return data.map(mapOtherBattingStats).sort((a, b) => b.runs - a.runs);
	}),

	/**
	 * Returns cumulative batting runs over time by date for racing bar charts.
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of timeline frames with cumulative runs per player by date.
	 */
	raceTimeline: publicProcedure.input(statSchema.omit({ date: true })).query(async ({ input }): Promise<TimelineData> => {
		const rows = await db.batters.findMany({
			where: getStatWhere(input),
			select: { dateId: true, playerId: true, runs: true },
			orderBy: { dateId: "asc" },
		});

		return buildRaceTimeline(rows, (row) => row.runs);
	}),
});
