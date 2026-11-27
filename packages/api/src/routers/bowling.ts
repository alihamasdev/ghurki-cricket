import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getStatWhere } from "../lib/helpers";
import { statSchema } from "../lib/schemas";
import { mapBowlingStats, mapOtherBowlingStats } from "../lib/stats";
import { buildRaceTimeline } from "../lib/timeline";
import type { BowlingStats, OtherBowlingStats, TimelineData } from "../lib/types";

export const bowlingRouter = router({
	/**
	 * Lists aggregated bowling stats (wickets, runs, balls, dots, extras, economy, average).
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of player bowling stats sorted by wickets descending.
	 */
	list: publicProcedure.input(statSchema).query(async ({ input }): Promise<BowlingStats[]> => {
		const data = await db.bowlers.groupBy({
			by: ["playerId"],
			where: getStatWhere(input),
			_sum: {
				innings: true,
				runs: true,
				balls: true,
				wickets: true,
				dots: true,
				wides: true,
				noBalls: true,
				twoFR: true,
				threeFR: true,
			},
		});

		return data.map(mapBowlingStats).sort((a, b) => b.wickets - a.wickets);
	}),

	/**
	 * Calculates average bowling metrics per playing day (wickets, runs, balls, dots, wides).
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of players with average bowling statistics per day sorted by wickets.
	 */
	listAvgPerDay: publicProcedure.input(statSchema.omit({ date: true })).query(async ({ input }): Promise<OtherBowlingStats[]> => {
		const data = await db.bowlers.groupBy({
			by: ["playerId"],
			where: getStatWhere(input),
			_avg: {
				innings: true,
				runs: true,
				balls: true,
				wickets: true,
				dots: true,
				wides: true,
			},
		});

		return data.map(mapOtherBowlingStats).sort((a, b) => b.wickets - a.wickets);
	}),

	/**
	 * Finds the highest single-day bowling performance for each player (most wickets, dots, balls).
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of players with their personal best single-day bowling numbers sorted by wickets.
	 */
	mostInSingleDay: publicProcedure.input(statSchema.omit({ date: true })).query(async ({ input }): Promise<OtherBowlingStats[]> => {
		const data = await db.bowlers.groupBy({
			by: ["playerId"],
			where: getStatWhere(input),
			_max: {
				innings: true,
				runs: true,
				balls: true,
				wickets: true,
				dots: true,
				wides: true,
			},
		});

		return data.map(mapOtherBowlingStats).sort((a, b) => b.wickets - a.wickets);
	}),

	/**
	 * Returns cumulative bowling wickets over time by date for racing bar charts.
	 *
	 * @param input - Optional date range, rivalry, single date, and player group filter.
	 * @returns Array of timeline frames with cumulative wickets per player by date.
	 */
	raceTimeline: publicProcedure.input(statSchema.omit({ date: true })).query(async ({ input }): Promise<TimelineData> => {
		const rows = await db.bowlers.findMany({
			where: getStatWhere(input),
			select: { dateId: true, playerId: true, wickets: true },
			orderBy: { dateId: "asc" },
		});

		return buildRaceTimeline(rows, (row) => row.wickets);
	}),
});
