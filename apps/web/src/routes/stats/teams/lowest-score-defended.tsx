import { teamRunsSchema } from "@ghurki-cricket/api/schema";
import { type TeamLowestDefendedStat } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DataTable, type ColumnDef, DataTableLoader, DataTableError } from "@/components/data-table";
import { EachTeamFilter } from "@/components/filters/each-team-filter";
import { OversFilter } from "@/components/filters/overs-filter";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<TeamLowestDefendedStat>[] = [
	{ accessorKey: "team", header: "Team" },
	{ accessorKey: "target", header: "Target" },
	{ accessorKey: "score", header: "Score", sortFn: (rowA, rowB) => parseInt(rowA.original.score, 10) - parseInt(rowB.original.score, 10) },
	{ accessorKey: "overs", header: "Overs" },
	{ accessorKey: "potm", header: "POTM" },
	{ accessorKey: "date", header: "Date" },
];

export const Route = createFileRoute("/stats/teams/lowest-score-defended")({
	validateSearch: teamRunsSchema,
	head: () => ({
		meta: [
			{ title: "Lowest Score Defended | Ghurki Cricket" },
			{ name: "description", content: "Lowest scores defended by teams in Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Lowest score defended"
				headerRight={
					<div className="flex items-center gap-4 sm:justify-end">
						<EachTeamFilter />
						<OversFilter />
					</div>
				}
			>
				<LowestDefendedTable />
			</PageLayout>
		);
	},
});

function LowestDefendedTable() {
	const { overs, limit, each } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.teams.lowestDefended.queryOptions({ overs, limit, each }));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "target", desc: false }} />;
}
