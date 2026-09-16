import type { GroupSchema, DateSchema, StatSchema } from "./schemas";
import type { GroupFilter } from "./filters";

type GetGroupReturn = { in: GroupFilter[] } | undefined;

export function getGroup({ group }: GroupSchema): GetGroupReturn {
	if (group === "all") return undefined;
	if (group === "family") return { in: ["core", "family"] };
	if (group === "friends") return { in: ["core", "friends"] };
	return { in: ["core"] };
}

type GetDateReturn = { date: { rivalryId: string } } | { dateId: { gte: Date; lte: Date } } | { dateId: Date | string } | undefined;

export function getDate({ date, year, rivalry }: DateSchema): GetDateReturn {
	if (rivalry) return { date: { rivalryId: rivalry } };
	if (year) return { dateId: { gte: new Date(year, 0, 0), lte: new Date(year, 11, 31) } };
	if (date) return { dateId: new Date(date) };
}

export function getStatWhere({ group, ...dateFilters }: StatSchema) {
	return {
		player: { group: getGroup({ group }) },
		...getDate(dateFilters),
	};
}
