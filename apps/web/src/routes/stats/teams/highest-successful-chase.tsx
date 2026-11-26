import { teamRunsSchema } from "@ghurki-cricket/api/schema";
import { type TeamHighestChaseStat } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DataTable, type ColumnDef, DataTableError, DataTableLoader } from "@/components/data-table";
import { EachTeamFilter } from "@/components/filters/each-team-filter";
import { OversFilter } from "@/components/filters/overs-filter";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<TeamHighestChaseStat>[] = [
	{ accessorKey: "team", header: "Team" },
	{ accessorKey: "target", header: "Target" },
	{ accessorKey: "score", header: "Score", sortFn: (rowA, rowB) => parseInt(rowA.original.score, 10) - parseInt(rowB.original.score, 10) },
	{ accessorKey: "overs", header: "Overs" },
	{ accessorKey: "potm", header: "POTM" },
	{ accessorKey: "date", header: "Date" },
];

export const Route = createFileRoute("/stats/teams/highest-successful-chase")({
	validateSearch: teamRunsSchema,
	head: () => ({
		meta: [
			{ title: "Highest Successful Chase | Ghurki Cricket" },
			{ name: "description", content: "Highest successful run chases by teams in Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Highest successful chase"
				headerRight={
					<div className="flex items-center gap-4 sm:justify-end">
						<EachTeamFilter />
						<OversFilter />
					</div>
				}
			>
				<HighestChaseTable />
			</PageLayout>
		);
	},
});

function HighestChaseTable() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.teams.highestChases.queryOptions(search));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "target", desc: true }} />;
}
