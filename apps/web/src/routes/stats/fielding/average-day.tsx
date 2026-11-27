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
	{ accessorKey: "innings", header: "Innings", cell: ({ row }) => row.original.innings?.toFixed(2) },
	{ accessorKey: "catches", header: "Catches", cell: ({ row }) => row.original.catches?.toFixed(2) },
	{ accessorKey: "runOuts", header: "Run Outs", cell: ({ row }) => row.original.runOuts?.toFixed(2) },
];

export const Route = createFileRoute("/stats/fielding/average-day")({
	validateSearch: statSchema.omit({ date: true }),
	head: () => ({
		meta: [
			{ title: "Average Day Stats | Ghurki Cricket" },
			{ name: "description", content: "Average day fielding statistics for Ghurki Cricket." },
		],
	}),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Average Day Stats"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" hasDates={false} />]}
				queryOptions={trpc.fielding.listAvgPerDay.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "catches", desc: true }}
			/>
		);
	},
});
