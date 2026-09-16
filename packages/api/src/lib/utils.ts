export function ballsToOvers(balls: number): string {
	if (balls < 0) return "0.0";
	const completedOvers = Math.floor(balls / 6);
	const remainingBalls = balls % 6;
	return `${completedOvers}.${remainingBalls}`;
}

export function formatDate(inputDate: Date) {
	const date = new Date(inputDate);
	return Intl.DateTimeFormat("us", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	}).format(date);
}

export function formatMatchScore(data: { runs: number; balls: number; wickets: number; allOuts: number }) {
	const overs = ballsToOvers(data.balls);
	if (data.allOuts) return `${data.runs} (${overs})`;
	return `${data.runs}-${data.wickets} (${overs})`;
}
