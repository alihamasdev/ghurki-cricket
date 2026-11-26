import { statSchema } from "@ghurki-cricket/api/schema";
import { type OtherBowlingStats } from "@ghurki-cricket/api/types";
import { ballsToOvers } from "@ghurki-cricket/api/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { DataTable, type ColumnDef, DataTableError, DataTableLoader } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<OtherBowlingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Inns", cell: ({ row }) => row.original.innings?.toFixed(1) },
	{ accessorKey: "balls", header: "Overs", cell: ({ row }) => ballsToOvers(Math.round(row.original.balls)) },
	{ accessorKey: "wickets", header: "Wkts", cell: ({ row }) => row.original.wickets?.toFixed(1) },
	{ accessorKey: "runs", header: "Runs", cell: ({ row }) => row.original.runs?.toFixed(1) },
	{ accessorKey: "dots", header: "Dots", cell: ({ row }) => row.original.dots?.toFixed(1) },
	{ accessorKey: "wides", header: "WDs", cell: ({ row }) => row.original.wides?.toFixed(1) },
];

export const Route = createFileRoute("/stats/bowling/average-day")({
	validateSearch: statSchema.omit({ date: true }),
	head: () => ({
		meta: [
			{ title: "Average Day Stats | Ghurki Cricket" },
			{ name: "description", content: "Average day bowling statistics for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Average Day Stats"
				headerRight={
					<div className="flex flex-wrap items-center gap-2 sm:justify-end">
						<GroupFilter />
						<DateFilter hasDates={false} />
					</div>
				}
			>
				<AverageBowlingDayTable />
			</PageLayout>
		);
	},
});

function AverageBowlingDayTable() {
	const { group, rivalry, starts, ends } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.bowling.listAvgPerDay.queryOptions({ group, rivalry, starts, ends }));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "wickets", desc: true }} />;
}
