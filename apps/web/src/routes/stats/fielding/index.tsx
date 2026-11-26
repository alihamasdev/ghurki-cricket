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
	{ accessorKey: "innings", header: "Innings" },
	{ accessorKey: "catches", header: "Catches" },
	{ accessorKey: "runOuts", header: "Run Outs" },
];

export const Route = createFileRoute("/stats/fielding/")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Fielding Stats | Ghurki Cricket" },
			{ name: "description", content: "Fielding statistics including catches and run-outs for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Fielding Stats"
				headerRight={
					<div className="flex flex-wrap items-center gap-2 sm:justify-end">
						<GroupFilter />
						<DateFilter />
					</div>
				}
			>
				<FieldingTable />
			</PageLayout>
		);
	},
});

function FieldingTable() {
	const { group, rivalry, starts, ends, date } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.fielding.list.queryOptions({ group, rivalry, starts, ends, date }));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "catches", desc: true }} />;
}
