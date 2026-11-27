import { statSchema } from "@ghurki-cricket/api/schema";
import { type OtherBattingStats } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { StatsView } from "@/components/stats-view";
import { seo } from "@/lib/seo";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<OtherBattingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Inns", cell: ({ row }) => row.original.innings?.toFixed(2) },
	{ accessorKey: "runs", header: "Runs", cell: ({ row }) => row.original.runs?.toFixed(2) },
	{ accessorKey: "balls", header: "Balls", cell: ({ row }) => row.original.balls?.toFixed(2) },
	{ accessorKey: "fours", header: "4s", cell: ({ row }) => row.original.fours?.toFixed(2) },
	{ accessorKey: "sixes", header: "6s", cell: ({ row }) => row.original.sixes?.toFixed(2) },
];

export const Route = createFileRoute("/stats/batting/average-day")({
	validateSearch: statSchema.omit({ date: true }),
	head: () => seo("Average Day Stats", "Average day batting statistics for Ghurki Cricket."),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Average Day Stats"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" hasDates={false} />]}
				queryOptions={trpc.batting.listAvgPerDay.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "runs", desc: true }}
			/>
		);
	},
});
