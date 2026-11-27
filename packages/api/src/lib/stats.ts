import type { BattingStats, BowlingStats, FieldingStats, OtherBattingStats, OtherBowlingStats } from "./types";
import { calcBattingAverage, calcBowlingAverage, calcBowlingEconomy, calcStrikeRate } from "./utils";

export type RawBattingGroup = {
	playerId: string;
	_sum: {
		innings?: number | null;
		runs?: number | null;
		balls?: number | null;
		notOuts?: number | null;
		fours?: number | null;
		sixes?: number | null;
		ducks?: number | null;
		thirties?: number | null;
		fifties?: number | null;
	};
	_max: {
		highestScore?: number | null;
	};
};

export function mapBattingStats(val: RawBattingGroup): BattingStats {
	const sum = val._sum;

	return {
		player: val.playerId,
		innings: sum.innings ?? 0,
		runs: sum.runs ?? 0,
		balls: sum.balls ?? 0,
		notOuts: sum.notOuts ?? 0,
		fours: sum.fours ?? 0,
		sixes: sum.sixes ?? 0,
		ducks: sum.ducks ?? 0,
		thirties: sum.thirties ?? 0,
		fifties: sum.fifties ?? 0,
		highestScore: val._max.highestScore ?? 0,
		strikeRate: calcStrikeRate(sum),
		average: calcBattingAverage(sum),
	};
}

export type RawOtherBattingGroup = {
	playerId: string;
	_avg?: {
		innings?: number | null;
		runs?: number | null;
		balls?: number | null;
		fours?: number | null;
		sixes?: number | null;
	};
	_max?: {
		innings?: number | null;
		runs?: number | null;
		balls?: number | null;
		fours?: number | null;
		sixes?: number | null;
	};
};

export function mapOtherBattingStats(val: RawOtherBattingGroup): OtherBattingStats {
	const metrics = val._avg ?? val._max ?? {};

	return {
		player: val.playerId,
		innings: metrics.innings ?? 0,
		runs: metrics.runs ?? 0,
		balls: metrics.balls ?? 0,
		fours: metrics.fours ?? 0,
		sixes: metrics.sixes ?? 0,
	};
}

export type RawBowlingGroup = {
	playerId: string;
	_sum: {
		innings?: number | null;
		runs?: number | null;
		balls?: number | null;
		wickets?: number | null;
		dots?: number | null;
		wides?: number | null;
		noBalls?: number | null;
		twoFR?: number | null;
		threeFR?: number | null;
	};
};

export function mapBowlingStats(val: RawBowlingGroup): BowlingStats {
	return {
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
	};
}

export type RawOtherBowlingGroup = {
	playerId: string;
	_avg?: {
		innings?: number | null;
		runs?: number | null;
		balls?: number | null;
		wickets?: number | null;
		dots?: number | null;
		wides?: number | null;
	};
	_max?: {
		innings?: number | null;
		runs?: number | null;
		balls?: number | null;
		wickets?: number | null;
		dots?: number | null;
		wides?: number | null;
	};
};

export function mapOtherBowlingStats(val: RawOtherBowlingGroup): OtherBowlingStats {
	const metrics = val._avg ?? val._max ?? {};

	return {
		player: val.playerId,
		innings: metrics.innings ?? 0,
		runs: metrics.runs ?? 0,
		balls: metrics.balls ?? 0,
		wickets: metrics.wickets ?? 0,
		dots: metrics.dots ?? 0,
		wides: metrics.wides ?? 0,
	};
}

export type RawFieldingGroup = {
	playerId: string;
	_sum?: {
		innings?: number | null;
		catches?: number | null;
		runOuts?: number | null;
	};
	_avg?: {
		innings?: number | null;
		catches?: number | null;
		runOuts?: number | null;
	};
	_max?: {
		innings?: number | null;
		catches?: number | null;
		runOuts?: number | null;
	};
};

export function mapFieldingStats(val: RawFieldingGroup): FieldingStats {
	const metrics = val._sum ?? val._avg ?? val._max ?? {};

	return {
		player: val.playerId,
		innings: metrics.innings ?? 0,
		catches: metrics.catches ?? 0,
		runOuts: metrics.runOuts ?? 0,
	};
}
