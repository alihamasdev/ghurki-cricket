import { statSchema } from "@ghurki-cricket/api/schema";
import { type FieldingStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { DataTable, type ColumnDef, DataTableError, DataTableLoader } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<FieldingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Innings", cell: ({ row }) => row.original.innings?.toFixed(2) },
	{ accessorKey: "catches", header: "Catches", cell: ({ row }) => row.original.catches?.toFixed(2) },
	{ accessorKey: "runOuts", header: "Run Outs", cell: ({ row }) => row.original.runOuts?.toFixed(2) },
];

export const Route = createFileRoute("/stats/fielding/average-day")({
	validateSearch: statSchema.omit({ date: true }),
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
					<div className="flex flex-wrap items-center gap-2 sm:justify-end">
						<GroupFilter />
						<DateFilter hasDates={false} />
					</div>
				}
			>
				<AverageFieldingDayTable />
			</PageLayout>
		);
	},
});

function AverageFieldingDayTable() {
	const { group, rivalry, starts, ends } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.fielding.listAvgPerDay.queryOptions({ group, rivalry, starts, ends }));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "catches", desc: true }} />;
}
