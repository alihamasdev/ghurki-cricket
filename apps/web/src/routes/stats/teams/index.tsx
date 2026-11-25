import { overSchema } from "@ghurki-cricket/api/schema";
import { type TeamStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DataTable, type ColumnDef, DataTableError, DataTableLoader } from "@/components/data-table";
import { OversFilter } from "@/components/filters/overs-filter";
import { PageLayout } from "@/components/page-layout";
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
		return (
			<PageLayout
				title="Team Stats"
				headerRight={
					<div className="flex sm:justify-end">
						<OversFilter />
					</div>
				}
			>
				<TeamsTable />
			</PageLayout>
		);
	},
});

function TeamsTable() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.teams.listStats.queryOptions(search));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "series", desc: true }} />;
}
