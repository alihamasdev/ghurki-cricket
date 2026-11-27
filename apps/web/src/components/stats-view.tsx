import type { TimelineData } from "@ghurki-cricket/api/types";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { RowData } from "@tanstack/react-table";
import type React from "react";

import { DataTable, type ColumnDef, DataTableError, DataTableLoader } from "@/components/data-table";
import { PageLayout } from "@/components/page-layout";
import { Timeline } from "@/components/timeline";
import { cn } from "@/lib/utils";

type StatsViewProps<TData extends RowData> = {
	title: string;
	headerRight?: React.ReactNode;
	filters?: React.ReactElement[];
	queryOptions: UseQueryOptions<TData[], any, TData[], any>;
	columns: ColumnDef<TData, any>[];
	defaultSort?: { id: string; desc?: boolean };
	className?: string;
	children?: React.ReactNode;
};

function renderFilters(filters?: React.ReactElement[]) {
	if (!filters || filters.length === 0) return undefined;

	const colCount = Math.min(filters.length, 3);
	const gridColsClass = colCount === 1 ? "grid-cols-1" : colCount === 2 ? "grid-cols-2" : "grid-cols-3";

	return (
		<div className={cn("grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end", gridColsClass)}>
			{filters.map((filter, index) => (
				<div key={filter.key ?? index} className="w-full *:w-full sm:w-auto sm:*:w-auto">
					{filter}
				</div>
			))}
		</div>
	);
}

export function StatsView<TData extends RowData>({
	title,
	headerRight,
	filters,
	queryOptions,
	columns,
	defaultSort,
	className,
	children,
}: StatsViewProps<TData>) {
	const { data, status, error } = useQuery(queryOptions);

	const header = headerRight ?? renderFilters(filters);

	let content: React.ReactNode = null;

	if (status === "pending") {
		content = <DataTableLoader />;
	} else if (status === "error") {
		content = <DataTableError error={error?.message} />;
	} else if (data) {
		content = (
			<DataTable columns={columns} data={data} defaultSort={defaultSort} className={className}>
				{children}
			</DataTable>
		);
	}

	return (
		<PageLayout title={title} headerRight={header}>
			{content}
		</PageLayout>
	);
}

type TimelineViewProps = {
	title: string;
	headerRight?: React.ReactNode;
	filters?: React.ReactElement[];
	queryOptions: UseQueryOptions<TimelineData, any, TimelineData, any>;
	chartTitle?: string;
	unit?: string;
};

export function TimelineView({ title, headerRight, filters, queryOptions, chartTitle = title, unit }: TimelineViewProps) {
	const { data, status, error } = useQuery(queryOptions);

	const header = headerRight ?? renderFilters(filters);

	let content: React.ReactNode = null;

	if (status === "pending") {
		content = <DataTableLoader className="aspect-video h-auto" />;
	} else if (status === "error") {
		content = <DataTableError error={error?.message} />;
	} else if (data) {
		content = <Timeline title={chartTitle} unit={unit} timeline={data} />;
	}

	return (
		<PageLayout title={title} headerRight={header}>
			{content}
		</PageLayout>
	);
}
