import type { GroupFilter } from "./filters";
import type { GroupSchema, DateSchema, StatSchema } from "./schemas";

type GetGroupReturn = { in: GroupFilter[] } | undefined;

export function getGroup({ group }: GroupSchema): GetGroupReturn {
	if (group === "all") return undefined;
	if (group === "family") return { in: ["core", "family"] };
	if (group === "friends") return { in: ["core", "friends"] };
	return { in: ["core"] };
}

type GetDateReturn = { date?: { rivalryId: string } } | { dateId?: Date | string | { gte?: Date; lte?: Date } } | undefined;

export function getDate({ date, rivalry, starts, ends }: DateSchema): GetDateReturn {
	if (rivalry) return { date: { rivalryId: rivalry } };
	if (starts && ends) return { dateId: { gte: new Date(starts), lte: new Date(ends) } };
	if (starts) return { dateId: { gte: new Date(starts) } };
	if (ends) return { dateId: { lte: new Date(ends) } };
	if (date) return { dateId: new Date(date) };
}

export function getStatWhere({ group, ...dateFilters }: StatSchema) {
	return {
		player: { group: getGroup({ group }) },
		...getDate(dateFilters),
	};
}
