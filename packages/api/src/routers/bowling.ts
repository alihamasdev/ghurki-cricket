import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { calcBowlingAverage, calcBowlingEconomy } from "../lib/utils";
import { type BowlingStatSchema, bowlingStatSchema } from "../lib/schemas";
import { getStatWhere } from "../lib/helpers";
import { type BowlingStats } from "../lib/types";

export const bowlingRouter = router({
	list: publicProcedure.input(bowlingStatSchema).query(async ({ input }) => {
		if (input.filter === "most-wickets") return getMostWickets(input);
		if (input.filter === "most-runs") return getMostRuns(input);
		if (input.filter === "most-dots") return getMostDots(input);
		if (input.filter === "most-wides") return getMostWides(input);
		if (input.filter === "most-no-balls") return getMostNoBalls(input);
		if (input.filter === "most-2fr") return getMostTwoFR(input);
		if (input.filter === "most-3fr") return getMostThreeFR(input);
		if (input.filter === "best-economy") return getBestEconomy(input);
		if (input.filter === "best-average") return getBestAverage(input);
		return getBowlingStats(input);
	}),
});

const getBowlingStats = async (filters: BowlingStatSchema): Promise<BowlingStats[]> => {
	const data = await db.bowlers.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { innings: true, runs: true, balls: true, wickets: true, dots: true, wides: true, noBalls: true, twoFR: true, threeFR: true },
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
};

const getMostWickets = async (filters: BowlingStatSchema): Promise<BowlingStats[]> => {
	const data = await db.bowlers.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { innings: true, balls: true, wickets: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			innings: val._sum.innings ?? 0,
			balls: val._sum.balls ?? 0,
			wickets: val._sum.wickets ?? 0,
		}))
		.sort((a, b) => b.wickets - a.wickets);
};

const getMostRuns = async (filters: BowlingStatSchema): Promise<BowlingStats[]> => {
	const data = await db.bowlers.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { runs: true, balls: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			runs: val._sum.runs ?? 0,
			balls: val._sum.balls ?? 0,
		}))
		.sort((a, b) => b.runs - a.runs);
};

const getMostDots = async (filters: BowlingStatSchema): Promise<BowlingStats[]> => {
	const data = await db.bowlers.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { balls: true, dots: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			balls: val._sum.balls ?? 0,
			dots: val._sum.dots ?? 0,
		}))
		.sort((a, b) => b.dots - a.dots);
};

const getMostWides = async (filters: BowlingStatSchema): Promise<BowlingStats[]> => {
	const data = await db.bowlers.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { balls: true, wides: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			balls: val._sum.balls ?? 0,
			wides: val._sum.wides ?? 0,
		}))
		.sort((a, b) => b.wides - a.wides);
};

const getMostNoBalls = async (filters: BowlingStatSchema): Promise<BowlingStats[]> => {
	const data = await db.bowlers.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { balls: true, noBalls: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			balls: val._sum.balls ?? 0,
			noBalls: val._sum.noBalls ?? 0,
		}))
		.sort((a, b) => b.noBalls - a.noBalls);
};

const getMostTwoFR = async (filters: BowlingStatSchema): Promise<BowlingStats[]> => {
	const data = await db.bowlers.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { innings: true, twoFR: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			innings: val._sum.innings ?? 0,
			twoFR: val._sum.twoFR ?? 0,
		}))
		.sort((a, b) => b.twoFR - a.twoFR);
};

const getMostThreeFR = async (filters: BowlingStatSchema): Promise<BowlingStats[]> => {
	const data = await db.bowlers.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { innings: true, threeFR: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			innings: val._sum.innings ?? 0,
			threeFR: val._sum.threeFR ?? 0,
		}))
		.sort((a, b) => b.threeFR - a.threeFR);
};

const getBestEconomy = async (filters: BowlingStatSchema): Promise<BowlingStats[]> => {
	const data = await db.bowlers.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { runs: true, balls: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			runs: val._sum.runs ?? 0,
			balls: val._sum.balls ?? 0,
			economy: calcBowlingEconomy(val._sum),
		}))
		.sort((a, b) => b.economy - a.economy);
};

const getBestAverage = async (filters: BowlingStatSchema): Promise<BowlingStats[]> => {
	const data = await db.bowlers.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { runs: true, wickets: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			runs: val._sum.runs ?? 0,
			wickets: val._sum.wickets ?? 0,
			average: calcBowlingAverage(val._sum),
		}))
		.sort((a, b) => b.average - a.average);
};
