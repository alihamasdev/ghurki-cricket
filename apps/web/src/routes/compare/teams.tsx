import { compareTeamSchema } from "@ghurki-cricket/api/schema";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { DataTableError, DataTableLoader } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { OversFilter } from "@/components/filters/overs-filter";
import { ImageCapture } from "@/components/image-capture";
import { PageLayout } from "@/components/page-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { seo } from "@/lib/seo";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/compare/teams")({
	validateSearch: compareTeamSchema,
	beforeLoad: async ({ context, search }) => {
		if (!search.rivalry && !search.date) {
			const rivalries = await context.queryClient.query(context.trpc.filters.listRivalries.queryOptions());
			const latestRivalry = rivalries?.[0]?.name;

			if (latestRivalry) {
				throw redirect({ to: "/compare/teams", replace: true, search: { ...search, rivalry: latestRivalry } });
			}
		}
	},
	head: () => seo("Team vs Team", "Head-to-head comparison and statistics between cricket teams."),
	component: () => {
		return (
			<PageLayout
				title="Team vs Team"
				headerRight={
					<div className="flex gap-2 sm:justify-end">
						<OversFilter />
						<DateFilter hasAllTime={false} hasYears={false} />
					</div>
				}
			>
				<TeamCompareRoute />
			</PageLayout>
		);
	},
});

function TeamCompareRoute() {
	const { overs, rivalry, date } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.teams.compare.queryOptions({ overs, rivalry, date }));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	if (!data || data.length < 2) {
		return (
			<ImageCapture width={40}>
				<div className="overflow-hidden rounded-md border">
					<Table>
						<TableBody>
							<TableRow>
								<TableCell className="h-50 text-center first:text-center">No results found</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
			</ImageCapture>
		);
	}

	const team1 = data[0];
	const team2 = data[1];

	const rows = [
		...(!date && !overs
			? [{ label: "Series Won", val1: team1?.seriesWon ?? 0, val2: team2?.seriesWon ?? 0 }]
			: [{ label: "Matches Played", val1: team1?.matchesPlayed ?? 0, val2: team2?.matchesPlayed ?? 0 }]),
		{ label: "Matches Won", val1: team1?.matchesWon ?? 0, val2: team2?.matchesWon ?? 0 },
		{ label: "Win Percentage", val1: `${team1?.winPercentage ?? 0}%`, val2: `${team2?.winPercentage ?? 0}%` },
		{ label: "Total Runs Scored", val1: team1?.totalRuns ?? 0, val2: team2?.totalRuns ?? 0 },
		{ label: "Total Balls Played", val1: team1?.totalBalls ?? 0, val2: team2?.totalBalls ?? 0 },
		{ label: "Total Wickets Fallen", val1: team1?.totalWickets ?? 0, val2: team2?.totalWickets ?? 0 },
		{ label: "Strike Rate", val1: team1?.strikeRate ?? "0.00", val2: team2?.strikeRate ?? "0.00" },
		{ label: "Team All-Out", val1: team1?.teamAllOut ?? 0, val2: team2?.teamAllOut ?? 0 },
		{ label: "Highest Score", val1: team1?.highestScore ?? "-", val2: team2?.highestScore ?? "-" },
		{ label: "Lowest Score", val1: team1?.lowestScore ?? "-", val2: team2?.lowestScore ?? "-" },
	];

	return (
		<ImageCapture width={40}>
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Stats</TableHead>
							{data.map((val) => (
								<TableHead key={val.team}>{val.team}</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((row) => (
							<TableRow key={row.label}>
								<TableCell>{row.label}</TableCell>
								<TableCell>{row.val1}</TableCell>
								<TableCell>{row.val2}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</ImageCapture>
	);
}
