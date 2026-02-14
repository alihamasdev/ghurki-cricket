import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";
import { TabsLayout } from "@/components/tabs-layout";
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

const getExpense = createServerFn({ method: "GET" }).handler(async () => {
	const data = await db.expenses.findMany({ orderBy: { dateId: "desc" } });
	return data.map((item) => ({
		...item,
		dateId: formatDate(item.dateId),
		total: item.foodCost + item.gearCost + item.groundFee,
	}));
});

const columns: ColumnDef<Awaited<ReturnType<typeof getExpense>>[number]>[] = [
	{ accessorKey: "dateId", header: "Date" },
	{ accessorKey: "groundFee", header: "Ground Fee" },
	{ accessorKey: "foodCost", header: "Food Cost" },
	{ accessorKey: "gearCost", header: "Gear Cost" },
	{ accessorKey: "total", header: "Day Total" },
];

export const Route = createFileRoute("/_tab/expense/")({
	head: () => ({ meta: [{ title: "Expense" }] }),
	loader: async ({ context }) =>
		await context.queryClient.ensureQueryData({
			queryKey: ["expense"],
			queryFn: () => getExpense(),
		}),
	component: () => {
		const data = Route.useLoaderData();
		return (
			<TabsLayout title="Expense" filters={{ date: false }}>
				<DataTable
					columns={columns}
					data={data}
					footer={(table) => (
						<TableFooter>
							<TableRow>
								{table.getVisibleFlatColumns().map((column, index) => {
									const isFirst = index === 0;
									const total = table.getFilteredRowModel().rows.reduce((sum, row) => {
										const value = row.getValue(column.id);
										return typeof value === "number" ? sum + value : sum;
									}, 0);

									return (
										<TableCell key={column.id} className="font-medium">
											{isFirst
												? "Total"
												: total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
										</TableCell>
									);
								})}
							</TableRow>
						</TableFooter>
					)}
				/>
			</TabsLayout>
		);
	},
});
