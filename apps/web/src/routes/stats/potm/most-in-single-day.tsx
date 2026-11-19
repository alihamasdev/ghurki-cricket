import { statSchema } from "@ghurki-cricket/api/schema";
import { type POTMMostInSingleDayStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<POTMMostInSingleDayStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "potm", header: "Player of Match" },
];

export const Route = createFileRoute("/stats/potm/most-in-single-day")({
	validateSearch: statSchema,
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
					<div className="grid sm:flex sm:justify-end">
						<DateFilter />
					</div>
				}
			>
				<MostInSingleDayPOTMTable />
			</PageLayout>
		);
	},
});

function MostInSingleDayPOTMTable() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.potm.mostInSingleDay.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} defaultSort={{ id: "potm", desc: true }} />;
}
