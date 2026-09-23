import { dateSchema } from "@ghurki-cricket/api/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ghurki-cricket/ui/components/table";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DateFilter } from "@/components/date-filter";
import { ImageCapture } from "@/components/image-capture";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/compare/teams")({
	validateSearch: dateSchema,
	head: () => ({
		meta: [
			{ title: "Team vs Team | Ghurki Cricket" },
			{ name: "description", content: "Head-to-head comparison and statistics between cricket teams." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Team vs Team"
				headerRight={
					<div className="flex sm:justify-end">
						<DateFilter hasAllTime={false} hasPeriods={false} />
					</div>
				}
			>
				<TeamCompareRoute />
			</PageLayout>
		);
	},
});

function TeamCompareRoute() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.teams.compare.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	const team1 = data?.[0];
	const team2 = data?.[1];

	const rows = [
		{ label: "Matches Played", val1: team1?.matchesPlayed ?? 0, val2: team2?.matchesPlayed ?? 0 },
		{ label: "Matches Won", val1: team1?.matchesWon ?? 0, val2: team2?.matchesWon ?? 0 },
		{ label: "Win Percentage", val1: `${team1?.winPercentage}%`, val2: `${team2?.winPercentage}%` },
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
