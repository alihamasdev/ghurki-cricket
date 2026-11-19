import { statSchema } from "@ghurki-cricket/api/schema";
import { type MostInSingleDayStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<MostInSingleDayStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Inns" },
	{ accessorKey: "runs", header: "Runs" },
	{ accessorKey: "balls", header: "Balls" },
	{ accessorKey: "fours", header: "4s" },
	{ accessorKey: "sixes", header: "6s" },
	{ accessorKey: "thirties", header: "30s" },
];

export const Route = createFileRoute("/stats/batting/most-in-single-day")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Most in Single Day Stats | Ghurki Cricket" },
			{ name: "description", content: "Most in a single day batting statistics for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Most in Single Day Stats"
				headerRight={
					<div className="grid sm:flex sm:justify-end">
						<DateFilter />
					</div>
				}
			>
				<MostInSingleDayTable />
			</PageLayout>
		);
	},
});

function MostInSingleDayTable() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.batting.mostInSingleDay.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "runs", desc: true }} />;
}
