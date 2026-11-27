import { statSchema } from "@ghurki-cricket/api/schema";
import { type POTMStats } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { StatsView } from "@/components/stats-view";
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
		const search = Route.useSearch();

		return (
			<StatsView
				title="Player of the Match Stats"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" />]}
				queryOptions={trpc.potm.list.queryOptions(search)}
				columns={columns}
			/>
		);
	},
});
