import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type ColumnDef } from "@tanstack/react-table";
import { toBlob } from "html-to-image";
import { useRef, useState } from "react";

import { DataTable } from "@/components/data-table";
import { validateDate } from "@/components/date-filter";
import { PlayerAvatarCell } from "@/components/players/avatar";
import { TabsLayout } from "@/components/tabs-layout";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { type AttendanceStats } from "@/lib/types";

type AttendanceRow = AttendanceStats & { total: number };

const getAttendanceStats = createServerFn({ method: "GET" })
	.validator(validateDate)
	.handler(async ({ data }): Promise<AttendanceRow[]> => {
		const [_dateFilter, playerFilter] = data;
		const [totalDates, attendances] = await Promise.all([
			db.dates.count(),
			db.players.findMany({ select: { name: true, attendance: true }, where: playerFilter }),
		]);

		return attendances
			.map((player) => ({
				player: player.name,
				present: player.attendance,
				total: totalDates,
				percentage: totalDates ? (player.attendance / totalDates) * 100 : 0,
			}))
			.sort((a, b) => b.present - a.present);
	});

const columns: ColumnDef<AttendanceRow>[] = [
	{ accessorKey: "player", header: "Player", cell: ({ row }) => <PlayerAvatarCell name={row.original.player} /> },
	{
		accessorKey: "present",
		header: "Attendance",
		cell: ({ row }) => `${row.original.present} / ${row.original.total}`,
	},
	{ accessorKey: "percentage", header: "Percentage", cell: ({ row }) => `${row.original.percentage.toFixed()}%` },
];

export const Route = createFileRoute("/_stats/stats/attendance")({
	head: () => ({ meta: [{ title: "Attendance Stats" }] }),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) =>
		await context.queryClient.query({
			queryKey: ["attendance-stats", deps.core ? "core-players" : "all-players"],
			queryFn: () => getAttendanceStats({ data: deps }),
		}),
	component: AttendanceStatsPage,
});

function AttendanceStatsPage() {
	const data = Route.useLoaderData();
	const tableRef = useRef<HTMLDivElement>(null);
	const [copying, setCopying] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleCopyScreenshot = async () => {
		if (!tableRef.current || copying) return;
		setCopying(true);
		setCopied(false);
		try {
			const blob = await toBlob(tableRef.current, {
				backgroundColor: "#ffffff",
				pixelRatio: 2,
				cacheBust: true,
			});
			if (!blob) throw new Error("Failed to capture table");
			await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Screenshot copy failed:", err);
		} finally {
			setCopying(false);
		}
	};

	return (
		<TabsLayout title="Attendance Stats" dateFilter={null}>
			<div className="flex justify-end">
				<Button variant="outline" size="sm" onClick={handleCopyScreenshot} disabled={copying} className="gap-1.5">
					<HugeiconsIcon icon={Download01Icon} strokeWidth={2} className="size-4" />
					{copying ? "Copying…" : copied ? "Copied!" : "Download"}
				</Button>
			</div>
			<div ref={tableRef}>
				<DataTable columns={columns} data={data} sorting={[{ id: "present", desc: true }]} className="table-fixed" />
			</div>
		</TabsLayout>
	);
}
