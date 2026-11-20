import { overSchema } from "@ghurki-cricket/api/schema";
import { type TeamInningStat } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DataTable, type ColumnDef } from "@/components/data-table";
import { OversFilter } from "@/components/filters/overs-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<TeamInningStat>[] = [
	{ accessorKey: "team", header: "Team" },
	{
		accessorKey: "score",
		header: "Score",
		sortFn: (rowA, rowB) => parseInt(rowA.original.score, 10) - parseInt(rowB.original.score, 10),
	},
	{ accessorKey: "overs", header: "Overs" },
	{ accessorKey: "runRate", header: "RR" },
	{ accessorKey: "date", header: "Date" },
];

export const Route = createFileRoute("/compare/teams/highest-runs")({
	validateSearch: overSchema,
	head: () => ({
		meta: [
			{ title: "Highest Runs by Teams | Ghurki Cricket" },
			{ name: "description", content: "Highest team innings scores, totals, and run rates for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Highest runs by teams"
				headerRight={
					<div className="flex sm:justify-end">
						<OversFilter />
					</div>
				}
			>
				<HighestRunsTable />
			</PageLayout>
		);
	},
});

function HighestRunsTable() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.teams.highestRuns.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "score", desc: true }} />;
}
