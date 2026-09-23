import { statSchema } from "@ghurki-cricket/api/schema";
import { type POTMStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";

import { PlayerCell } from "@/components/avatar";
import { DataTable } from "@/components/data-table";
import { DateFilter } from "@/components/date-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<POTMStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "potm", header: "Player of Match" },
];

export const Route = createFileRoute("/stats/potm")({
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
					<div className="flex sm:justify-end">
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
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.potm.list.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} />;
}
