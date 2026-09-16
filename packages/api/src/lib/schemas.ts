import { z } from "zod";
import { battingFilters, bowlingFilters, fieldingFilters, groupFilters } from "./filters";

export const groupSchema = z.object({
	group: z
		.enum([...groupFilters, "all"])
		.optional()
		.catch(undefined),
});

export type GroupSchema = z.infer<typeof groupSchema>;

export const dateSchema = z.object({
	date: z.iso.date().optional().catch(undefined),
	rivalry: z.string().optional().catch(undefined),
	year: z.number().optional().catch(undefined),
});

export type DateSchema = z.infer<typeof dateSchema>;

export const statSchema = dateSchema.extend(groupSchema.shape);

export type StatSchema = z.infer<typeof statSchema>;

export const battingStatSchema = statSchema.extend({
	filter: z.enum(battingFilters).optional().catch(undefined),
});

export type BattingStatSchema = z.infer<typeof battingStatSchema>;

export const bowlingStatSchema = statSchema.extend({
	filter: z.enum(bowlingFilters).optional().catch(undefined),
});

export type BowlingStatSchema = z.infer<typeof bowlingStatSchema>;

export const fieldingStatSchema = statSchema.extend({
	filter: z.enum(fieldingFilters).optional().catch(undefined),
});

export type FieldingStatSchema = z.infer<typeof fieldingStatSchema>;
