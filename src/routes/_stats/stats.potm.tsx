import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";
import { validateDate } from "@/components/date-filter";
import { PlayerAvatarCell } from "@/components/players/avatar";
import { TabsLayout } from "@/components/tabs-layout";
import { db } from "@/lib/db";
import { type ManOfMatchStats } from "@/lib/types";

const getPlayerOfMatchStats = createServerFn({ method: "GET" })
	.inputValidator(validateDate)
	.handler(async ({ data }): Promise<ManOfMatchStats[]> => {
		const stats = await db.matches.groupBy({
			by: ["potmId"],
			_count: { potmId: true },
			where: { date: data },
			orderBy: { _count: { potmId: "desc" } },
		});

		return stats
			.filter(({ potmId }) => potmId !== null)
			.map(({ potmId, _count }) => ({
				player: potmId as string,
				count: _count.potmId,
			}));
	});

const columns: ColumnDef<ManOfMatchStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerAvatarCell name={row.original.player} /> },
	{ accessorKey: "count", header: "Player of Match" },
];

export const Route = createFileRoute("/_stats/stats/potm")({
	head: () => ({ meta: [{ title: "Player of the Match Stats" }] }),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) =>
		await context.queryClient.ensureQueryData({
			queryKey: ["player-of-match-stats", deps.date ?? deps.rivalry ?? "all-time"],
			queryFn: () => getPlayerOfMatchStats({ data: deps }),
		}),
	component: () => {
		const data = Route.useLoaderData();
		return (
			<TabsLayout title="Player of the Match Stats">
				<DataTable columns={columns} data={data} />
			</TabsLayout>
		);
	},
});
