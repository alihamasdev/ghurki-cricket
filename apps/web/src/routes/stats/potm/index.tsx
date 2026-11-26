import { statSchema } from "@ghurki-cricket/api/schema";
import { type POTMStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { DataTable, type ColumnDef, DataTableError, DataTableLoader } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<POTMStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "potm", header: "Player of Match" },
];

export const Route = createFileRoute("/stats/potm/")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Player of the Match Stats | Ghurki Cricket" },
			{ name: "description", content: "Player of the Match (POTM) awards tally and leaderboards for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Player of the Match Stats"
				headerRight={
					<div className="flex flex-wrap items-center gap-2 sm:justify-end">
						<GroupFilter />
						<DateFilter />
					</div>
				}
			>
				<POTMRoute />
			</PageLayout>
		);
	},
});

function POTMRoute() {
	const { group, rivalry, starts, ends, date } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.potm.list.queryOptions({ group, rivalry, starts, ends, date }));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} />;
}
