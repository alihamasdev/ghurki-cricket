import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getDate } from "../lib/helpers";
import { dateSchema } from "../lib/schemas";
import { formatMatchScore } from "../lib/utils";

export const teamsRouter = router({
	list: publicProcedure.query(async () => {
		return await db.teams.findMany({
			orderBy: { name: "asc" },
			select: { name: true, slug: true, avatar: true },
		});
	}),
	compare: publicProcedure.input(dateSchema.optional()).query(async ({ input }) => {
		let dateWhere = input && getDate({ date: input.date, rivalry: input.rivalry });

		if (!input?.date && !input?.rivalry) {
			const lastRivalry = await db.rivalries.findFirst({
				orderBy: { startedAt: "desc" },
			});
			if (lastRivalry) {
				dateWhere = { date: { rivalryId: lastRivalry.title } };
			}
		}

		const [matchStats, winStats, aggregateStats, highestScores, lowestScores] = await db.$transaction([
			db.innings.groupBy({
				by: ["teamId", "matchId"],
				where: dateWhere,
			}),
			db.matches.groupBy({
				by: ["winnerId"],
				where: dateWhere,
				_count: { winnerId: true },
			}),
			db.innings.groupBy({
				by: ["teamId"],
				where: dateWhere,
				_sum: { runs: true, balls: true, wickets: true, allOuts: true },
			}),
			db.innings.findMany({
				distinct: ["teamId"],
				where: dateWhere,
				orderBy: { runs: "desc" },
				select: { teamId: true, runs: true, balls: true, wickets: true, allOuts: true },
			}),
			db.innings.findMany({
				distinct: ["teamId"],
				where: { ...dateWhere, ...(input?.date ? {} : { allOuts: 1 }) },
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
				const played = matchesPlayedMap[teamId] ?? 0;
				const wins = winStats.find((w) => w.winnerId === teamId)?._count.winnerId ?? 0;
				const agg = aggregateStats.find((a) => a.teamId === teamId)?._sum;
				const highest = highestScores.find((h) => h.teamId === teamId);
				const lowest = lowestScores.find((l) => l.teamId === teamId);

				const runs = agg?.runs ?? 0;
				const balls = agg?.balls ?? 0;

				return {
					team: teamId,
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
});
