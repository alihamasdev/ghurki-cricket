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
import { type BowlingStats } from "@/lib/types";
import { ballsToOvers } from "@/lib/utils";

const filters = [
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

type Filter = (typeof filters)[number];

const filterSchema = z.enum(filters).optional().catch(undefined);

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

const columns: Record<keyof BowlingStats, ColumnDef<BowlingStats>> = {
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

const filterColumns: Record<Filter, ColumnDef<BowlingStats>[]> = {
	"most-wickets": [columns.player, columns.balls, columns.wickets],
	"most-runs-conceded": [columns.player, columns.balls, columns.runs],
	"best-economy": [columns.player, columns.runs, columns.balls, columns.economy],
	"best-average": [columns.player, columns.runs, columns.wickets, columns.average],
	"most-dots": [columns.player, columns.balls, columns.dots],
	"most-wides": [columns.player, columns.balls, columns.wides],
	"most-no-balls": [columns.player, columns.balls, columns.no_balls],
	"most-2fr": [columns.player, columns.innings, columns["2fr"]],
	"most-3fr": [columns.player, columns.innings, columns["3fr"]],
};

const getBowlingColumns = (): ColumnDef<BowlingStats>[] => {
	const isMobile = useIsMobile();
	const { filter } = Route.useSearch();

	if (filter && filter in filterColumns) {
		return filterColumns[filter];
	}

	if (isMobile) {
		return [columns.player, columns.innings, columns.balls, columns.runs, columns.wickets, columns.economy, columns.average];
	}

	return [
		columns.player,
		columns.innings,
		columns.balls,
		columns.runs,
		columns.wickets,
		columns.economy,
		columns.average,
		columns.dots,
		columns.wides,
		columns.no_balls,
		columns["2fr"],
		columns["3fr"],
	];
};

export const Route = createFileRoute("/_stats/stats/bowling")({
	head: () => ({ meta: [{ title: "Bowling Stats" }] }),
	validateSearch: z.object({ filter: filterSchema }),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) =>
		await context.queryClient.ensureQueryData({
			queryKey: ["bowling-stats", deps.date ?? deps.rivalry ?? "all-time"],
			queryFn: () => getBowlingStats({ data: deps }),
		}),
	component: () => {
		const data = Route.useLoaderData();
		const navigate = Route.useNavigate();
		const { filter } = Route.useSearch();
		return (
			<TabsLayout
				title="Bowling Stats"
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
				<DataTable columns={getBowlingColumns()} data={data} />
			</TabsLayout>
		);
	},
});
