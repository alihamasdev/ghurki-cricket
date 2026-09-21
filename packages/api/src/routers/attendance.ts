import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getStatWhere } from "../lib/helpers";
import { type DateSchema, statSchema } from "../lib/schemas";
import { type AttendanceStats } from "../lib/types";

const getDateFilter = ({ date, rivalry, starts, ends }: DateSchema) => {
	if (rivalry) return { rivalryId: rivalry };
	if (starts && ends) return { date: { gte: new Date(starts), lte: new Date(ends) } };
	if (starts) return { date: { gte: new Date(starts) } };
	if (ends) return { date: { lte: new Date(ends) } };
	if (date) return { date };
};

export const attendanceRouter = router({
	list: publicProcedure.input(statSchema).query(async ({ input }): Promise<AttendanceStats[]> => {
		const [data, total] = await db.$transaction([
			db.fielders.groupBy({
				by: ["playerId"],
				where: getStatWhere(input),
				_count: true,
			}),
			db.dates.count({
				where: getDateFilter(input),
			}),
		]);

		return data
			.map((val) => {
				const percentage = (val._count / total) * 100;
				const roundPercentage = percentage.toFixed();
				return {
					player: val.playerId,
					attendance: `${val._count} / ${total}`,
					percentage: Number(roundPercentage),
				};
			})
			.sort((a, b) => b.percentage - a.percentage);
	}),
});
