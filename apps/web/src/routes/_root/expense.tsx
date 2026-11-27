import { expenseSchema } from "@ghurki-cricket/api/schema";
import { type ExpenseStats, type ExpenseSummary } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DataTable, type ColumnDef, DataTableError, DataTableLoader } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { PageLayout } from "@/components/page-layout";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<ExpenseStats>[] = [
	{ accessorKey: "ground", header: "Ground Name" },
	{ accessorKey: "days", header: "No. of Days" },
	{ accessorKey: "expense", header: "Ground Expense", cell: ({ row }) => row.original.expense.toLocaleString() },
];

export const Route = createFileRoute("/_root/expense")({
	validateSearch: expenseSchema,
	head: () => seo("Expense", "Track and review ground expenses and match costs for Ghurki Cricket."),
	component: () => {
		return (
			<PageLayout
				title="Expense"
				headerRight={
					<div className="flex sm:justify-end">
						<DateFilter hasStats={false} hasRivalries={false} hasDates={false} />
					</div>
				}
			>
				<ExpenseRoute />
			</PageLayout>
		);
	},
});

function ExpenseSummaryBoxes({ summary }: { summary: ExpenseSummary }) {
	const stats = [
		{ label: "No. of Day", value: summary.days.toLocaleString() },
		{ label: "Ground Expense", value: summary.groundExpense.toLocaleString() },
		{ label: "Gear Expense", value: summary.gearExpense.toLocaleString() },
		{ label: "Total Expense", value: summary.totalExpense.toLocaleString() },
	];

	return (
		<div className="grid grid-cols-2 border-b border-border sm:grid-cols-4">
			{stats.map(({ label, value }, idx) => (
				<div
					key={label}
					className={cn(
						"flex flex-col items-center justify-center gap-1 p-4 text-center",
						idx % 2 === 0 ? "border-r border-border" : "",
						idx < 2 ? "border-b border-border sm:border-b-0" : "",
						idx === 1 ? "sm:border-r sm:border-border" : "",
						idx === 2 ? "sm:border-r sm:border-border" : "",
					)}
				>
					<span className="text-xs text-muted-foreground">{label}</span>
					<span className="text-base font-semibold">{value}</span>
				</div>
			))}
		</div>
	);
}

function ExpenseRoute() {
	const { starts, ends } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.expense.list.queryOptions({ starts, ends }));

	if (status === "pending") {
		return <DataTableLoader className="h-112" />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} className="h-112" />;
	}

	return (
		<DataTable columns={columns} data={data.expenses}>
			<ExpenseSummaryBoxes summary={data.summary} />
		</DataTable>
	);
}
