import { statSchema } from "@ghurki-cricket/api/schema";
import { type OtherBowlingStats } from "@ghurki-cricket/api/types";
import { ballsToOvers } from "@ghurki-cricket/api/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<OtherBowlingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Inns" },
	{ accessorKey: "balls", header: "Overs", cell: ({ row }) => ballsToOvers(row.original.balls) },
	{ accessorKey: "wickets", header: "Wkts" },
	{ accessorKey: "runs", header: "Runs" },
	{ accessorKey: "dots", header: "Dots" },
	{ accessorKey: "wides", header: "WDs" },
	{ accessorKey: "twoFR", header: "2fer" },
];

export const Route = createFileRoute("/stats/bowling/most-in-single-day")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Most in Single Day | Ghurki Cricket" },
			{ name: "description", content: "Most in a single day bowling statistics for Ghurki Cricket." },
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
	const { data, status, error } = useQuery(trpc.bowling.mostInSingleDay.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "wickets", desc: true }} />;
}
