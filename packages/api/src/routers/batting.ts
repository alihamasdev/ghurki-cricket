import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getStatWhere } from "../lib/helpers";
import { statSchema } from "../lib/schemas";
import { type BattingStats } from "../lib/types";
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
});
