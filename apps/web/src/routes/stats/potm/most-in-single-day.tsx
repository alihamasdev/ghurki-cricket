import { groupSchema } from "@ghurki-cricket/api/schema";
import { type POTMStats } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { type ColumnDef } from "@/components/data-table";
import { GroupFilter } from "@/components/filters/group-filter";
import { StatsView } from "@/components/stats-view";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<POTMStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "potm", header: "Player of Match" },
];

export const Route = createFileRoute("/stats/potm/most-in-single-day")({
	validateSearch: groupSchema,
	head: () => ({
		meta: [
			{ title: "Most in Single Day | Ghurki Cricket" },
			{ name: "description", content: "Most in a single day Player of the Match statistics for Ghurki Cricket." },
		],
	}),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Most in single day"
				filters={[<GroupFilter key="group" />]}
				queryOptions={trpc.potm.mostInSingleDay.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "potm", desc: true }}
			/>
		);
	},
});
