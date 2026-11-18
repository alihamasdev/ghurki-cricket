export const groupFilters = ["core", "friends", "family"] as const;

export type GroupFilter = (typeof groupFilters)[number];
