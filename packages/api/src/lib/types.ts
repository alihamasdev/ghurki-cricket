export type BattingStats = {
	player: string;
	innings: number;
	runs: number;
	balls: number;
	notOuts: number;
	fours: number;
	sixes: number;
	ducks: number;
	thirties: number;
	fifties: number;
	highestScore: number;
	strikeRate: number;
	average: number;
};

export type OtherBattingStats = {
	player: string;
	innings: number;
	runs: number;
	balls: number;
	fours: number;
	sixes: number;
	thirties: number;
};

export type BowlingStats = {
	player: string;
	innings: number;
	runs: number;
	balls: number;
	wickets: number;
	dots: number;
	wides: number;
	noBalls: number;
	twoFR: number;
	threeFR: number;
	economy: number | null;
	average: number | null;
};

export type OtherBowlingStats = {
	player: string;
	innings: number;
	runs: number;
	balls: number;
	wickets: number;
	dots: number;
	wides: number;
	twoFR: number;
};

export type FieldingStats = {
	player: string;
	innings: number;
	catches: number;
	runOuts: number;
};

export type POTMStats = {
	player: string;
	potm: number;
};

export type AttendanceStats = {
	player: string;
	attendance: string;
	percentage: number;
};

export type TeamInningStat = {
	team: string;
	score: string;
	overs: number;
	runRate: string;
	date: string;
};

export type TeamHighestChaseStat = {
	team: string;
	target: number;
	score: string;
	overs: number;
	potm: string;
	date: string;
};

export type TeamLowestDefendedStat = {
	team: string;
	target: number;
	score: string;
	overs: number;
	potm: string;
	date: string;
};

export type TeamConsecutiveWinsStat = {
	team: string;
	wins: number;
};

export type ExpenseStats = {
	ground: string;
	days: number;
	expense: number;
};

export type ExpenseSummary = {
	days: number;
	groundExpense: number;
	gearExpense: number;
	totalExpense: number;
};

export type ExpenseData = {
	summary: ExpenseSummary;
	expenses: ExpenseStats[];
};
