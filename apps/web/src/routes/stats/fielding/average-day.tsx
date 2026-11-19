import { statSchema } from "@ghurki-cricket/api/schema";
import { type FieldingAverageDayStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<FieldingAverageDayStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Innings", cell: ({ row }) => row.original.innings?.toFixed(1) },
	{ accessorKey: "catches", header: "Catches", cell: ({ row }) => row.original.catches?.toFixed(1) },
	{ accessorKey: "runOuts", header: "Run Outs", cell: ({ row }) => row.original.runOuts?.toFixed(1) },
];

export const Route = createFileRoute("/stats/fielding/average-day")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Average Day Stats | Ghurki Cricket" },
			{ name: "description", content: "Average day fielding statistics for Ghurki Cricket." },
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
				<AverageFieldingDayTable />
			</PageLayout>
		);
	},
});

function AverageFieldingDayTable() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.fielding.listAvgPerDay.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "catches", desc: true }} />;
}
