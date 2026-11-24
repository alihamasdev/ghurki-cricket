import { overSchema } from "@ghurki-cricket/api/schema";
import { type TeamConsecutiveWinsStat } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DataTable, type ColumnDef, DataTableLoader, DataTableError } from "@/components/data-table";
import { OversFilter } from "@/components/filters/overs-filter";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<TeamConsecutiveWinsStat>[] = [
	{ accessorKey: "team", header: "Team" },
	{ accessorKey: "wins", header: "Wins" },
];

export const Route = createFileRoute("/compare/teams/most-consecutive-wins")({
	validateSearch: overSchema,
	head: () => ({
		meta: [
			{ title: "Most Consecutive Wins | Ghurki Cricket" },
			{ name: "description", content: "Longest consecutive match winning streaks by teams for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Most consecutive wins"
				headerRight={
					<div className="flex sm:justify-end">
						<OversFilter />
					</div>
				}
			>
				<ConsecutiveWinsTable />
			</PageLayout>
		);
	},
});

function ConsecutiveWinsTable() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.teams.consecutiveWins.queryOptions(search));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "wins", desc: true }} />;
}
