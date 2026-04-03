import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type OnChangeFn,
	type SortingState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { ResizablePanelGroup, ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	minSize?: number;
	className?: string;
	sorting?: SortingState;
	onSortingChange?: OnChangeFn<SortingState>;
};

export function DataTable<TData, TValue>({
	columns,
	data,
	minSize = 50,
	className,
	sorting: externalSorting,
	onSortingChange,
}: DataTableProps<TData, TValue>) {
	const isMobile = useIsMobile();

	const [internalSorting, setInternalSorting] = useState<SortingState>(externalSorting ?? []);

	useEffect(() => {
		if (externalSorting) {
			setInternalSorting(externalSorting);
		}
	}, [externalSorting]);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting: internalSorting,
		},
		onSortingChange: (updater) => {
			if (onSortingChange) {
				onSortingChange(updater);
			} else {
				setInternalSorting(updater);
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<ResizablePanelGroup direction="horizontal">
			<ResizablePanel defaultSize={100} minSize={isMobile ? 100 : minSize}>
				<div className="overflow-hidden rounded-md border">
					<Table className={className}>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id}>
												<button
													type="button"
													className="cursor-pointer"
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
											<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
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
											<TableCell key={header.id} className="font-medium">
												{header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
											</TableCell>
										))}
									</TableRow>
								))}
							</TableFooter>
						)}
					</Table>
				</div>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel defaultSize={0}>
				<div />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
