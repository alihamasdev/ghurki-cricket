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
import { type BattingStats } from "@/lib/types";

const battingFilters = [
	"most-runs",
	"best-strike-rate",
	"best-average",
	"most-not-outs",
	"highest-score",
	"most-fours",
	"most-sixes",
	"most-ducks",
	"most-fifties",
	"most-hundreds",
] as const;

type BattingFilter = (typeof battingFilters)[number];

const getBattingStats = createServerFn({ method: "GET" })
	.inputValidator(validateDate)
	.handler(async ({ data }): Promise<BattingStats[]> => {
		const stats = await db.batters.groupBy({
			by: ["playerId"],
			where: { date: data },
			orderBy: { _sum: { runs: "desc" } },
			_max: { highestScore: true },
			_sum: {
				innings: true,
				runs: true,
				balls: true,
				notOuts: true,
				fours: true,
				sixes: true,
				ducks: true,
				fifties: true,
				hundreds: true,
			},
		});
		return stats.map(({ playerId, _sum, _max }) => ({
			player: playerId,
			innings: _sum.innings,
			runs: _sum.runs,
			balls: _sum.balls,
			not_outs: _sum.notOuts,
			highest_score: _max.highestScore,
			strike_rate: _sum.balls ? (_sum.runs / _sum.balls) * 100 : 0,
			average: _sum.innings - _sum.notOuts ? _sum.runs / (_sum.innings - _sum.notOuts) : 0,
			fours: _sum.fours,
			sixes: _sum.sixes,
			ducks: _sum.ducks,
			fifties: _sum.fifties,
			hundreds: _sum.hundreds,
		}));
	});

const battingColumns: Record<keyof BattingStats, ColumnDef<BattingStats>> = {
	player: { accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerAvatarCell name={row.original.player} /> },
	innings: { accessorKey: "innings", header: "Inns" },
	runs: { accessorKey: "runs", header: "Runs" },
	balls: { accessorKey: "balls", header: "Balls" },
	not_outs: { accessorKey: "not_outs", header: "NO" },
	strike_rate: { accessorKey: "strike_rate", header: "SR", cell: ({ row }) => row.original.strike_rate.toFixed() },
	average: { accessorKey: "average", header: "Avg", cell: ({ row }) => row.original.average.toFixed() },
	highest_score: { accessorKey: "highest_score", header: "HS" },
	fours: { accessorKey: "fours", header: "4s" },
	sixes: { accessorKey: "sixes", header: "6s" },
	ducks: { accessorKey: "ducks", header: "0s" },
	fifties: { accessorKey: "fifties", header: "50s" },
	hundreds: { accessorKey: "hundreds", header: "100s" },
};

const filterColumns: Record<BattingFilter, (keyof BattingStats | ColumnDef<BattingStats>)[]> = {
	"most-runs": ["player", "innings", "runs", "balls"],
	"best-strike-rate": ["player", "runs", "balls", "strike_rate"],
	"best-average": ["player", "runs", "innings", "not_outs", "average"],
	"most-not-outs": ["player", "innings", { ...battingColumns.not_outs, header: "Not-Outs" }],
	"highest-score": ["player", "highest_score"],
	"most-fours": ["player", "balls", "fours"],
	"most-sixes": ["player", "balls", "sixes"],
	"most-ducks": ["player", "innings", { ...battingColumns.ducks, header: "Ducks" }],
	"most-fifties": ["player", "innings", "fifties"],
	"most-hundreds": ["player", "innings", "hundreds"],
};

const getBattingColumns = (): ColumnDef<BattingStats>[] => {
	const isMobile = useIsMobile();
	const { filter } = Route.useSearch();

	if (filter && filter in filterColumns) {
		return filterColumns[filter].map((col) => (typeof col === "string" ? battingColumns[col] : col));
	}

	if (isMobile) {
		return (["player", "innings", "runs", "balls", "strike_rate", "average"] as const).map((k) => battingColumns[k]);
	}

	return (
		[
			"player",
			"innings",
			"runs",
			"balls",
			"not_outs",
			"strike_rate",
			"average",
			"highest_score",
			"fours",
			"sixes",
			"ducks",
			"fifties",
			"hundreds",
		] as const
	).map((k) => battingColumns[k]);
};

export const Route = createFileRoute("/_stats/stats/batting")({
	head: () => ({ meta: [{ title: "Batting Stats" }] }),
	validateSearch: z.object({ filter: z.enum(battingFilters).optional().catch(undefined) }),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) =>
		await context.queryClient.ensureQueryData({
			queryKey: ["batting-stats", deps.date ?? deps.rivalry ?? "all-time"],
			queryFn: () => getBattingStats({ data: deps }),
		}),
	component: () => {
		const data = Route.useLoaderData();
		return (
			<TabsLayout title="Batting Stats" filters={{ stats: { options: battingFilters } }}>
				<DataTable data={data} columns={getBattingColumns()} />
			</TabsLayout>
		);
	},
});
