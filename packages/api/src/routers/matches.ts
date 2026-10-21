import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getDate } from "../lib/helpers";
import { dateSchema, matchSchema } from "../lib/schemas";
import { formatDate, formatMatchScore } from "../lib/utils";

export const matchesRouter = router({
	listOvers: publicProcedure.input(dateSchema.optional()).query(async ({ input }) => {
		const where = input ? getDate(input) : undefined;

		const [totalMatches, overs] = await db.$transaction([
			db.matches.count({ where }),
			db.matches.groupBy({
				by: ["overs"],
				where,
				orderBy: { overs: "asc" },
				_count: true,
			}),
		]);

		return {
			totalMatches,
			overs: overs.map((o) => ({ overs: o.overs, count: o._count })),
		};
	}),
	list: publicProcedure.input(matchSchema).query(async ({ input }) => {
		const matches = await db.matches.findMany({
			where: { ...getDate(input), potmId: input.potm, ...(input.overs ? { overs: input.overs } : {}) },
			orderBy: { id: "desc" },
			include: {
				innings: {
					orderBy: { id: "asc" },
					select: { id: true, teamId: true, runs: true, balls: true, wickets: true, allOuts: true },
				},
			},
		});

		const formattedMatches = matches.map((match) => ({
			id: match.id,
			potm: match.potmId,
			date: formatDate(match.dateId, "short"),
			result: `${match.winnerId} won by ${match.winBy}`,
			innings: match.innings.map((inning) => ({
				id: inning.id,
				team: inning.teamId,
				score: formatMatchScore(inning),
			})),
		}));

		return Object.groupBy(formattedMatches.reverse(), (match) => match.date);
	}),
});
