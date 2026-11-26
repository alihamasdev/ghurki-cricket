import { statSchema } from "@ghurki-cricket/api/schema";
import { type AttendanceStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { DataTable, type ColumnDef, DataTableError, DataTableLoader } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<AttendanceStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "attendance", header: "Attendance" },
	{ accessorKey: "percentage", header: "Percentage", cell: ({ row }) => `${row.original.percentage}%` },
];

export const Route = createFileRoute("/stats/attendance/")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Attendance Stats | Ghurki Cricket" },
			{ name: "description", content: "Player attendance tracking and participation statistics for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Attendance Stats"
				headerRight={
					<div className="flex flex-wrap items-center gap-2 sm:justify-end">
						<GroupFilter />
						<DateFilter />
					</div>
				}
			>
				<AttendanceRoute />
			</PageLayout>
		);
	},
});

function AttendanceRoute() {
	const { group, rivalry, starts, ends, date } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.attendance.list.queryOptions({ group, rivalry, starts, ends, date }));

	if (status === "pending") {
		return <DataTableLoader />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} />;
}
