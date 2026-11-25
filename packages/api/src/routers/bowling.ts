import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getStatWhere } from "../lib/helpers";
import { statSchema } from "../lib/schemas";
import type { OtherBowlingStats, BowlingStats } from "../lib/types";
import { calcBowlingAverage, calcBowlingEconomy } from "../lib/utils";

export const bowlingRouter = router({
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

	listAvgPerDay: publicProcedure.input(statSchema).query(async ({ input }): Promise<OtherBowlingStats[]> => {
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

	mostInSingleDay: publicProcedure.input(statSchema).query(async ({ input }): Promise<OtherBowlingStats[]> => {
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
});
