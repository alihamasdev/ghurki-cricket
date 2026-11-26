import { statSchema } from "@ghurki-cricket/api/schema";
import { type OtherBattingStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { DataTable, type ColumnDef, DataTableError, DataTableLoader } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<OtherBattingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Inns" },
	{ accessorKey: "runs", header: "Runs" },
	{ accessorKey: "balls", header: "Balls" },
	{ accessorKey: "fours", header: "4s" },
	{ accessorKey: "sixes", header: "6s" },
];

export const Route = createFileRoute("/stats/batting/most-in-single-day")({
	validateSearch: statSchema.omit({ date: true }),
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
					<div className="flex flex-wrap items-center gap-2 sm:justify-end">
						<GroupFilter />
						<DateFilter hasDates={false} />
					</div>
				}
			>
				<MostInSingleDayTable />
			</PageLayout>
		);
	},
});

function MostInSingleDayTable() {
	const { group, rivalry, starts, ends } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.batting.mostInSingleDay.queryOptions({ group, rivalry, starts, ends }));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "runs", desc: true }} />;
}
