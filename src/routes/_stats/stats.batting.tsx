import { FilterIcon } from "@hugeicons/core-free-icons";
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

const filters = [
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

type Filter = (typeof filters)[number];

const filterSchema = z.enum(filters).optional().catch(undefined);

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

const columns: Record<keyof BattingStats, ColumnDef<BattingStats>> = {
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

const filterColumns: Record<Filter, ColumnDef<BattingStats>[]> = {
	"most-runs": [columns.player, columns.innings, columns.runs, columns.balls],
	"best-strike-rate": [columns.player, columns.runs, columns.balls, columns.strike_rate],
	"best-average": [columns.player, columns.runs, columns.innings, columns.not_outs, columns.average],
	"most-not-outs": [columns.player, columns.innings, { ...columns.not_outs, header: "Not-Outs" }],
	"highest-score": [columns.player, columns.highest_score],
	"most-fours": [columns.player, columns.balls, columns.fours],
	"most-sixes": [columns.player, columns.balls, columns.sixes],
	"most-ducks": [columns.player, columns.innings, { ...columns.ducks, header: "Ducks" }],
	"most-fifties": [columns.player, columns.innings, columns.fifties],
	"most-hundreds": [columns.player, columns.innings, columns.hundreds],
};

const getBattingColumns = (): ColumnDef<BattingStats>[] => {
	const isMobile = useIsMobile();
	const { filter } = Route.useSearch();

	if (filter && filter in filterColumns) {
		return filterColumns[filter];
	}

	if (isMobile) {
		return [columns.player, columns.innings, columns.runs, columns.balls, columns.strike_rate, columns.average];
	}

	return [
		columns.player,
		columns.innings,
		columns.runs,
		columns.balls,
		columns.not_outs,
		columns.strike_rate,
		columns.average,
		columns.highest_score,
		columns.fours,
		columns.sixes,
		columns.ducks,
		columns.fifties,
		columns.hundreds,
	];
};

export const Route = createFileRoute("/_stats/stats/batting")({
	head: () => ({ meta: [{ title: "Batting Stats" }] }),
	validateSearch: z.object({ filter: filterSchema }),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) =>
		await context.queryClient.ensureQueryData({
			queryKey: ["batting-stats", deps.date ?? deps.rivalry ?? "all-time"],
			queryFn: () => getBattingStats({ data: deps }),
		}),
	component: () => {
		const data = Route.useLoaderData();
		const navigate = Route.useNavigate();
		const { filter } = Route.useSearch();
		return (
			<TabsLayout
				title="Batting Stats"
				filters={{
					value: filter,
					icon: FilterIcon,
					title: "Select Filters",
					onValueChange: (val) => {
						const value = filterSchema.parse(val);
						navigate({ search: (prev) => ({ ...prev, filter: value }) });
					},
					options: [{ value: "", label: "All Stats" }, ...filters.map((filter) => ({ value: filter, label: filter }))],
				}}
			>
				<DataTable data={data} columns={getBattingColumns()} />
			</TabsLayout>
		);
	},
});
