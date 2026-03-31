import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";
import { dateSearchSchema, validateDate } from "@/components/date-filter";
import { PlayerAvatarCell } from "@/components/players/avatar";
import { TabsLayout } from "@/components/tabs-layout";
import { db } from "@/lib/db";
import { type AttendanceStats } from "@/lib/types";

const getAttendanceStats = createServerFn({ method: "GET" })
	.inputValidator(validateDate)
	.handler(async ({ data }): Promise<AttendanceStats[]> => {
		const totalDatesResult = await db.dates.count({ where: { ...data } });

		const players = await db.players.findMany({
			include: {
				batting: { where: { date: data }, select: { dateId: true } },
				bowling: { where: { date: data }, select: { dateId: true } },
				fielding: { where: { date: data }, select: { dateId: true } },
			},
		});

		return players
			.map((player) => {
				const attendedDates = new Set([
					...player.batting.map((b) => b.dateId.toISOString()),
					...player.bowling.map((b) => b.dateId.toISOString()),
					...player.fielding.map((f) => f.dateId.toISOString()),
				]);

				const matches = attendedDates.size;
				const percentage = totalDatesResult > 0 ? Math.round((matches / totalDatesResult) * 100) : 0;

				return {
					player: player.name,
					matches,
					totalMatches: totalDatesResult,
					percentage,
				};
			})
			.sort((a, b) => b.matches - a.matches);
	});

const columns: ColumnDef<AttendanceStats>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerAvatarCell name={row.original.player} /> },
	{ accessorKey: "matches", header: "Attendance" },
	{ accessorKey: "totalMatches", header: "Total Days" },
	{ accessorKey: "percentage", header: "Attendance %", cell: ({ row }) => `${row.original.percentage}%` },
];

export const Route = createFileRoute("/_stats/stats/attendance")({
	head: () => ({ meta: [{ title: "Attendance Stats" }] }),
	validateSearch: (search) => dateSearchSchema.parse(search),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) =>
		await context.queryClient.ensureQueryData({
			queryKey: ["attendance-stats", deps.rivalry ?? "all-time"],
			queryFn: () => getAttendanceStats({ data: deps }),
		}),
	component: () => {
		const data = Route.useLoaderData();
		return (
			<TabsLayout title="Attendance Stats" dateFilter={{ options: "rivalries" }}>
				<DataTable columns={columns} data={data} sorting={[{ id: "matches", desc: true }]} />
			</TabsLayout>
		);
	},
});
