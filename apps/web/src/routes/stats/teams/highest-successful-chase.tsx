import { teamRunsSchema } from "@ghurki-cricket/api/schema";
import { type TeamHighestChaseStat } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { type ColumnDef } from "@/components/data-table";
import { EachTeamFilter } from "@/components/filters/each-team-filter";
import { OversFilter } from "@/components/filters/overs-filter";
import { StatsView } from "@/components/stats-view";
import { seo } from "@/lib/seo";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<TeamHighestChaseStat>[] = [
	{ accessorKey: "team", header: "Team" },
	{ accessorKey: "target", header: "Target" },
	{ accessorKey: "score", header: "Score", sortFn: (rowA, rowB) => parseInt(rowA.original.score, 10) - parseInt(rowB.original.score, 10) },
	{ accessorKey: "overs", header: "Overs" },
	{ accessorKey: "potm", header: "POTM" },
	{ accessorKey: "date", header: "Date" },
];

export const Route = createFileRoute("/stats/teams/highest-successful-chase")({
	validateSearch: teamRunsSchema,
	head: () => seo("Highest Successful Chase", "Highest successful run chases by teams in Ghurki Cricket."),
	component: () => {
		const search = Route.useSearch();

		return (
			<StatsView
				title="Highest successful chase"
				filters={[<EachTeamFilter key="each-team" />, <OversFilter key="overs" />]}
				queryOptions={trpc.teams.highestChases.queryOptions(search)}
				columns={columns}
				defaultSort={{ id: "target", desc: true }}
			/>
		);
	},
});
