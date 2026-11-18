import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getStatWhere } from "../lib/helpers";
import { statSchema } from "../lib/schemas";
import { type BowlingStats } from "../lib/types";
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
});
