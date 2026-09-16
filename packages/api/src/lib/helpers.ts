import type { GroupSchema } from "./schemas";
import type { GroupFilter } from "./filters";

type GetGroupReturn = { in: GroupFilter[] } | undefined;

export function getGroup({ group }: GroupSchema): GetGroupReturn {
	if (group === "all") return undefined;
	if (group === "family") return { in: ["core", "family"] };
	if (group === "friends") return { in: ["core", "friends"] };
	return { in: ["core"] };
}
