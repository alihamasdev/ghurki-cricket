import { statSchema } from "@ghurki-cricket/api/schema";
import { type BowlingStats } from "@ghurki-cricket/api/types";
import { ballsToOvers } from "@ghurki-cricket/api/utils";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { StatsView } from "@/components/stats-view";
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

export const Route = createFileRoute("/stats/bowling/")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Bowling Stats | Ghurki Cricket" },
			{ name: "description", content: "Bowling leaderboards, overs, wickets, economy, and bowling averages for Ghurki Cricket." },
		],
	}),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Bowling Stats"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" />]}
				queryOptions={trpc.bowling.list.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "wickets", desc: true }}
			/>
		);
	},
});
