import { teamRunsSchema } from "@ghurki-cricket/api/schema";
import { type TeamInningStat } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { type ColumnDef } from "@/components/data-table";
import { EachTeamFilter } from "@/components/filters/each-team-filter";
import { OversFilter } from "@/components/filters/overs-filter";
import { StatsView } from "@/components/stats-view";
import { seo } from "@/lib/seo";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<TeamInningStat>[] = [
	{ accessorKey: "team", header: "Team" },
	{ accessorKey: "score", header: "Score", sortFn: (rowA, rowB) => parseInt(rowA.original.score, 10) - parseInt(rowB.original.score, 10) },
	{ accessorKey: "overs", header: "Overs" },
	{ accessorKey: "runRate", header: "RR" },
	{ accessorKey: "date", header: "Date" },
];

export const Route = createFileRoute("/stats/teams/highest-runs")({
	validateSearch: teamRunsSchema,
	head: () => seo("Highest Runs by Teams", "Highest team innings scores, totals, and run rates for Ghurki Cricket."),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Highest runs by teams in inning"
				filters={[<EachTeamFilter key="each-team" />, <OversFilter key="overs" />]}
				queryOptions={trpc.teams.highestRuns.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "score", desc: true }}
			/>
		);
	},
});
