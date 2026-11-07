import { comparePlayerSchema } from "@ghurki-cricket/api/schema";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DateFilter } from "@/components/filters/date-filter";
import { PlayerFilter } from "@/components/filters/player-filter";
import { ImageCapture } from "@/components/image-capture";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/compare/players")({
	validateSearch: comparePlayerSchema,
	head: () => ({
		meta: [
			{ title: "Player vs Player | Ghurki Cricket" },
			{ name: "description", content: "Head-to-head comparison and statistics between cricket players." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Player vs Player"
				headerRight={
					<div className="flex gap-2 sm:justify-end">
						<PlayerFilter param="player1" label="Player 1" />
						<PlayerFilter param="player2" label="Player 2" />
						<DateFilter hasPeriods={false} hasCalendar={false} />
					</div>
				}
			>
				<PlayerCompareRoute />
			</PageLayout>
		);
	},
});

function PlayerCompareRoute() {
	const search = Route.useSearch();

	const isBothSelected = Boolean(search.player1 && search.player2 && search.player1 !== search.player2);

	const { data, status, error } = useQuery({
		...trpc.players.compare.queryOptions(search),
		enabled: isBothSelected,
	});

	if (!isBothSelected) {
		return (
			<ImageCapture width={40}>
				<div className="overflow-hidden rounded-md border">
					<Table>
						<TableBody>
							<TableRow>
								<TableCell className="h-50 text-center first:text-center">Select both players to compare</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
			</ImageCapture>
		);
	}

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	if (!data || !data.player1 || !data.player2) {
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

	const p1Bat = data.p1BattingVsP2Bowling;
	const p2Bat = data.p2BattingVsP1Bowling;

	const rows = [
		{ label: "Runs Scored", val1: p1Bat.runs, val2: p2Bat.runs },
		{ label: "Balls Faced", val1: p1Bat.balls, val2: p2Bat.balls },
		{ label: "Strike Rate", val1: p1Bat.balls ? p1Bat.strikeRate : "0.00", val2: p2Bat.balls ? p2Bat.strikeRate : "0.00" },
		{
			label: "Batting Average",
			val1: p1Bat.average !== null ? p1Bat.average : p1Bat.runs > 0 ? p1Bat.runs : "0",
			val2: p2Bat.average !== null ? p2Bat.average : p2Bat.runs > 0 ? p2Bat.runs : "0",
		},
		{ label: "Fours Hit", val1: p1Bat.fours, val2: p2Bat.fours },
		{ label: "Sixes Hit", val1: p1Bat.sixes, val2: p2Bat.sixes },
		{ label: "Dot Balls Faced", val1: p1Bat.dots, val2: p2Bat.dots },
		{ label: "Dot Percentage", val1: `${p1Bat.dotPercentage}%`, val2: `${p2Bat.dotPercentage}%` },
		{ label: "Times Dismissed", val1: p1Bat.wickets, val2: p2Bat.wickets },
	];

	return (
		<ImageCapture width={40}>
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Stats</TableHead>
							<TableHead>{data.player1.name}</TableHead>
							<TableHead>{data.player2.name}</TableHead>
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
