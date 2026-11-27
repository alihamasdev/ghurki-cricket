import { teamRunsSchema } from "@ghurki-cricket/api/schema";
import { type TeamLowestDefendedStat } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { type ColumnDef } from "@/components/data-table";
import { EachTeamFilter } from "@/components/filters/each-team-filter";
import { OversFilter } from "@/components/filters/overs-filter";
import { StatsView } from "@/components/stats-view";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<TeamLowestDefendedStat>[] = [
	{ accessorKey: "team", header: "Team" },
	{ accessorKey: "target", header: "Target" },
	{ accessorKey: "score", header: "Score", sortFn: (rowA, rowB) => parseInt(rowA.original.score, 10) - parseInt(rowB.original.score, 10) },
	{ accessorKey: "overs", header: "Overs" },
	{ accessorKey: "potm", header: "POTM" },
	{ accessorKey: "date", header: "Date" },
];

export const Route = createFileRoute("/stats/teams/lowest-score-defended")({
	validateSearch: teamRunsSchema,
	head: () => ({
		meta: [
			{ title: "Lowest Score Defended | Ghurki Cricket" },
			{ name: "description", content: "Lowest scores defended by teams in Ghurki Cricket." },
		],
	}),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Lowest score defended"
				filters={[<EachTeamFilter key="each-team" />, <OversFilter key="overs" />]}
				queryOptions={trpc.teams.lowestDefended.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "target", desc: false }}
			/>
		);
	},
});
