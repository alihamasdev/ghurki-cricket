import { teamRunsSchema } from "@ghurki-cricket/api/schema";
import { type TeamInningStat } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DataTable, type ColumnDef, DataTableLoader, DataTableError } from "@/components/data-table";
import { EachTeamFilter } from "@/components/filters/each-team-filter";
import { OversFilter } from "@/components/filters/overs-filter";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<TeamInningStat>[] = [
	{ accessorKey: "team", header: "Team" },
	{ accessorKey: "score", header: "Score", sortFn: (rowA, rowB) => parseInt(rowA.original.score, 10) - parseInt(rowB.original.score, 10) },
	{ accessorKey: "overs", header: "Overs" },
	{ accessorKey: "runRate", header: "RR" },
	{ accessorKey: "date", header: "Date" },
];

export const Route = createFileRoute("/stats/teams/lowest-runs")({
	validateSearch: teamRunsSchema,
	head: () => ({
		meta: [
			{ title: "Lowest Runs by Teams in Inning | Ghurki Cricket" },
			{ name: "description", content: "Lowest team innings scores, totals, and run rates for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Lowest runs by teams in inning"
				headerRight={
					<div className="flex items-center gap-4 sm:justify-end">
						<EachTeamFilter />
						<OversFilter />
					</div>
				}
			>
				<LowestRunsTable />
			</PageLayout>
		);
	},
});

function LowestRunsTable() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.teams.lowestRuns.queryOptions(search));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "score", desc: false }} />;
}
