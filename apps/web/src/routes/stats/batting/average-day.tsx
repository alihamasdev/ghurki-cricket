import { statSchema } from "@ghurki-cricket/api/schema";
import { type OtherBattingStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<OtherBattingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Inns", cell: ({ row }) => row.original.innings?.toFixed(1) },
	{ accessorKey: "runs", header: "Runs", cell: ({ row }) => row.original.runs?.toFixed(1) },
	{ accessorKey: "balls", header: "Balls", cell: ({ row }) => row.original.balls?.toFixed(1) },
	{ accessorKey: "fours", header: "4s", cell: ({ row }) => row.original.fours?.toFixed(1) },
	{ accessorKey: "sixes", header: "6s", cell: ({ row }) => row.original.sixes?.toFixed(1) },
	{ accessorKey: "thirties", header: "30s", cell: ({ row }) => row.original.thirties?.toFixed(1) },
];

export const Route = createFileRoute("/stats/batting/average-day")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Average Day Stats | Ghurki Cricket" },
			{ name: "description", content: "Average day batting statistics for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Average Day Stats"
				headerRight={
					<div className="grid sm:flex sm:justify-end">
						<DateFilter />
					</div>
				}
			>
				<AverageRunsPerDayTable />
			</PageLayout>
		);
	},
});

function AverageRunsPerDayTable() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.batting.listAvgPerDay.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "runs", desc: true }} />;
}
