import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";

export const playerRouter = router({
	list: publicProcedure.query(async () => {
		const players = await db.players.findMany({
			orderBy: { name: "asc" },
			select: { name: true },
		});
		return players.map((player) => ({ name: player.name, image: `https://stats.alihamas.pk/players/${player.name.toLowerCase()}.png` }));
	}),
});
