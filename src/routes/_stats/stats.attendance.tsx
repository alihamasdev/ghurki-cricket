import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";
import { PlayerAvatarCell } from "@/components/players/avatar";
import { TabsLayout } from "@/components/tabs-layout";
import { db } from "@/lib/db";
import { type AttendanceStats } from "@/lib/types";
import { validateDate } from "~/src/components/date-filter";

const getAttendanceStats = createServerFn({ method: "GET" })
	.validator(validateDate)
	.handler(async ({ data }): Promise<AttendanceStats[]> => {
		const [_dateFilter, playerFilter] = data;
		const [totalDates, attendances] = await Promise.all([
			db.dates.count(),
			db.players.findMany({ select: { name: true, attendance: true }, where: playerFilter }),
		]);

		return attendances
			.map((player) => ({
				player: player.name,
				present: player.attendance,
				percentage: (player.attendance / totalDates) * 100,
			}))
			.sort((a, b) => b.present - a.present);
	});

const columns: ColumnDef<AttendanceStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerAvatarCell name={row.original.player} /> },
	{ accessorKey: "present", header: "Present" },
	{ accessorKey: "percentage", header: "Attendance %", cell: ({ row }) => `${row.original.percentage.toFixed()}%` },
];

export const Route = createFileRoute("/_stats/stats/attendance")({
	head: () => ({ meta: [{ title: "Attendance Stats" }] }),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) =>
		await context.queryClient.ensureQueryData({
			queryKey: ["attendance-stats", deps.core ? "core-players" : "all-players"],
			queryFn: () => getAttendanceStats({ data: deps }),
		}),
	component: () => {
		const data = Route.useLoaderData();
		return (
			<TabsLayout title="Attendance Stats" dateFilter={null}>
				<DataTable columns={columns} data={data} sorting={[{ id: "present", desc: true }]} className="table-fixed" />
			</TabsLayout>
		);
	},
});
