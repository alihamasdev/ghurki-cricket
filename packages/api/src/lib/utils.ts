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
