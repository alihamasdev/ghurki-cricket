import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";
import { PlayerAvatarCell } from "@/components/players/avatar";
import { TabsLayout } from "@/components/tabs-layout";
import { db } from "@/lib/db";
import { type RankingStats } from "@/lib/types";

const getRankingStats = createServerFn({ method: "GET" }).handler(async (): Promise<RankingStats[]> => {
	const players = await db.players.findMany({
		select: { name: true, rating: true },
		orderBy: { rating: "desc" },
	});

	return players.map((p, index) => ({
		player: p.name,
		rank: index + 1,
		rating: p.rating,
	}));
});

const columns: ColumnDef<RankingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerAvatarCell name={row.original.player} /> },
	{ accessorKey: "rating", header: "Rating" },
];

export const Route = createFileRoute("/_stats/stats/ranking")({
	head: () => ({ meta: [{ title: "Ranking Stats" }] }),
	loader: async ({ context }) =>
		await context.queryClient.ensureQueryData({
			queryKey: ["ranking-stats"],
			queryFn: () => getRankingStats(),
		}),
	component: () => {
		const data = Route.useLoaderData();
		return (
			<TabsLayout title="Ranking Stats" dateFilter={null}>
				<DataTable columns={columns} data={data} className="table-fixed" />
			</TabsLayout>
		);
	},
});
