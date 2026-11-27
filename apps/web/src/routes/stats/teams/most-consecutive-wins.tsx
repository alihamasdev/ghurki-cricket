import { type TeamConsecutiveWinsStat } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { type ColumnDef } from "@/components/data-table";
import { StatsView } from "@/components/stats-view";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<TeamConsecutiveWinsStat>[] = [
	{ accessorKey: "team", header: "Team" },
	{ accessorKey: "wins", header: "Wins" },
];

export const Route = createFileRoute("/stats/teams/most-consecutive-wins")({
	head: () => ({
		meta: [
			{ title: "Most Consecutive Wins | Ghurki Cricket" },
			{ name: "description", content: "Longest consecutive match winning streaks by teams for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<StatsView
				title="Most consecutive wins"
				queryOptions={trpc.teams.consecutiveWins.queryOptions()}
				columns={columns}
				defaultSort={{ id: "wins", desc: true }}
			/>
		);
	},
});
