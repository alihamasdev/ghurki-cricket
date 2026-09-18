import { bowlingStatSchema } from "@ghurki-cricket/api/schema";
import { type BowlingStats } from "@ghurki-cricket/api/types";
import { ballsToOvers } from "@ghurki-cricket/api/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";

import { PlayerCell } from "@/components/avatar";
import { DataTable } from "@/components/data-table";
import { DateFilter } from "@/components/date-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<BowlingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Inns" },
	{ accessorKey: "balls", header: "Overs", cell: ({ row }) => ballsToOvers(row.original.balls!) },
	{ accessorKey: "wickets", header: "Wkts" },
	{ accessorKey: "runs", header: "Runs" },
	{ accessorKey: "economy", header: "Eco", cell: ({ row }) => row.original.economy?.toFixed(2) || "-" },
	{ accessorKey: "average", header: "Avg", cell: ({ row }) => row.original.average?.toFixed(2) || "-" },
	{ accessorKey: "dots", header: "Dots" },
	{ accessorKey: "wides", header: "WDs" },
	{ accessorKey: "noBalls", header: "NBs" },
	{ accessorKey: "twoFR", header: "2fer" },
	{ accessorKey: "threeFR", header: "3fer" },
];

export const Route = createFileRoute("/stats/bowling")({
	validateSearch: bowlingStatSchema,
	component: () => {
		return (
			<PageLayout
				title="Bowling Stats"
				headerRight={
					<div className="flex sm:justify-end">
						<DateFilter />
					</div>
				}
			>
				<BowlingRoute />
			</PageLayout>
		);
	},
});

function BowlingRoute() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.bowling.list.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} />;
}
