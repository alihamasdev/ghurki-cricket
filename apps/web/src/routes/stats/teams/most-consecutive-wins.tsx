import { type TeamConsecutiveWinsStat } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DataTable, type ColumnDef, DataTableLoader, DataTableError } from "@/components/data-table";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<TeamConsecutiveWinsStat>[] = [
	{ accessorKey: "team", header: "Team" },
	{ accessorKey: "wins", header: "Wins" },
];

export const Route = createFileRoute("/stats/teams/most-consecutive-wins")({
	head: () => ({
		meta: [
			{ title: "Most Consecutive Wins | Ghurki Cricket" },
			{ name: "description", content: "Longest consecutive match winning streaks by teams for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout title="Most consecutive wins">
				<ConsecutiveWinsTable />
			</PageLayout>
		);
	},
});

function ConsecutiveWinsTable() {
	const { data, status, error } = useQuery(trpc.teams.consecutiveWins.queryOptions());

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "wins", desc: true }} />;
}
