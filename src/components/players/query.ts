import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { db } from "@/lib/db";

const getPlayers = createServerFn({ method: "GET" }).handler(async () => {
	return await db.players.findMany({ orderBy: { name: "asc" } });
});

export const playerQueryOptions = () => {
	return queryOptions({
		queryKey: ["players"],
		queryFn: () => getPlayers(),
	});
};
