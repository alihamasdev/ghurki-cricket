import type { GroupFilter } from "./filters";
import type { GroupSchema, DateSchema, StatSchema } from "./schemas";

type GetGroupReturn = { in: GroupFilter[] } | undefined;

export function getGroup({ group }: GroupSchema): GetGroupReturn {
	if (group === "all") return undefined;

	if (group === "family") return { in: ["core", "family"] };

	if (group === "friends") return { in: ["core", "friends"] };

	return { in: ["core"] };
}

export type DateWhereFilter =
	| { dateId: Date }
	| { date: { rivalryId: string } }
	| { dateId: { gte: Date; lte: Date } }
	| { dateId: { gte: Date } }
	| { dateId: { lte: Date } };

export type GetDateReturn = DateWhereFilter | undefined;

export function getDate(input: DateSchema & { rivalry: string }): { date: { rivalryId: string } };
export function getDate(input: DateSchema & { starts: string; ends: string }): { dateId: { gte: Date; lte: Date } };
export function getDate(input: DateSchema & { starts: string }): { dateId: { gte: Date } };
export function getDate(input: DateSchema & { ends: string }): { dateId: { lte: Date } };
export function getDate(input: DateSchema & { date: string }): { dateId: Date };
export function getDate(input?: DateSchema): GetDateReturn;
export function getDate(input?: DateSchema): GetDateReturn {
	if (!input) return undefined;

	const { date, rivalry, starts, ends } = input;

	if (rivalry) return { date: { rivalryId: rivalry } };

	if (starts && ends) return { dateId: { gte: new Date(starts), lte: new Date(ends) } };

	if (starts) return { dateId: { gte: new Date(starts) } };

	if (ends) return { dateId: { lte: new Date(ends) } };

	if (date) return { dateId: new Date(date) };
}

export function getStatWhere({ group, ...dateFilters }: StatSchema) {
	const dateWhere = getDate(dateFilters);

	if (!dateFilters.date) {
		return { ...dateWhere, player: { group: getGroup({ group }) } };
	}

	return { ...dateWhere };
}
