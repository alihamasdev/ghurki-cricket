import { type ExpenseStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<ExpenseStats>[] = [
	{
		accessorKey: "ground",
		header: "Ground",
		footer: "Total",
	},
	{
		accessorKey: "days",
		header: "No. of Days",
		footer: ({ table }) => table.getFilteredRowModel().rows.reduce((sum, row) => sum + row.original.days, 0),
	},
	{
		accessorKey: "expense",
		header: "Expense",
		footer: ({ table }) =>
			table
				.getFilteredRowModel()
				.rows.reduce((sum, row) => sum + row.original.expense, 0)
				.toLocaleString(),
	},
];

export const Route = createFileRoute("/expense/")({
	component: () => {
		return (
			<PageLayout title="Expense">
				<ExpenseRoute />
			</PageLayout>
		);
	},
});

function ExpenseRoute() {
	const { data, status, error } = useQuery(trpc.expense.list.queryOptions());

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} />;
}
