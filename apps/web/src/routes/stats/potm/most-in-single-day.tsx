import { groupSchema } from "@ghurki-cricket/api/schema";
import { type POTMStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { DataTable, type ColumnDef, DataTableError, DataTableLoader } from "@/components/data-table";
import { GroupFilter } from "@/components/filters/group-filter";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<POTMStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "potm", header: "Player of Match" },
];

export const Route = createFileRoute("/stats/potm/most-in-single-day")({
	validateSearch: groupSchema,
	head: () => ({
		meta: [
			{ title: "Most in Single Day | Ghurki Cricket" },
			{ name: "description", content: "Most in a single day Player of the Match statistics for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Most in single day"
				headerRight={
					<div className="flex sm:justify-end">
						<GroupFilter />
					</div>
				}
			>
				<MostInSingleDayPOTMTable />
			</PageLayout>
		);
	},
});

function MostInSingleDayPOTMTable() {
	const { group } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.potm.mostInSingleDay.queryOptions({ group }));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "potm", desc: true }} />;
}
