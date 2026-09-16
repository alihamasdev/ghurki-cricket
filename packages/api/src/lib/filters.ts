export const battingFilters = [
	"most-runs",
	"best-strike-rate",
	"best-average",
	"highest-score",
	"most-not-outs",
	"most-fours",
	"most-sixes",
	"most-ducks",
	"most-thirties",
	"most-fifties",
] as const;

export type BattingFilter = (typeof battingFilters)[number];

export const bowlingFilters = [
	"most-wickets",
	"most-runs",
	"best-economy",
	"best-average",
	"most-dots",
	"most-wides",
	"most-no-balls",
	"most-2fr",
	"most-3fr",
] as const;

export type BowlingFilter = (typeof bowlingFilters)[number];

export const fieldingFilters = ["most-catches", "most-run-outs"] as const;

export type FieldingFilter = (typeof fieldingFilters)[number];

export const groupFilters = ["core", "friends", "family"] as const;

export type GroupFilter = (typeof groupFilters)[number];
