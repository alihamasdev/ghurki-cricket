export function ballsToOvers(balls: number): string {
	if (balls < 0) return "0.0";
	const completedOvers = Math.floor(balls / 6);
	const remainingBalls = balls % 6;
	return `${completedOvers}.${remainingBalls}`;
}

export function formatDate(inputDate: Date | string, type: "short" | "numeric" = "numeric"): string {
	const date =
		typeof inputDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(inputDate) ? new Date(`${inputDate}T00:00:00`) : new Date(inputDate);

	if (type === "short") {
		return Intl.DateTimeFormat("us", {
			month: "short",
			day: "2-digit",
			year: "numeric",
		}).format(date);
	}

	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
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

export function calcBowlingAverage(data: { runs: number | null; wickets: number | null }): number | null {
	const runs = data.runs ?? 0;
	const wickets = data.wickets ?? 0;
	if (wickets === 0) return null;
	return runs / wickets;
}

export function calcBowlingEconomy(data: { runs: number | null; balls: number | null }): number | null {
	const runs = data.runs ?? 0;
	const balls = data.balls ?? 0;
	if (balls === 0) return null;
	return (runs / balls) * 6;
}
