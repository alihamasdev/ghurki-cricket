import { type ExpenseStats, type ExpenseSummary } from "@ghurki-cricket/api/types";
import { FilterSheet } from "@ghurki-cricket/ui/components/filter-sheet";
import { RadioGroup, RadioGroupItem } from "@ghurki-cricket/ui/components/radio-group";
import { cn } from "@ghurki-cricket/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

import { DataTable } from "@/components/data-table";
import { CalendarIcon } from "@/components/icons";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<ExpenseStats>[] = [
	{ accessorKey: "ground", header: "Ground Name" },
	{ accessorKey: "days", header: "No. of Days" },
	{ accessorKey: "expense", header: "Ground Expense", cell: ({ row }) => row.original.expense.toLocaleString() },
];

export const Route = createFileRoute("/expense/")({
	validateSearch: z.object({
		year: z.number().optional().catch(undefined),
	}),
	head: () => ({
		meta: [
			{ title: "Expense | Ghurki Cricket" },
			{ name: "description", content: "Track and review ground expenses and match costs for Ghurki Cricket." },
		],
	}),
	component: () => {
		const { year } = Route.useSearch();

		return (
			<PageLayout
				title="Expense"
				headerRight={
					<div className="flex sm:justify-end">
						<FilterSheet title="Select Year" icon={CalendarIcon} value={year ?? "All Time"}>
							<YearFilter />
						</FilterSheet>
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
	const { year } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.dates.listExpense.queryOptions({ year }));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return (
		<DataTable columns={columns} data={data.expenses}>
			<ExpenseSummaryBoxes summary={data.summary} />
		</DataTable>
	);
}

function YearFilter() {
	const { year } = Route.useSearch();
	const naviagte = Route.useNavigate();

	const { data, isPending, isError, error } = useQuery(trpc.dates.listYears.queryOptions());

	if (isError) {
		return <PageError error={error.message} />;
	}

	return (
		<>
			<RadioGroup
				length={1}
				value={year ?? ""}
				isLoading={isPending}
				onValueChange={() => {
					naviagte({ search: (prev) => ({ ...prev, year: undefined }) });
				}}
			>
				<RadioGroupItem value="" label="All Time" description={`${data?.totalDays} days`} />
			</RadioGroup>
			<RadioGroup
				value={year}
				isLoading={isPending}
				onValueChange={(val: number) => {
					naviagte({ search: (prev) => ({ ...prev, year: val }) });
				}}
			>
				{data?.years.map((year) => (
					<RadioGroupItem key={year.year} value={year.year} label={`Year ${year.year}`} description={`${year.count} days`} />
				))}
			</RadioGroup>
		</>
	);
}
