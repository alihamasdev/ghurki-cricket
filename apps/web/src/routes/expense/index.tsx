import { type ExpenseStats } from "@ghurki-cricket/api/types";
import { RadioGroup, RadioGroupItem } from "@ghurki-cricket/ui/components/radio-group";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { CalendarDaysIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { DataTable } from "@/components/data-table";
import { FilterSheet } from "@/components/filter-sheet";
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
	validateSearch: z.object({
		year: z.number().optional().catch(undefined),
	}),
	component: () => {
		return (
			<PageLayout
				title="Expense"
				headerRight={
					<div className="flex sm:justify-end">
						<YearFilter />
					</div>
				}
			>
				<ExpenseRoute />
			</PageLayout>
		);
	},
});

function ExpenseRoute() {
	const { year } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.expense.list.queryOptions({ year }));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} />;
}

function YearFilter() {
	const { year } = Route.useSearch();
	const naviagte = Route.useNavigate();

	const [open, setOpen] = useState(false);

	const { data, status, error } = useQuery(trpc.expense.listYears.queryOptions());

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return (
		<FilterSheet title="Select Year" icon={CalendarDaysIcon} value={year ?? "All Time"} open={open} onOpenChange={setOpen}>
			<RadioGroup
				value={year ?? ""}
				onValueChange={() => {
					naviagte({ search: (prev) => ({ ...prev, year: undefined }) });
					setOpen(false);
				}}
			>
				<RadioGroupItem value="" label="All Time" description={`${data.totalDays} days`} />
			</RadioGroup>
			<RadioGroup
				value={year}
				onValueChange={(val: number) => {
					naviagte({ search: (prev) => ({ ...prev, year: val }) });
					setOpen(false);
				}}
			>
				{data.years.map((year) => (
					<RadioGroupItem key={year.year} value={year.year} label={`Year ${year.year}`} description={`${year.count} days`} />
				))}
			</RadioGroup>
		</FilterSheet>
	);
}
