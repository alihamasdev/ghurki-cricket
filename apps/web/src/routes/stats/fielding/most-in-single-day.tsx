import { statSchema } from "@ghurki-cricket/api/schema";
import { type FieldingStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { DataTable, type ColumnDef, DataTableError, DataTableLoader } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<FieldingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Innings" },
	{ accessorKey: "catches", header: "Catches" },
	{ accessorKey: "runOuts", header: "Run Outs" },
];

export const Route = createFileRoute("/stats/fielding/most-in-single-day")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Most in Single Day | Ghurki Cricket" },
			{ name: "description", content: "Most in a single day fielding statistics for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Most in single day"
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
	const { data, status, error } = useQuery(trpc.fielding.mostInSingleDay.queryOptions(search));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "catches", desc: true }} />;
}
