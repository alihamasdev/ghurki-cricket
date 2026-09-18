import { fieldingStatSchema } from "@ghurki-cricket/api/schema";
import { type FieldingStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";

import { PlayerCell } from "@/components/avatar";
import { DataTable } from "@/components/data-table";
import { DateFilter } from "@/components/date-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<FieldingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Innings" },
	{ accessorKey: "catches", header: "Catches" },
	{ accessorKey: "runOuts", header: "Run Outs" },
];

export const Route = createFileRoute("/stats/fielding")({
	validateSearch: fieldingStatSchema,
	component: () => {
		return (
			<PageLayout
				title="Fielding Stats"
				headerRight={
					<div className="flex sm:justify-end">
						<DateFilter />
					</div>
				}
			>
				<FieldingRoute />
			</PageLayout>
		);
	},
});

function FieldingRoute() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.fielding.list.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} />;
}
