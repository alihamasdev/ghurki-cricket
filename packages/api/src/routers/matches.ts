import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { formatDate, formatMatchScore } from "../lib/utils";

export const matchesRouter = router({
	list: publicProcedure.query(async () => {
		const matches = await db.matches.findMany({
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
			date: formatDate(match.dateId),
			result: `${match.winnerId} won by ${match.winBy}`,
			innings: match.innings.map((inning) => ({
				id: inning.id,
				team: inning.teamId,
				score: formatMatchScore(inning),
			})),
		}));

		return Object.groupBy(formattedMatches, (match) => match.date);
	}),
});
