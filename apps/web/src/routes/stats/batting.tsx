import { battingStatSchema } from "@ghurki-cricket/api/schema";
import { type BattingStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";

import { PlayerCell } from "@/components/avatar";
import { DataTable } from "@/components/data-table";
import { DateFilter } from "@/components/date-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<BattingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Inns" },
	{ accessorKey: "runs", header: "Runs" },
	{ accessorKey: "balls", header: "Balls" },
	{ accessorKey: "notOuts", header: "NO" },
	{ accessorKey: "strikeRate", header: "SR", cell: ({ row }) => row.original.strikeRate?.toFixed() },
	{ accessorKey: "average", header: "Avg", cell: ({ row }) => row.original.average?.toFixed(1) },
	{ accessorKey: "highestScore", header: "HS" },
	{ accessorKey: "fours", header: "4s" },
	{ accessorKey: "sixes", header: "6s" },
	{ accessorKey: "ducks", header: "0s" },
	{ accessorKey: "thirties", header: "30s" },
	{ accessorKey: "fifties", header: "50s" },
];

export const Route = createFileRoute("/stats/batting")({
	validateSearch: battingStatSchema,
	component: () => {
		return (
			<PageLayout
				title="Batting Stats"
				headerRight={
					<div className="flex sm:justify-end">
						<DateFilter />
					</div>
				}
			>
				<BattingRoute />
			</PageLayout>
		);
	},
});

function BattingRoute() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.batting.list.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} />;
}
