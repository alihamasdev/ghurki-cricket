import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { type DateSchema, statSchema } from "../lib/schemas";
import { getStatWhere } from "../lib/helpers";
import { type AttendanceStats } from "../lib/types";

const getDateFilter = ({ date, year, rivalry }: DateSchema) => {
	if (rivalry) return { rivalryId: rivalry };
	if (year) return { date: { gte: new Date(year, 0, 0), lte: new Date(year, 11, 31) } };
	if (date) return { date };
};

export const attendanceRouter = router({
	list: publicProcedure.input(statSchema).query(async ({ input }): Promise<AttendanceStats[]> => {
		const [data, total] = await Promise.all([
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
