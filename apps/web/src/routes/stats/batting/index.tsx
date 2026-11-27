import { statSchema } from "@ghurki-cricket/api/schema";
import { type BattingStats } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { StatsView } from "@/components/stats-view";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<BattingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Inns" },
	{ accessorKey: "runs", header: "Runs" },
	{ accessorKey: "balls", header: "Balls" },
	{ accessorKey: "notOuts", header: "NO" },
	{ accessorKey: "strikeRate", header: "SR", cell: ({ row }) => row.original.strikeRate?.toFixed() },
	{ accessorKey: "average", header: "Avg", cell: ({ row }) => row.original.average?.toFixed(1) },
	{ accessorKey: "highestScore", header: "HS" },
	{ accessorKey: "fours", header: "4s" },
	{ accessorKey: "sixes", header: "6s" },
	{ accessorKey: "ducks", header: "0s" },
	{ accessorKey: "thirties", header: "30s" },
	{ accessorKey: "fifties", header: "50s" },
];

export const Route = createFileRoute("/stats/batting/")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Batting Stats | Ghurki Cricket" },
			{ name: "description", content: "Batting leaderboards, runs, strike rates, averages, and boundaries for Ghurki Cricket." },
		],
	}),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Batting Stats"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" />]}
				queryOptions={trpc.batting.list.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "runs", desc: true }}
			/>
		);
	},
});
