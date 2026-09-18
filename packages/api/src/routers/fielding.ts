import { db } from "@ghurki-cricket/db";

import { publicProcedure, router } from "../index";
import { getStatWhere } from "../lib/helpers";
import { fieldingStatSchema, type FieldingStatSchema } from "../lib/schemas";
import { type FieldingStats } from "../lib/types";

export const fieldingRouter = router({
	list: publicProcedure.input(fieldingStatSchema).query(async ({ input }) => {
		if (input.filter === "most-catches") return getMostCatches(input);
		if (input.filter === "most-run-outs") return getMostRunOuts(input);
		return getFieldingStats(input);
	}),
});

const getFieldingStats = async (filters: FieldingStatSchema): Promise<FieldingStats[]> => {
	const data = await db.fielders.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { innings: true, catches: true, runOuts: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			innings: val._sum.innings ?? 0,
			catches: val._sum.catches ?? 0,
			runOuts: val._sum.runOuts ?? 0,
		}))
		.sort((a, b) => b.catches - a.catches);
};

const getMostCatches = async (filters: FieldingStatSchema): Promise<FieldingStats[]> => {
	const data = await db.fielders.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { innings: true, catches: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			innings: val._sum.innings ?? 0,
			catches: val._sum.catches ?? 0,
		}))
		.sort((a, b) => b.catches - a.catches);
};

const getMostRunOuts = async (filters: FieldingStatSchema): Promise<FieldingStats[]> => {
	const data = await db.fielders.groupBy({
		by: ["playerId"],
		where: getStatWhere(filters),
		_sum: { innings: true, runOuts: true },
	});
	return data
		.map((val) => ({
			player: val.playerId,
			innings: val._sum.innings ?? 0,
			runOuts: val._sum.runOuts ?? 0,
		}))
		.sort((a, b) => b.runOuts - a.runOuts);
};
