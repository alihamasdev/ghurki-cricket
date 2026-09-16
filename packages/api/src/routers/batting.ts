import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { calcBattingAverage, calcStrikeRate } from "../lib/utils";
import { battingStatSchema, type BattingStatSchema } from "../lib/schemas";
import { getStatWhere } from "../lib/helpers";
import { type BattingStats } from "../lib/types";

export const battingRouter = router({
	list: publicProcedure.input(battingStatSchema).query(async ({ input }) => {
		if (input.filter === "most-runs") return getMostRuns(input);
		if (input.filter === "most-fours") return getMostFours(input);
		if (input.filter === "most-sixes") return getMostSixes(input);
		if (input.filter === "most-ducks") return getMostDucks(input);
		if (input.filter === "most-thirties") return getMostThirties(input);
		if (input.filter === "most-fifties") return getMostFifties(input);
		if (input.filter === "most-not-outs") return getMostNotOuts(input);
		if (input.filter === "highest-score") return getHighestScore(input);
		if (input.filter === "best-average") return getBestAverage(input);
		if (input.filter === "best-strike-rate") return getBestStrikeRate(input);
		return getBattingStats(input);
	}),
});

const getBattingStats = async (filters: BattingStatSchema): Promise<BattingStats[]> => {
	const data = await db.batters.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { innings: true, runs: true, balls: true, notOuts: true, fours: true, sixes: true, ducks: true, thirties: true, fifties: true },
		_max: { highestScore: true },
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
};

const getMostRuns = async (filters: BattingStatSchema): Promise<BattingStats[]> => {
	const data = await db.batters.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { runs: true, balls: true, innings: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			runs: val._sum.runs ?? 0,
			balls: val._sum.balls ?? 0,
			innings: val._sum.innings ?? 0,
		}))
		.sort((a, b) => b.runs - a.runs);
};

const getMostFours = async (filters: BattingStatSchema): Promise<BattingStats[]> => {
	const data = await db.batters.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { fours: true, balls: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			fours: val._sum.fours ?? 0,
			balls: val._sum.balls ?? 0,
		}))
		.sort((a, b) => b.fours - a.fours);
};

const getMostSixes = async (filters: BattingStatSchema): Promise<BattingStats[]> => {
	const data = await db.batters.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { sixes: true, balls: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			sixes: val._sum.sixes ?? 0,
			balls: val._sum.balls ?? 0,
		}))
		.sort((a, b) => b.sixes - a.sixes);
};

const getMostDucks = async (filters: BattingStatSchema): Promise<BattingStats[]> => {
	const data = await db.batters.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { ducks: true, balls: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			ducks: val._sum.ducks ?? 0,
			balls: val._sum.balls ?? 0,
		}))
		.sort((a, b) => b.ducks - a.ducks);
};

const getMostThirties = async (filters: BattingStatSchema): Promise<BattingStats[]> => {
	const data = await db.batters.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { thirties: true, balls: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			thirties: val._sum.thirties ?? 0,
			balls: val._sum.balls ?? 0,
		}))
		.sort((a, b) => b.thirties - a.thirties);
};

const getMostFifties = async (filters: BattingStatSchema): Promise<BattingStats[]> => {
	const data = await db.batters.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { fifties: true, balls: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			fifties: val._sum.fifties ?? 0,
			balls: val._sum.balls ?? 0,
		}))
		.sort((a, b) => b.fifties - a.fifties);
};

const getMostNotOuts = async (filters: BattingStatSchema): Promise<BattingStats[]> => {
	const data = await db.batters.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { notOuts: true, innings: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			notOuts: val._sum.notOuts ?? 0,
			innings: val._sum.innings ?? 0,
		}))
		.sort((a, b) => b.notOuts - a.notOuts);
};

const getHighestScore = async (filters: BattingStatSchema): Promise<BattingStats[]> => {
	const data = await db.batters.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_max: { highestScore: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			highestScore: val._max.highestScore ?? 0,
		}))
		.sort((a, b) => b.highestScore - a.highestScore);
};

const getBestAverage = async (filters: BattingStatSchema): Promise<BattingStats[]> => {
	const data = await db.batters.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { runs: true, notOuts: true, innings: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			average: calcBattingAverage(val._sum),
		}))
		.sort((a, b) => b.average - a.average);
};

const getBestStrikeRate = async (filters: BattingStatSchema): Promise<BattingStats[]> => {
	const data = await db.batters.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { runs: true, balls: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			strikeRate: calcStrikeRate(val._sum),
		}))
		.sort((a, b) => b.strikeRate - a.strikeRate);
};
