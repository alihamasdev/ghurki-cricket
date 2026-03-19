import { EyeIcon } from "@hugeicons/core-free-icons";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { ColumnDef } from "@tanstack/react-table";
import { type Table } from "@tanstack/react-table";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { z } from "zod";

import { DataTable } from "@/components/data-table";
import { TabsLayout } from "@/components/tabs-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

const viewSchema = z.object({
	view: z.enum(["table", "chart"]).optional().default("table"),
});

const getExpense = createServerFn({ method: "GET" }).handler(async () => {
	const data = await db.expenses.findMany({ orderBy: { date: "desc" } });
	return data.map((item) => ({
		...item,
		date: formatDate(item.date),
		total: item.foodCost + item.gearCost + item.groundFee,
	}));
});

type ExpenseRow = Awaited<ReturnType<typeof getExpense>>[number];

const sumColumn = (id: keyof ExpenseRow) => {
	return ({ table }: { table: Table<ExpenseRow> }) =>
		table
			.getFilteredRowModel()
			.rows.reduce((sum, row) => sum + (Number(row.getValue(id)) || 0), 0)
			.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const columns: ColumnDef<ExpenseRow>[] = [
	{ accessorKey: "date", header: "Date", footer: () => "Total" },
	{ accessorKey: "groundFee", header: "Ground", footer: sumColumn("groundFee") },
	{ accessorKey: "foodCost", header: "Food", footer: sumColumn("foodCost") },
	{ accessorKey: "gearCost", header: "Gear", footer: sumColumn("gearCost") },
	{ accessorKey: "total", header: "Total", footer: sumColumn("total") },
];

const chartConfig: ChartConfig = {
	groundFee: { label: "Ground Fee", color: "var(--chart-1)" },
	foodCost: { label: "Food Cost", color: "var(--chart-2)" },
	gearCost: { label: "Gear Cost", color: "var(--chart-3)" },
	total: { label: "Total Cost", color: "var(--chart-4)" },
};

export const Route = createFileRoute("/_tab/expense/")({
	head: () => ({ meta: [{ title: "Expense" }] }),
	validateSearch: viewSchema,
	loader: async ({ context }) =>
		await context.queryClient.ensureQueryData({
			queryKey: ["expense"],
			queryFn: () => getExpense(),
		}),
	component: () => {
		const data = Route.useLoaderData();
		const { view } = Route.useSearch();
		const navigate = Route.useNavigate();
		const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("total");
		return (
			<TabsLayout
				title="Expense"
				dateFilter={null}
				filters={{
					icon: EyeIcon,
					value: view,
					onValueChange: (val) => navigate({ search: { view: val === "chart" ? "chart" : undefined }, replace: true }),
					options: [
						{ label: "Table", value: "table" },
						{ label: "Chart", value: "chart" },
					],
				}}
			>
				{view === "table" ? (
					<DataTable columns={columns} data={data} />
				) : (
					<Card className="mt-1 py-0">
						<CardHeader className="grid grid-cols-2 gap-0 divide-x divide-y border-b px-0 sm:grid-cols-4 md:divide-y-0 [.border-b]:pb-0">
							{["groundFee", "foodCost", "gearCost", "total"].map((key) => {
								const chart = key as keyof typeof chartConfig;
								return (
									<button
										key={chart}
										type="button"
										data-active={activeChart === chart}
										onClick={() => setActiveChart(chart)}
										className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left data-[active=true]:bg-muted/70 sm:px-8 sm:py-6"
									>
										<span className="text-xs text-muted-foreground">{chartConfig[chart].label}</span>
										<span className="text-lg leading-none font-bold sm:text-3xl">
											{data.reduce((sum, row) => sum + (Number(row[key as keyof typeof row]) || 0), 0).toLocaleString()}
										</span>
									</button>
								);
							})}
						</CardHeader>
						<CardContent className="px-2 sm:p-6">
							<ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
								<BarChart accessibilityLayer data={[...data].reverse()} margin={{ left: 12, right: 12 }}>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="date"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										minTickGap={32}
										tickFormatter={(value) => formatDate(value) ?? "All Time"}
									/>
									<ChartTooltip
										content={
											<ChartTooltipContent
												className="w-[150px]"
												nameKey="views"
												labelFormatter={(value) => formatDate(value) ?? "All Time"}
											/>
										}
									/>
									<Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
								</BarChart>
							</ChartContainer>
						</CardContent>
					</Card>
				)}
			</TabsLayout>
		);
	},
});
