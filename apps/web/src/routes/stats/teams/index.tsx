import { overSchema } from "@ghurki-cricket/api/schema";
import { type TeamStats } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { type ColumnDef } from "@/components/data-table";
import { OversFilter } from "@/components/filters/overs-filter";
import { StatsView } from "@/components/stats-view";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<TeamStats>[] = [
	{ accessorKey: "team", header: "Team" },
	{ accessorKey: "series", header: "Series" },
	{ accessorKey: "winPercentage", header: "Win %", cell: ({ row }) => `${row.original.winPercentage}%` },
	{ accessorKey: "runs", header: "Runs" },
	{ accessorKey: "balls", header: "Balls" },
	{ accessorKey: "wickets", header: "Wkts" },
	{ accessorKey: "strikeRate", header: "SR", cell: ({ row }) => row.original.strikeRate?.toFixed() },
	{ accessorKey: "allOut", header: "All Out" },
];

export const Route = createFileRoute("/stats/teams/")({
	validateSearch: overSchema,
	head: () => ({
		meta: [
			{ title: "Team Stats | Ghurki Cricket" },
			{ name: "description", content: "Team statistics, match wins, series, runs, wickets, and strike rates for Ghurki Cricket." },
		],
	}),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Team Stats"
				filters={[<OversFilter key="overs" />]}
				queryOptions={trpc.teams.listStats.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "series", desc: true }}
			/>
		);
	},
});
