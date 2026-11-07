import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getGroup } from "../lib/helpers";
import { comparePlayerSchema, groupSchema } from "../lib/schemas";

export const playerRouter = router({
	list: publicProcedure.input(groupSchema).query(async ({ input }) => {
		return await db.players.findMany({
			orderBy: { name: "asc" },
			where: { group: getGroup(input) },
			select: { name: true, role: true, avatar: true },
		});
	}),
	compare: publicProcedure.input(comparePlayerSchema).query(async ({ input }) => {
		const { player1, player2, rivalry } = input ?? {};
		if (!player1 || !player2 || player1 === player2) {
			return null;
		}

		const data = await db.records.groupBy({
			by: ["batterId", "bowlerId"],
			where: {
				OR: [
					{ batterId: player1, bowlerId: player2 },
					{ batterId: player2, bowlerId: player1 },
				],
				...(rivalry ? { rivalryId: rivalry } : {}),
			},
			_sum: {
				runs: true,
				balls: true,
				dots: true,
				fours: true,
				sixes: true,
				wickets: true,
			},
		});

		if (data.length === 0) {
			return null;
		}

		const p1Sum = data.find((d) => d.batterId === player1 && d.bowlerId === player2)?._sum;
		const p2Sum = data.find((d) => d.batterId === player2 && d.bowlerId === player1)?._sum;

		const formatStats = (sum?: typeof p1Sum) => {
			const runs = sum?.runs ?? 0;
			const balls = sum?.balls ?? 0;
			const dots = sum?.dots ?? 0;
			const fours = sum?.fours ?? 0;
			const sixes = sum?.sixes ?? 0;
			const wickets = sum?.wickets ?? 0;

			const strikeRate = balls > 0 ? +((runs / balls) * 100).toFixed(2) : 0;
			const average = wickets > 0 ? +(runs / wickets).toFixed(2) : null;
			const dotPercentage = balls > 0 ? +((dots / balls) * 100).toFixed(1) : 0;

			return {
				runs,
				balls,
				dots,
				fours,
				sixes,
				wickets,
				strikeRate,
				average,
				dotPercentage,
			};
		};

		return {
			player1: { name: player1 },
			player2: { name: player2 },
			p1BattingVsP2Bowling: formatStats(p1Sum),
			p2BattingVsP1Bowling: formatStats(p2Sum),
		};
	}),
});
