import { ResizablePanelGroup, ResizableHandle, ResizablePanel } from "@ghurki-cricket/ui/components/resizable";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@ghurki-cricket/ui/components/table";
import { useIsMobile } from "@ghurki-cricket/ui/hooks/use-mobile";
import { cn } from "@ghurki-cricket/ui/lib/utils";
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	minSize?: number;
	className?: string;
};

export function DataTable<TData, TValue>({ columns, data, minSize = 50, className }: DataTableProps<TData, TValue>) {
	"use no memo";
	const isMobile = useIsMobile();

	// oxlint-disable-next-line react/incompatible-library
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<ResizablePanelGroup direction="horizontal">
			<ResizablePanel defaultSize={100} minSize={isMobile ? 100 : minSize}>
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
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel defaultSize={0}>
				<div />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
