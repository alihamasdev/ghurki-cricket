import { statSchema } from "@ghurki-cricket/api/schema";
import { type FieldingStats } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { StatsView } from "@/components/stats-view";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<FieldingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Innings" },
	{ accessorKey: "catches", header: "Catches" },
	{ accessorKey: "runOuts", header: "Run Outs" },
];

export const Route = createFileRoute("/stats/fielding/")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Fielding Stats | Ghurki Cricket" },
			{ name: "description", content: "Fielding statistics including catches and run-outs for Ghurki Cricket." },
		],
	}),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Fielding Stats"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" />]}
				queryOptions={trpc.fielding.list.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "catches", desc: true }}
			/>
		);
	},
});
