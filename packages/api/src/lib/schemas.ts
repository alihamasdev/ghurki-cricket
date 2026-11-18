import { z } from "zod";

import { groupFilters } from "./filters";

export const groupSchema = z.object({
	group: z
		.enum([...groupFilters, "all"])
		.optional()
		.catch("core"),
});
export type GroupSchema = z.infer<typeof groupSchema>;

export const overSchema = z.object({
	overs: z.coerce.number().optional().catch(undefined),
});

export const dateSchema = z.object({
	rivalry: z.string().optional().catch(undefined),
	starts: z.iso.date().optional().catch(undefined),
	ends: z.iso.date().optional().catch(undefined),
	date: z.iso.date().optional().catch(undefined),
});
export type DateSchema = z.infer<typeof dateSchema>;

export const statSchema = dateSchema.extend(groupSchema.shape);
export type StatSchema = z.infer<typeof statSchema>;

export const expenseSchema = dateSchema.pick({ starts: true, ends: true });

export const matchSchema = dateSchema.extend({
	...overSchema.shape,
	potm: z.string().optional().catch(undefined),
});

export const compareTeamSchema = dateSchema.omit({ starts: true, ends: true }).extend({
	...overSchema.shape,
});

export const comparePlayerSchema = dateSchema.pick({ rivalry: true }).extend({
	player1: z.string().optional().catch(undefined),
	player2: z.string().optional().catch(undefined),
});
