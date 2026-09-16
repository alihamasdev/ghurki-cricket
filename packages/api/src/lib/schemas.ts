import { z } from "zod";
import { groupFilters } from "./filters";

export const groupSchema = z.object({
	group: z
		.enum([...groupFilters, "all"])
		.optional()
		.catch(undefined),
});

export type GroupSchema = z.infer<typeof groupSchema>;
