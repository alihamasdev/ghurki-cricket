import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getStatWhere } from "../lib/helpers";
import { statSchema } from "../lib/schemas";
import type { BattingStats, OtherBattingStats } from "../lib/types";
import { calcBattingAverage, calcStrikeRate } from "../lib/utils";

export const battingRouter = router({
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
		return data
			.map((val) => ({
				player: val.playerId,
				innings: val._sum.innings ?? 0,
				runs: val._sum.runs ?? 0,
				balls: val._sum.balls ?? 0,
				notOuts: val._sum.notOuts ?? 0,
				fours: val._sum.fours ?? 0,
				sixes: val._sum.sixes ?? 0,
				ducks: val._sum.ducks ?? 0,
				thirties: val._sum.thirties ?? 0,
				fifties: val._sum.fifties ?? 0,
				highestScore: val._max.highestScore ?? 0,
				strikeRate: calcStrikeRate(val._sum),
				average: calcBattingAverage(val._sum),
			}))
			.sort((a, b) => b.runs - a.runs);
	}),

	listAvgPerDay: publicProcedure.input(statSchema).query(async ({ input }): Promise<OtherBattingStats[]> => {
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
				thirties: true,
			},
		});
		return data
			.map((val) => ({
				player: val.playerId,
				innings: val._avg.innings ?? 0,
				runs: val._avg.runs ?? 0,
				balls: val._avg.balls ?? 0,
				fours: val._avg.fours ?? 0,
				sixes: val._avg.sixes ?? 0,
				thirties: val._avg.thirties ?? 0,
			}))
			.sort((a, b) => b.runs - a.runs);
	}),

	mostInSingleDay: publicProcedure.input(statSchema).query(async ({ input }): Promise<OtherBattingStats[]> => {
		const data = await db.batters.groupBy({
			by: ["playerId"],
			where: getStatWhere(input),
			_max: {
				innings: true,
				runs: true,
				balls: true,
				fours: true,
				sixes: true,
				thirties: true,
			},
		});
		return data
			.map((val) => ({
				player: val.playerId,
				innings: val._max.innings ?? 0,
				runs: val._max.runs ?? 0,
				balls: val._max.balls ?? 0,
				fours: val._max.fours ?? 0,
				sixes: val._max.sixes ?? 0,
				thirties: val._max.thirties ?? 0,
			}))
			.sort((a, b) => b.runs - a.runs);
	}),
});
