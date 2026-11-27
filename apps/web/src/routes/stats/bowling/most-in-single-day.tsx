import { statSchema } from "@ghurki-cricket/api/schema";
import { type OtherBowlingStats } from "@ghurki-cricket/api/types";
import { ballsToOvers } from "@ghurki-cricket/api/utils";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { StatsView } from "@/components/stats-view";
import { seo } from "@/lib/seo";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<OtherBowlingStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "innings", header: "Inns" },
	{ accessorKey: "balls", header: "Overs", cell: ({ row }) => ballsToOvers(row.original.balls) },
	{ accessorKey: "wickets", header: "Wkts" },
	{ accessorKey: "runs", header: "Runs" },
	{ accessorKey: "dots", header: "Dots" },
	{ accessorKey: "wides", header: "WDs" },
];

export const Route = createFileRoute("/stats/bowling/most-in-single-day")({
	validateSearch: statSchema.omit({ date: true }),
	head: () => seo("Most in Single Day Bowling", "Most in a single day bowling statistics for Ghurki Cricket."),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Most in single day"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" hasDates={false} />]}
				queryOptions={trpc.bowling.mostInSingleDay.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "wickets", desc: true }}
			/>
		);
	},
});
