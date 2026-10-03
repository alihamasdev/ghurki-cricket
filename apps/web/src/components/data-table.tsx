import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@ghurki-cricket/ui/components/table";
import { cn } from "@ghurki-cricket/ui/lib/utils";
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { ImageCapture } from "@/components/image-capture";

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	minSize?: number;
	className?: string;
	defaultSort?: { id: string; desc?: boolean };
};

export function DataTable<TData, TValue>({ columns, data, className, defaultSort }: DataTableProps<TData, TValue>) {
	const defaultSortId = defaultSort?.id;
	const defaultSortDesc = defaultSort?.desc;

	const [sorting, setSorting] = useState<SortingState>(() => (defaultSortId ? [{ id: defaultSortId, desc: defaultSortDesc ?? true }] : []));

	useEffect(() => {
		if (defaultSortId) {
			setSorting([{ id: defaultSortId, desc: defaultSortDesc ?? true }]);
		}
	}, [defaultSortId, defaultSortDesc]);

	// oxlint-disable-next-line react/incompatible-library
	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<ImageCapture>
			<div className={cn("overflow-hidden rounded-md border", className)}>
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
												{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} data-sorted={cell.column.getIsSorted() ? "true" : undefined}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
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
										<TableCell key={header.id}>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
										</TableCell>
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
