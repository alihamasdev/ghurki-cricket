import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getDate } from "../lib/helpers";
import { matchListSchema } from "../lib/schemas";
import { formatDate, formatMatchScore } from "../lib/utils";

export const matchesRouter = router({
	list: publicProcedure.input(matchListSchema).query(async ({ input }) => {
		const page = input.cursor ?? 1;
		const limit = input.limit;
		const skip = (page - 1) * limit;

		const where = { ...getDate(input), potmId: input.potm };

		if (input.overs) {
			Object.assign(where, { overs: input.overs });
		}

		const [totalMatches, matches] = await db.$transaction([
			db.matches.count({ where }),
			db.matches.findMany({
				where,
				orderBy: { id: "desc" },
				skip,
				take: limit,
				include: {
					innings: {
						orderBy: { id: "asc" },
						select: { id: true, teamId: true, runs: true, balls: true, wickets: true, allOuts: true },
					},
				},
			}),
		]);

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

		const totalPages = Math.ceil(totalMatches / limit);
		const nextPage = page < totalPages ? page + 1 : undefined;

		return {
			matches: formattedMatches,
			totalMatches,
			totalPages,
			page,
			limit,
			nextPage,
		};
	}),
});
