import { statSchema } from "@ghurki-cricket/api/schema";
import { type AttendanceStats } from "@ghurki-cricket/api/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";

import { PlayerCell } from "@/components/avatar";
import { DataTable } from "@/components/data-table";
import { DateFilter } from "@/components/date-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

const columns: ColumnDef<AttendanceStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerCell name={row.original.player} /> },
	{ accessorKey: "attendance", header: "Attendance" },
	{ accessorKey: "percentage", header: "Percentage", cell: ({ row }) => `${row.original.percentage}%` },
];

export const Route = createFileRoute("/stats/attendance")({
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
					<div className="flex sm:justify-end">
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
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.attendance.list.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return <DataTable columns={columns} data={data} />;
}
