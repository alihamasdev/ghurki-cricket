import { db } from "@ghurki-cricket/db";
import { ballsToOvers, formatDate } from "../lib/utils";
import { publicProcedure, router } from "../index";

export const matchesRouter = router({
	list: publicProcedure.query(async () => {
		const matches = await db.matches.findMany({
			include: { innings: { orderBy: { id: "asc" } } },
		});

		const formattedMatches = matches.map((match) => ({
			id: match.id,
			date: match.dateId,
			result: `${match.winnerId} won by ${match.winBy}`,
			potm: match.potmId,
			innings: match.innings.map((inning) => ({
				id: inning.id,
				team: inning.teamId,
				score: inning.allOuts ? `${inning.runs} (${ballsToOvers(inning.balls)})` : `${inning.runs}-${inning.wickets} (${ballsToOvers(inning.balls)})`,
			})),
		}));

		return Object.groupBy(formattedMatches, (match) => formatDate(match.date));
	}),
});
