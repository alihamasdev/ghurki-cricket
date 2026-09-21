export function ballsToOvers(balls: number): string {
	if (balls < 0) return "0.0";
	const completedOvers = Math.floor(balls / 6);
	const remainingBalls = balls % 6;
	return `${completedOvers}.${remainingBalls}`;
}

export function formatDate(inputDate: Date | string, type: "short" | "numeric" = "numeric"): string {
	const date = new Date(inputDate);

	if (type === "short") {
		return Intl.DateTimeFormat("us", {
			month: "short",
			day: "2-digit",
			year: "numeric",
		}).format(date);
	}

	return date.toISOString().split("T")[0]!;
}

export function formatMatchScore(data: { runs: number; balls: number; wickets: number; allOuts: number }): string {
	const overs = ballsToOvers(data.balls);
	if (data.allOuts) return `${data.runs} (${overs})`;
	return `${data.runs}-${data.wickets} (${overs})`;
}

export function calcBattingAverage(data: { runs: number | null; innings: number | null; notOuts: number | null }): number {
	const runs = data.runs ?? 0;
	const innings = data.innings ?? 0;
	const notOuts = data.notOuts ?? 0;
	const dismissals = innings - notOuts;
	return dismissals > 0 ? runs / dismissals : runs;
}

export function calcStrikeRate(data: { runs: number | null; balls: number | null }): number {
	const runs = data.runs ?? 0;
	const balls = data.balls ?? 0;
	if (balls === 0) return 0;
	return (runs / balls) * 100;
}

export function calcBowlingAverage(data: { runs: number | null; wickets: number | null }): number {
	const runs = data.runs ?? 0;
	const wickets = data.wickets ?? 0;
	if (wickets === 0) return Infinity;
	return runs / wickets;
}

export function calcBowlingEconomy(data: { runs: number | null; balls: number | null }): number {
	const runs = data.runs ?? 0;
	const balls = data.balls ?? 0;
	if (balls === 0) return Infinity;
	return (runs / balls) * 6;
}
