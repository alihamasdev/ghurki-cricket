import { statSchema } from "@ghurki-cricket/api/schema";
import { type AttendanceStats } from "@ghurki-cricket/api/types";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerCell } from "@/components/avatar";
import { type ColumnDef } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { StatsView } from "@/components/stats-view";
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
		const search = Route.useSearch();

		return (
			<StatsView
				title="Attendance Stats"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" />]}
				queryOptions={trpc.attendance.list.queryOptions(search)}
				columns={columns}
			/>
		);
	},
});
