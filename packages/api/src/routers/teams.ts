import { db, Prisma } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getDate } from "../lib/helpers";
import { compareTeamSchema, overSchema } from "../lib/schemas";
import type { TeamConsecutiveWinsStat, TeamHighestChaseStat, TeamInningStat, TeamLowestDefendedStat, TeamStats } from "../lib/types";
import { calcStrikeRate, formatDate, formatMatchScore } from "../lib/utils";

export const teamsRouter = router({
	/**
	 * Lists all registered teams ordered alphabetically.
	 *
	 * @returns Array of team objects with name, slug, and avatar.
	 */
	list: publicProcedure.query(async () => {
		return await db.teams.findMany({
			orderBy: { name: "asc" },
			select: { name: true, slug: true, avatar: true },
		});
	}),

	/**
	 * Aggregates overall team performance statistics (series wins, matches played/won, win percentage, runs, balls, strike rate).
	 *
	 * @param input - Optional overs filter.
	 * @returns Array of team statistics sorted by series won descending.
	 */
	listStats: publicProcedure.input(overSchema).query(async ({ input }): Promise<TeamStats[]> => {
		const matchWhere = input?.overs ? { overs: input.overs } : {};
		const inningsWhere = input?.overs ? { match: { overs: input.overs } } : {};
		const dateWhere = input?.overs ? { matches: { some: { overs: input.overs } } } : {};

		const [teams, seriesStats, matchStats, winStats, aggregateStats] = await db.$transaction([
			db.teams.findMany({
				select: { name: true },
				orderBy: { name: "asc" },
			}),
			db.dates.groupBy({
				by: ["winnerId"],
				where: { winnerId: { not: null }, ...dateWhere },
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
		]);

		const matchesPlayedMap = matchStats.reduce<Record<string, number>>((acc, curr) => {
			acc[curr.teamId] = (acc[curr.teamId] ?? 0) + 1;

			return acc;
		}, {});

		return teams
			.map((team) => {
				const teamName = team.name;
				const seriesWon = seriesStats.find((s) => s.winnerId === teamName)?._count.winnerId ?? 0;
				const played = matchesPlayedMap[teamName] ?? 0;
				const matchesWon = winStats.find((w) => w.winnerId === teamName)?._count.winnerId ?? 0;
				const winPercentage = played ? Math.round((matchesWon / played) * 100) : 0;
				const agg = aggregateStats.find((a) => a.teamId === teamName)?._sum;
				const runs = agg?.runs ?? 0;
				const balls = agg?.balls ?? 0;
				const wickets = agg?.wickets ?? 0;
				const allOut = agg?.allOuts ?? 0;
				const strikeRate = calcStrikeRate({ runs, balls });

				return {
					team: teamName,
					series: seriesWon,
					winPercentage,
					runs,
					balls,
					wickets,
					strikeRate,
					allOut,
				};
			})
			.sort((a, b) => b.series - a.series);
	}),

	/**
	 * Finds the highest team innings totals recorded across matches.
	 *
	 * @param input - Optional overs filter.
	 * @returns Array of highest team scores with runs, balls, wickets, run rate, and match date sorted by runs descending.
	 */
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

	/**
	 * Finds the lowest team scores where the team was bowled all out.
	 *
	 * @param input - Optional overs filter.
	 * @returns Array of lowest all-out innings totals with runs, balls, wickets, run rate, and match date sorted by runs ascending.
	 */
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

	/**
	 * Retrieves the top 10 highest successfully chased targets by teams using a LATERAL join.
	 *
	 * @param input - Optional overs filter.
	 * @returns Array of top 10 highest target chases with match score and date sorted by target descending.
	 */
	highestChases: publicProcedure.input(overSchema).query(async ({ input }): Promise<TeamHighestChaseStat[]> => {
		const overFilter = input?.overs ? Prisma.sql`AND m.overs = ${input.overs}` : Prisma.empty;

		const rows = await db.$queryRaw<
			{
				team: string;
				target: number;
				overs: number;
				potm: string | null;
				dateId: Date;
				runs: number;
				balls: number;
				wickets: number;
				allOuts: number;
			}[]
		>`
			SELECT 
				i."teamId" AS team,
				m.target,
				m.overs,
				m."potmId" AS potm,
				m."dateId",
				i.runs,
				i.balls,
				i.wickets,
				i."allOuts"
			FROM matches m
			JOIN LATERAL (
				SELECT id, "teamId", runs, balls, wickets, "allOuts"
				FROM innings
				WHERE "matchId" = m.id
				ORDER BY id DESC
				LIMIT 1
			) i ON true
			WHERE m.target IS NOT NULL
			  AND m."winnerId" = i."teamId"
			  ${overFilter}
			ORDER BY m.target DESC
			LIMIT 10
		`;

		return rows.map((r) => ({
			team: r.team,
			target: r.target,
			score: formatMatchScore({
				runs: r.runs,
				balls: r.balls,
				wickets: r.wickets,
				allOuts: r.allOuts,
			}),
			overs: r.overs,
			potm: r.potm ?? "-",
			date: formatDate(r.dateId, "short"),
		}));
	}),

	/**
	 * Retrieves the top 10 lowest defended targets where the defending team successfully won.
	 *
	 * @param input - Optional overs filter.
	 * @returns Array of top 10 lowest target defenses with match score and date sorted by target ascending.
	 */
	lowestDefended: publicProcedure.input(overSchema).query(async ({ input }): Promise<TeamLowestDefendedStat[]> => {
		const overFilter = input?.overs ? Prisma.sql`AND m.overs = ${input.overs}` : Prisma.empty;

		const rows = await db.$queryRaw<
			{
				team: string;
				target: number;
				overs: number;
				potm: string | null;
				dateId: Date;
				runs: number;
				balls: number;
				wickets: number;
				allOuts: number;
			}[]
		>`
			SELECT 
				m."winnerId" AS team,
				m.target,
				m.overs,
				m."potmId" AS potm,
				m."dateId",
				i.runs,
				i.balls,
				i.wickets,
				i."allOuts"
			FROM matches m
			JOIN LATERAL (
				SELECT id, "teamId", runs, balls, wickets, "allOuts"
				FROM innings
				WHERE "matchId" = m.id
				ORDER BY id DESC
				LIMIT 1
			) i ON true
			WHERE m.target IS NOT NULL
			  AND m."winnerId" != i."teamId"
			  ${overFilter}
			ORDER BY m.target ASC
			LIMIT 10
		`;

		return rows.map((r) => ({
			team: r.team,
			target: r.target,
			score: formatMatchScore({
				runs: r.runs,
				balls: r.balls,
				wickets: r.wickets,
				allOuts: r.allOuts,
			}),
			overs: r.overs,
			potm: r.potm ?? "-",
			date: formatDate(r.dateId, "short"),
		}));
	}),

	/**
	 * Computes the longest consecutive match winning streak for each team using SQL gaps-and-islands window functions.
	 *
	 * @returns Array of teams with their maximum consecutive match winning streak count sorted descending.
	 */
	consecutiveWins: publicProcedure.query(async (): Promise<TeamConsecutiveWinsStat[]> => {
		return await db.$queryRaw<TeamConsecutiveWinsStat[]>`
			WITH team_matches AS (
				SELECT DISTINCT
					i."teamId" AS team,
					m."dateId",
					m.id AS match_id,
					CASE WHEN m."winnerId" = i."teamId" THEN 1 ELSE 0 END AS is_win
				FROM matches m
				JOIN innings i ON i."matchId" = m.id
			),
			streaks AS (
				SELECT 
					team,
					is_win,
					SUM(CASE WHEN is_win = 0 THEN 1 ELSE 0 END) OVER (
						PARTITION BY team 
						ORDER BY "dateId" ASC, match_id ASC
					) AS streak_group
				FROM team_matches
			),
			streak_lengths AS (
				SELECT 
					team,
					COUNT(*) AS wins
				FROM streaks
				WHERE is_win = 1
				GROUP BY team, streak_group
			)
			SELECT 
				t.name AS team,
				COALESCE(MAX(s.wins), 0)::int AS wins
			FROM teams t
			LEFT JOIN streak_lengths s ON s.team = t.name
			GROUP BY t.name
			ORDER BY wins DESC
		`;
	}),

	/**
	 * Compares team statistics side-by-side (series wins, win percentage, run rate, highest/lowest scores).
	 *
	 * @param input - Optional rivalry, date range, exact date, or overs filter.
	 * @returns Array of team comparison stats sorted by win percentage descending.
	 */
	compare: publicProcedure.input(compareTeamSchema).query(async ({ input }) => {
		const dateWhere = input && getDate(input);
		const rivalryId = dateWhere && "date" in dateWhere && dateWhere.date?.rivalryId ? dateWhere.date.rivalryId : undefined;
		const matchWhere = { ...dateWhere };

		if (input?.overs) {
			Object.assign(matchWhere, { overs: input.overs });
		}

		const inningsWhere = { ...dateWhere };

		if (input?.overs) {
			Object.assign(inningsWhere, { match: { overs: input.overs } });
		}

		const datesWhere = {
			winnerId: { not: null },
		};

		if (rivalryId) {
			Object.assign(datesWhere, { rivalryId });
		}

		const lowestWhere = { ...inningsWhere };

		if (!input?.date) {
			Object.assign(lowestWhere, { allOuts: 1 });
		}

		const [seriesStats, matchStats, winStats, aggregateStats, highestScores, lowestScores] = await db.$transaction([
			db.dates.groupBy({
				by: ["winnerId"],
				where: datesWhere,
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
				where: lowestWhere,
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
					seriesWon: !input?.date && !input?.overs ? seriesWins : undefined,
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
