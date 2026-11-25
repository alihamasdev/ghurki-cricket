import {
	type ColumnDef as CoreColumnDef,
	type RowData,
	type SortingState,
	createColumnHelper as coreCreateColumnHelper,
	columnVisibilityFeature,
	createSortedRowModel,
	rowSortingFeature,
	sortFns,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { AlertTriangleIcon } from "lucide-react";
import { useState } from "react";

import { ImageCapture } from "@/components/image-capture";
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const dataTableFeatures = tableFeatures({
	rowSortingFeature,
	columnVisibilityFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns,
});

export type DataTableFeatures = typeof dataTableFeatures;

export type ColumnDef<TData extends RowData, TValue = unknown> = CoreColumnDef<DataTableFeatures, TData, TValue>;

export const createColumnHelper = <TData extends RowData>() => coreCreateColumnHelper<DataTableFeatures, TData>();

type DataTableProps<TData extends RowData, _TValue = unknown> = React.PropsWithChildren<{
	columns: ColumnDef<TData, any>[];
	data: TData[];
	className?: string;
	defaultSort?: { id: string; desc?: boolean };
}>;

export function DataTable<TData extends RowData, TValue = unknown>({
	columns,
	data,
	className,
	defaultSort,
	children,
}: DataTableProps<TData, TValue>) {
	const defaultSortId = defaultSort?.id;
	const defaultSortDesc = defaultSort?.desc;

	const [prevSortKey, setPrevSortKey] = useState(() => `${defaultSortId}:${defaultSortDesc}`);
	const [sorting, setSorting] = useState<SortingState>(() => (defaultSortId ? [{ id: defaultSortId, desc: defaultSortDesc ?? true }] : []));

	const currentSortKey = `${defaultSortId}:${defaultSortDesc}`;

	if (prevSortKey !== currentSortKey) {
		setPrevSortKey(currentSortKey);
		setSorting(defaultSortId ? [{ id: defaultSortId, desc: defaultSortDesc ?? true }] : []);
	}

	const table = useTable({
		features: dataTableFeatures,
		data,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
	});

	return (
		<ImageCapture>
			<div className={cn("overflow-hidden rounded-md border", className)}>
				{children}
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											<button
												type="button"
												className="cursor-pointer select-none"
												onClick={() => header.column.toggleSorting(true)}
												onDoubleClick={() => header.column.toggleSorting(false)}
											>
												{header.isPlaceholder ? null : <table.FlexRender header={header} />}
											</button>
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} data-sorted={cell.column.getIsSorted() ? "true" : undefined}>
											<table.FlexRender cell={cell} />
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								{/* oxlint-disable */}
								<TableCell colSpan={columns.length} className="h-50 text-center text-sm first:text-center hover:bg-background">
									No results found
								</TableCell>
							</TableRow>
						)}
					</TableBody>
					{table.getFooterGroups().some((fg) => fg.headers.some((h) => h.column.columnDef.footer)) && (
						<TableFooter>
							{table.getFooterGroups().map((footerGroup) => (
								<TableRow key={footerGroup.id}>
									{footerGroup.headers.map((header) => (
										<TableCell key={header.id}>{header.isPlaceholder ? null : <table.FlexRender footer={header} />}</TableCell>
									))}
								</TableRow>
							))}
						</TableFooter>
					)}
				</Table>
			</div>
		</ImageCapture>
	);
}

export function DataTableLoader({ className, ...props }: React.ComponentProps<typeof Skeleton>) {
	return <Skeleton className={cn("h-93", className)} {...props} />;
}

export function DataTableError({ error, className, ...props }: { error?: string } & React.ComponentProps<typeof Empty>) {
	return (
		<Empty className={cn("h-93", className)} {...props}>
			<EmptyContent>
				<EmptyMedia variant="icon">
					<AlertTriangleIcon />
				</EmptyMedia>
				<EmptyTitle>Something went wrong, please try again</EmptyTitle>
				{error && <EmptyDescription>{error}</EmptyDescription>}
			</EmptyContent>
		</Empty>
	);
}
