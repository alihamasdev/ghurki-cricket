import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getStatWhere } from "../lib/helpers";
import { statSchema } from "../lib/schemas";
import type { OtherBowlingStats, BowlingStats, TimelineData } from "../lib/types";
import { calcBowlingAverage, calcBowlingEconomy } from "../lib/utils";

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

		return data
			.map((val) => ({
				player: val.playerId,
				innings: val._sum.innings ?? 0,
				runs: val._sum.runs ?? 0,
				balls: val._sum.balls ?? 0,
				wickets: val._sum.wickets ?? 0,
				dots: val._sum.dots ?? 0,
				wides: val._sum.wides ?? 0,
				noBalls: val._sum.noBalls ?? 0,
				twoFR: val._sum.twoFR ?? 0,
				threeFR: val._sum.threeFR ?? 0,
				economy: calcBowlingEconomy(val._sum),
				average: calcBowlingAverage(val._sum),
			}))
			.sort((a, b) => b.wickets - a.wickets);
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

		return data
			.map((val) => ({
				player: val.playerId,
				innings: val._avg.innings ?? 0,
				runs: val._avg.runs ?? 0,
				balls: val._avg.balls ?? 0,
				wickets: val._avg.wickets ?? 0,
				dots: val._avg.dots ?? 0,
				wides: val._avg.wides ?? 0,
			}))
			.sort((a, b) => b.wickets - a.wickets);
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

		return data
			.map((val) => ({
				player: val.playerId,
				innings: val._max.innings ?? 0,
				runs: val._max.runs ?? 0,
				balls: val._max.balls ?? 0,
				wickets: val._max.wickets ?? 0,
				dots: val._max.dots ?? 0,
				wides: val._max.wides ?? 0,
			}))
			.sort((a, b) => b.wickets - a.wickets);
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

		const dateMap = new Map<string, { playerId: string; wickets: number }[]>();

		for (const row of rows) {
			const dateStr = row.dateId.toISOString().split("T")[0] ?? "";

			if (!dateStr) continue;
			let list = dateMap.get(dateStr);

			if (!list) {
				list = [];
				dateMap.set(dateStr, list);
			}

			list.push({ playerId: row.playerId, wickets: row.wickets });
		}

		const cumulative: Record<string, number> = {};
		const frames: { date: string; scores: Record<string, number> }[] = [];

		for (const [date, playerEntries] of dateMap.entries()) {
			for (const entry of playerEntries) {
				cumulative[entry.playerId] = (cumulative[entry.playerId] ?? 0) + entry.wickets;
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
