export type BattingStats = {
	player: string;
	innings: number;
	runs: number;
	balls: number;
	highest_score: number;
	not_outs: number;
	strike_rate: number;
	average: number;
	fours: number;
	fours_ratio: number;
	sixes: number;
	six_ratio: number;
	ducks: number;
	ducks_ratio: number;
	thirties: number;
	fifties: number;
};

export type BowlingStats = {
	player: string;
	innings: number;
	runs: number;
	wickets: number;
	balls: number;
	economy: number;
	average: number;
	dots: number;
	dots_ratio: number;
	wides: number;
	wides_ratio: number;
	no_balls: number;
	"2fr": number;
	"3fr": number;
};

export type FieldingStats = {
	player: string;
	innings: number;
	catches: number;
	runOuts: number;
};

export type POTMStats = {
	player: string;
	count: number;
};

export type RankingStats = {
	player: string;
	rank: number;
	rating: number;
};

export type TeamStats = {
	team: string;
	playedMatches: number;
	wonMatches: number;
	winPercent: number;
	totalRuns: number;
	totalBalls: number;
	totalWickets: number;
	totalAllOuts: number;
	strikeRate: number;
	lowestScore: string;
	highestScore: string;
};

export type Expense = {
	date: string;
	groundFee: number;
	gearCost: number;
	total: number;
};

export type AttendanceStats = {
	player: string;
	present: number;
	percentage: number;
};
