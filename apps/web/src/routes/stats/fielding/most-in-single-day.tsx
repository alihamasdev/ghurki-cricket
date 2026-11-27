import { statSchema } from "@ghurki-cricket/api/schema";
import { type FieldingStats } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { StatsView } from "@/components/stats-view";
import { seo } from "@/lib/seo";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<FieldingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Innings" },
	{ accessorKey: "catches", header: "Catches" },
	{ accessorKey: "runOuts", header: "Run Outs" },
];

export const Route = createFileRoute("/stats/fielding/most-in-single-day")({
	validateSearch: statSchema.omit({ date: true }),
	head: () => seo("Most in Single Day Fielding", "Most in a single day fielding statistics for Ghurki Cricket."),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Most in single day"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" hasDates={false} />]}
				queryOptions={trpc.fielding.mostInSingleDay.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "catches", desc: true }}
			/>
		);
	},
});
