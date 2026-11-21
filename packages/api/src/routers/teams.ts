import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getDate } from "../lib/helpers";
import { compareTeamSchema, overSchema } from "../lib/schemas";
import type { TeamConsecutiveWinsStat, TeamHighestChaseStat, TeamInningStat, TeamLowestDefendedStat } from "../lib/types";
import { formatDate, formatMatchScore } from "../lib/utils";

export const teamsRouter = router({
	list: publicProcedure.query(async () => {
		return await db.teams.findMany({
			orderBy: { name: "asc" },
			select: { name: true, slug: true, avatar: true },
		});
	}),

	compare: publicProcedure.input(compareTeamSchema).query(async ({ input }) => {
		const dateWhere = input && getDate(input);
		const rivalryId = dateWhere && "date" in dateWhere && dateWhere.date?.rivalryId ? dateWhere.date.rivalryId : undefined;
		const matchWhere = { ...dateWhere, ...(input?.overs ? { overs: input.overs } : {}) };
		const inningsWhere = { ...dateWhere, ...(input?.overs ? { match: { overs: input.overs } } : {}) };

		const [seriesStats, matchStats, winStats, aggregateStats, highestScores, lowestScores] = await db.$transaction([
			db.dates.groupBy({
				by: ["winnerId"],
				where: { winnerId: { not: null }, ...(rivalryId ? { rivalryId } : {}) },
				_count: { winnerId: true },
			}),
			db.innings.groupBy({
				by: ["teamId", "matchId"],
				where: inningsWhere,
			}),
			db.matches.groupBy({
				by: ["winnerId"],
				where: matchWhere,
				_count: { winnerId: true },
			}),
			db.innings.groupBy({
				by: ["teamId"],
				where: inningsWhere,
				_sum: { runs: true, balls: true, wickets: true, allOuts: true },
			}),
			db.innings.findMany({
				distinct: ["teamId"],
				where: inningsWhere,
				orderBy: { runs: "desc" },
				select: { teamId: true, runs: true, balls: true, wickets: true, allOuts: true },
			}),
			db.innings.findMany({
				distinct: ["teamId"],
				where: { ...inningsWhere, ...(input?.date ? {} : { allOuts: 1 }) },
				orderBy: { runs: "asc" },
				select: { teamId: true, runs: true, balls: true, wickets: true, allOuts: true },
			}),
		]);

		const matchesPlayedMap = matchStats.reduce<Record<string, number>>((acc, curr) => {
			acc[curr.teamId] = (acc[curr.teamId] ?? 0) + 1;
			return acc;
		}, {});

		const teams = Object.keys(matchesPlayedMap);

		return teams
			.map((teamId) => {
				const seriesWins = seriesStats.find((s) => s.winnerId === teamId)?._count.winnerId ?? 0;
				const played = matchesPlayedMap[teamId] ?? 0;
				const wins = winStats.find((w) => w.winnerId === teamId)?._count.winnerId ?? 0;
				const agg = aggregateStats.find((a) => a.teamId === teamId)?._sum;
				const highest = highestScores.find((h) => h.teamId === teamId);
				const lowest = lowestScores.find((l) => l.teamId === teamId);

				const runs = agg?.runs ?? 0;
				const balls = agg?.balls ?? 0;

				return {
					team: teamId,
					...(!input?.date && !input?.overs ? { seriesWon: seriesWins } : {}),
					matchesPlayed: played,
					matchesWon: wins,
					winPercentage: played ? Math.round((wins / played) * 100) : 0,
					totalRuns: runs,
					totalBalls: balls,
					totalWickets: agg?.wickets ?? 0,
					teamAllOut: agg?.allOuts ?? 0,
					strikeRate: balls ? +((runs / balls) * 100).toFixed(2) : 0,
					highestScore: highest ? formatMatchScore(highest) : "-",
					lowestScore: lowest ? formatMatchScore(lowest) : "-",
				};
			})
			.sort((a, b) => b.winPercentage - a.winPercentage);
	}),

	highestRuns: publicProcedure.input(overSchema).query(async ({ input }): Promise<TeamInningStat[]> => {
		const inningsWhere = input?.overs ? { match: { overs: input.overs } } : {};

		const innings = await db.innings.findMany({
			distinct: ["teamId"],
			where: inningsWhere,
			orderBy: { runs: "desc" },
			include: {
				match: { select: { overs: true } },
			},
		});

		return innings
			.map((inn) => ({
				team: inn.teamId,
				score: formatMatchScore(inn),
				overs: inn.match.overs,
				runRate: inn.balls ? ((inn.runs / inn.balls) * 6).toFixed(2) : "0.00",
				date: formatDate(inn.dateId, "short"),
				_runs: inn.runs,
			}))
			.sort((a, b) => b._runs - a._runs)
			.map(({ _runs, ...rest }) => rest);
	}),

	lowestRuns: publicProcedure.input(overSchema).query(async ({ input }): Promise<TeamInningStat[]> => {
		const inningsWhere = input?.overs ? { match: { overs: input.overs } } : {};

		const innings = await db.innings.findMany({
			distinct: ["teamId"],
			where: { ...inningsWhere, allOuts: 1 },
			orderBy: { runs: "asc" },
			include: {
				match: { select: { overs: true } },
			},
		});

		return innings
			.map((inn) => ({
				team: inn.teamId,
				score: formatMatchScore(inn),
				overs: inn.match.overs,
				runRate: inn.balls ? ((inn.runs / inn.balls) * 6).toFixed(2) : "0.00",
				date: formatDate(inn.dateId, "short"),
				_runs: inn.runs,
			}))
			.sort((a, b) => a._runs - b._runs)
			.map(({ _runs, ...rest }) => rest);
	}),

	highestChases: publicProcedure.input(overSchema).query(async ({ input }): Promise<TeamHighestChaseStat[]> => {
		const matchWhere = {
			target: { not: null },
			...(input?.overs ? { overs: input.overs } : {}),
		};

		const matches = await db.matches.findMany({
			where: matchWhere,
			include: {
				innings: {
					orderBy: { id: "desc" },
					take: 1,
					select: { teamId: true, runs: true, balls: true, wickets: true, allOuts: true },
				},
			},
		});

		const successfulChases: TeamHighestChaseStat[] = [];
		for (const match of matches) {
			const chasingInning = match.innings[0];
			if (chasingInning && match.target && match.winnerId === chasingInning.teamId) {
				successfulChases.push({
					team: chasingInning.teamId,
					target: match.target,
					score: formatMatchScore(chasingInning),
					potm: match.potmId ?? "-",
					date: formatDate(match.dateId, "short"),
				});
			}
		}

		return successfulChases.sort((a, b) => b.target - a.target).slice(0, 10);
	}),

	lowestDefended: publicProcedure.input(overSchema).query(async ({ input }): Promise<TeamLowestDefendedStat[]> => {
		const matchWhere = {
			target: { not: null },
			...(input?.overs ? { overs: input.overs } : {}),
		};

		const matches = await db.matches.findMany({
			where: matchWhere,
			include: {
				innings: {
					orderBy: { id: "desc" },
					take: 1,
					select: { teamId: true, runs: true, balls: true, wickets: true, allOuts: true },
				},
			},
		});

		const defended: TeamLowestDefendedStat[] = [];
		for (const match of matches) {
			const chasingInning = match.innings[0];
			if (chasingInning && match.target && match.winnerId !== chasingInning.teamId) {
				defended.push({
					team: match.winnerId,
					target: match.target,
					score: formatMatchScore(chasingInning),
					potm: match.potmId ?? "-",
					date: formatDate(match.dateId, "short"),
				});
			}
		}

		return defended.sort((a, b) => a.target - b.target).slice(0, 10);
	}),

	consecutiveWins: publicProcedure.input(overSchema).query(async ({ input }): Promise<TeamConsecutiveWinsStat[]> => {
		const matchWhere = input?.overs ? { overs: input.overs } : {};

		const matches = await db.matches.findMany({
			where: matchWhere,
			orderBy: [{ dateId: "asc" }, { id: "asc" }],
			include: {
				innings: { orderBy: { id: "asc" }, select: { teamId: true } },
			},
		});

		const maxStreaks = new Map<string, number>();
		const currentStreaks = new Map<string, number>();

		for (const match of matches) {
			const teamsInMatch = Array.from(new Set(match.innings.map((i) => i.teamId)));
			const winner = match.winnerId;

			for (const team of teamsInMatch) {
				if (team === winner) {
					const cur = (currentStreaks.get(team) || 0) + 1;
					currentStreaks.set(team, cur);
					const max = maxStreaks.get(team) || 0;
					if (cur > max) {
						maxStreaks.set(team, cur);
					}
				} else {
					currentStreaks.set(team, 0);
				}
			}
		}

		return Array.from(maxStreaks.entries())
			.map(([team, wins]) => ({ team, wins }))
			.sort((a, b) => b.wins - a.wins);
	}),
});
