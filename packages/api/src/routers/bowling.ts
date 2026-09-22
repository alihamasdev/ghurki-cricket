import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getStatWhere } from "../lib/helpers";
import { type BowlingStatSchema, bowlingStatSchema } from "../lib/schemas";
import { type BowlingStats } from "../lib/types";
import { calcBowlingAverage, calcBowlingEconomy } from "../lib/utils";

export const bowlingRouter = router({
	list: publicProcedure.input(bowlingStatSchema).query(async ({ input }) => {
		return getBowlingStats(input);
	}),
});

const getBowlingStats = async (filters: BowlingStatSchema): Promise<BowlingStats[]> => {
	const data = await db.bowlers.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
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

	switch (filters.filter) {
		case "most-wickets":
			return data
				.map((val) => ({
					player: val.playerId,
					innings: val._sum.innings ?? 0,
					balls: val._sum.balls ?? 0,
					wickets: val._sum.wickets ?? 0,
				}))
				.sort((a, b) => b.wickets - a.wickets);
		case "most-runs":
			return data
				.map((val) => ({
					player: val.playerId,
					runs: val._sum.runs ?? 0,
					balls: val._sum.balls ?? 0,
				}))
				.sort((a, b) => b.runs - a.runs);
		case "most-dots":
			return data
				.map((val) => ({
					player: val.playerId,
					balls: val._sum.balls ?? 0,
					dots: val._sum.dots ?? 0,
				}))
				.sort((a, b) => b.dots - a.dots);
		case "most-wides":
			return data
				.map((val) => ({
					player: val.playerId,
					balls: val._sum.balls ?? 0,
					wides: val._sum.wides ?? 0,
				}))
				.sort((a, b) => b.wides - a.wides);
		case "most-no-balls":
			return data
				.map((val) => ({
					player: val.playerId,
					balls: val._sum.balls ?? 0,
					noBalls: val._sum.noBalls ?? 0,
				}))
				.sort((a, b) => b.noBalls - a.noBalls);
		case "most-2fr":
			return data
				.map((val) => ({
					player: val.playerId,
					innings: val._sum.innings ?? 0,
					twoFR: val._sum.twoFR ?? 0,
				}))
				.sort((a, b) => b.twoFR - a.twoFR);
		case "most-3fr":
			return data
				.map((val) => ({
					player: val.playerId,
					innings: val._sum.innings ?? 0,
					threeFR: val._sum.threeFR ?? 0,
				}))
				.sort((a, b) => b.threeFR - a.threeFR);
		case "best-economy":
			return data
				.map((val) => ({
					player: val.playerId,
					runs: val._sum.runs ?? 0,
					balls: val._sum.balls ?? 0,
					economy: calcBowlingEconomy(val._sum),
				}))
				.sort((a, b) => {
					if (a.economy == null && b.economy == null) return 0;
					if (a.economy == null) return 1;
					if (b.economy == null) return -1;
					return a.economy - b.economy;
				});
		case "best-average":
			return data
				.map((val) => ({
					player: val.playerId,
					runs: val._sum.runs ?? 0,
					wickets: val._sum.wickets ?? 0,
					average: calcBowlingAverage(val._sum),
				}))
				.sort((a, b) => {
					if (a.average == null && b.average == null) return 0;
					if (a.average == null) return 1;
					if (b.average == null) return -1;
					return a.average - b.average;
				});
		default:
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
	}
};
