import { comparePlayerSchema } from "@ghurki-cricket/api/schema";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { DataTableLoader, DataTableError } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { PlayerFilter } from "@/components/filters/player-filter";
import { ImageCapture } from "@/components/image-capture";
import { PageLayout } from "@/components/page-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { seo } from "@/lib/seo";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/compare/players")({
	validateSearch: comparePlayerSchema,
	beforeLoad: async ({ context, search }) => {
		if (!search.player1 || !search.player2 || search.player1 === search.player2) {
			const players = await context.queryClient.query(context.trpc.players.list.queryOptions({ group: "core" }));

			if (players && players.length >= 2) {
				let p1 = search.player1;
				let p2 = search.player2;

				if (!p1 && !p2) {
					const idx1 = Math.floor(Math.random() * players.length);
					let idx2 = Math.floor(Math.random() * (players.length - 1));

					if (idx2 >= idx1) idx2++;
					p1 = players[idx1].name;
					p2 = players[idx2].name;
				} else if (!p1 && p2) {
					const remaining = players.filter((p) => p.name !== p2);
					p1 = remaining[Math.floor(Math.random() * remaining.length)]?.name;
				} else if (p1 && !p2) {
					const remaining = players.filter((p) => p.name !== p1);
					p2 = remaining[Math.floor(Math.random() * remaining.length)]?.name;
				} else if (p1 === p2) {
					const remaining = players.filter((p) => p.name !== p1);
					p2 = remaining[Math.floor(Math.random() * remaining.length)]?.name;
				}

				if (p1 && p2 && p1 !== p2) {
					throw redirect({ to: "/compare/players", replace: true, search: { ...search, player1: p1, player2: p2 } });
				}
			}
		}
	},
	head: () => seo("Player vs Player", "Head-to-head comparison and statistics between cricket players."),
	component: () => {
		return (
			<PageLayout
				title="Player vs Player"
				headerRight={
					<div className="flex gap-2 sm:justify-end">
						<PlayerFilter param="player1" label="Player 1" />
						<PlayerFilter param="player2" label="Player 2" />
						<DateFilter hasYears={false} hasDates={false} />
					</div>
				}
			>
				<PlayerCompareRoute />
			</PageLayout>
		);
	},
});

function PlayerCompareRoute() {
	const { player1, player2, rivalry } = Route.useSearch();

	const isBothSelected = Boolean(player1 && player2 && player1 !== player2);

	const { data, status, error } = useQuery({
		...trpc.players.compare.queryOptions({ player1, player2, rivalry }),
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
		return <DataTableLoader className="h-85" />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} className="h-85" />;
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
