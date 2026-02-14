import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

import { DataTable } from "@/components/data-table";
import { validateDate } from "@/components/date-filter";
import { PlayerAvatarCell } from "@/components/players/avatar";
import { TabsLayout } from "@/components/tabs-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { db } from "@/lib/db";
import { type BowlingStats } from "@/lib/types";
import { ballsToOvers } from "@/lib/utils";

const bowlingFilters = [
	"most-wickets",
	"most-runs-conceded",
	"best-economy",
	"best-average",
	"most-dots",
	"most-wides",
	"most-no-balls",
	"most-2fr",
	"most-3fr",
] as const;

type BowlingFilter = (typeof bowlingFilters)[number];

const getBowlingStats = createServerFn({ method: "GET" })
	.inputValidator(validateDate)
	.handler(async ({ data }): Promise<BowlingStats[]> => {
		const stats = await db.bowlers.groupBy({
			by: ["playerId"],
			where: { date: data },
			orderBy: { _sum: { wickets: "desc" } },
			_sum: {
				innings: true,
				runs: true,
				balls: true,
				wickets: true,
				dots: true,
				wides: true,
				noBalls: true,
				twoFR: true,
				threeFR: true,
			},
		});
		return stats.map(({ playerId, _sum }) => ({
			player: playerId,
			innings: _sum.innings,
			runs: _sum.runs,
			balls: _sum.balls,
			wickets: _sum.wickets,
			economy: _sum.balls ? _sum.runs / _sum.balls : 0,
			average: _sum.wickets ? _sum.runs / _sum.wickets : Infinity,
			dots: _sum.dots,
			wides: _sum.wides,
			no_balls: _sum.noBalls,
			"2fr": _sum.twoFR,
			"3fr": _sum.threeFR,
		}));
	});

const bowlingColumns: Record<keyof BowlingStats, ColumnDef<BowlingStats>> = {
	player: { accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerAvatarCell name={row.original.player} /> },
	innings: { accessorKey: "innings", header: "Inns" },
	balls: { accessorKey: "balls", header: "Overs", cell: ({ row }) => Number(ballsToOvers(row.original.balls)) },
	runs: { accessorKey: "runs", header: "Runs" },
	wickets: { accessorKey: "wickets", header: "Wkts" },
	economy: { accessorKey: "economy", header: "Eco", cell: ({ row }) => (row.original.economy * 6).toFixed(1) },
	average: {
		accessorKey: "average",
		header: "Avg",
		cell: ({ row }) => (row.original.average === Infinity ? "-" : row.original.average.toFixed(1)),
	},
	dots: { accessorKey: "dots", header: "Dots" },
	wides: { accessorKey: "wides", header: "WDs" },
	no_balls: { accessorKey: "no_balls", header: "NBs" },
	"2fr": { accessorKey: "2fr", header: "2fr" },
	"3fr": { accessorKey: "3fr", header: "3fr" },
};

const filterColumns: Record<BowlingFilter, (keyof BowlingStats)[]> = {
	"most-wickets": ["player", "balls", "wickets"],
	"most-runs-conceded": ["player", "balls", "runs"],
	"best-economy": ["player", "runs", "balls", "economy"],
	"best-average": ["player", "runs", "wickets", "average"],
	"most-dots": ["player", "balls", "dots"],
	"most-wides": ["player", "balls", "wides"],
	"most-no-balls": ["player", "balls", "no_balls"],
	"most-2fr": ["player", "innings", "2fr"],
	"most-3fr": ["player", "innings", "3fr"],
};

const getBowlingColumns = (): ColumnDef<BowlingStats>[] => {
	const isMobile = useIsMobile();
	const { filter } = Route.useSearch();

	if (filter && filter in filterColumns) {
		return filterColumns[filter].map((col) => (typeof col === "string" ? bowlingColumns[col] : col));
	}

	if (isMobile) {
		return (["player", "innings", "balls", "runs", "wickets", "economy", "average"] as const).map((k) => bowlingColumns[k]);
	}

	return (
		["player", "innings", "balls", "runs", "wickets", "economy", "average", "dots", "wides", "no_balls", "2fr", "3fr"] as const
	).map((k) => bowlingColumns[k]);
};

export const Route = createFileRoute("/_stats/stats/bowling")({
	head: () => ({ meta: [{ title: "Bowling Stats" }] }),
	validateSearch: z.object({ filter: z.enum(bowlingFilters).optional().catch(undefined) }),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) =>
		await context.queryClient.ensureQueryData({
			queryKey: ["bowling-stats", deps.date ?? deps.rivalry ?? "all-time"],
			queryFn: () => getBowlingStats({ data: deps }),
		}),
	component: () => {
		const data = Route.useLoaderData();
		return (
			<TabsLayout title="Bowling Stats" filters={{ stats: { options: bowlingFilters } }}>
				<DataTable columns={getBowlingColumns()} data={data} />
			</TabsLayout>
		);
	},
});
