import { statSchema } from "@ghurki-cricket/api/schema";
import { type OtherBattingStats } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { StatsView } from "@/components/stats-view";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<OtherBattingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Inns" },
	{ accessorKey: "runs", header: "Runs" },
	{ accessorKey: "balls", header: "Balls" },
	{ accessorKey: "fours", header: "4s" },
	{ accessorKey: "sixes", header: "6s" },
];

export const Route = createFileRoute("/stats/batting/most-in-single-day")({
	validateSearch: statSchema.omit({ date: true }),
	head: () => ({
		meta: [
			{ title: "Most in Single Day Stats | Ghurki Cricket" },
			{ name: "description", content: "Most in a single day batting statistics for Ghurki Cricket." },
		],
	}),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Most in Single Day Stats"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" hasDates={false} />]}
				queryOptions={trpc.batting.mostInSingleDay.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "runs", desc: true }}
			/>
		);
	},
});
