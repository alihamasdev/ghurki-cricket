import dotenv from "dotenv";

dotenv.config({ path: "apps/server/.env" });

import { appRouter } from "../packages/api/src/routers/index";

async function main() {
	const caller = appRouter.createCaller({ auth: null, session: null });

	const filterVariants = [
		{ name: "Unfiltered / default", filter: {} },
		{ name: "Date Range (Year 2026)", filter: { starts: "2026-01-01", ends: "2026-12-31" } },
		{ name: "Exact Date", filter: { date: "2026-10-18" } },
		{ name: "Rivalry", filter: { rivalry: "Jallo vs Mughalpura" } },
	];

	const groups = ["core", "friends", "family", "all"] as const;
	const oversList = [undefined, 4, 6];

	console.log("Starting 10-iteration comprehensive API query benchmark...");
	const startTime = performance.now();

	for (let iteration = 1; iteration <= 10; iteration++) {
		process.stdout.write(`Iteration ${iteration}/10... `);
		const iterStart = performance.now();

		// 1. Filters Router
		await caller.filters.getDatesCount({ hasStats: true });
		await caller.filters.getDatesCount({});
		await caller.filters.listDates();
		await caller.filters.listRivalries();
		await caller.filters.listYears({ hasStats: true });
		await caller.filters.listYears({});

		for (const v of filterVariants) {
			await caller.filters.listOvers(v.filter);
		}

		// 2. Matches Router
		await caller.matches.list({ limit: 10, cursor: 1 });
		await caller.matches.list({ limit: 10, cursor: 1, overs: 4 });
		await caller.matches.list({ limit: 10, cursor: 1, potm: "Ahsan" });

		for (const v of filterVariants) {
			await caller.matches.list({ limit: 10, cursor: 1, ...v.filter });
			await caller.matches.list({ limit: 10, cursor: 1, overs: 4, ...v.filter });
		}

		// 3. Teams Router
		await caller.teams.list();

		for (const overs of oversList) {
			await caller.teams.listStats({ overs });
			await caller.teams.highestRuns({ overs });
			await caller.teams.lowestRuns({ overs });
			await caller.teams.highestChases({ overs });
			await caller.teams.lowestDefended({ overs });
		}

		await caller.teams.consecutiveWins();

		for (const v of filterVariants) {
			await caller.teams.compare({ ...v.filter, overs: 4 });
			await caller.teams.compare({ ...v.filter });
		}

		// 4. Players Router
		for (const group of groups) {
			await caller.players.list({ group });
		}

		await caller.players.compare({ player1: "Ahsan", player2: "Asad" });
		await caller.players.compare({ player1: "Ahsan", player2: "Asad", rivalry: "Jallo vs Mughalpura" });

		// 5. Batting, Bowling, Fielding, Attendance, POTM
		for (const group of groups) {
			for (const v of filterVariants) {
				const statInput = { group, ...v.filter };

				// Batting
				await caller.batting.list(statInput);
				await caller.batting.listAvgPerDay(statInput);
				await caller.batting.mostInSingleDay(statInput);

				// Bowling
				await caller.bowling.list(statInput);
				await caller.bowling.listAvgPerDay(statInput);
				await caller.bowling.mostInSingleDay(statInput);

				// Fielding
				await caller.fielding.list(statInput);
				await caller.fielding.listAvgPerDay(statInput);
				await caller.fielding.mostInSingleDay(statInput);

				// Attendance & POTM
				await caller.attendance.list(statInput);
				await caller.potm.list(statInput);
			}

			await caller.potm.mostInSingleDay({ group });
		}

		// 6. Expense Router
		await caller.expense.list({});
		await caller.expense.list({ starts: "2026-01-01", ends: "2026-12-31" });

		const iterDuration = (performance.now() - iterStart).toFixed(0);
		console.log(`completed in ${iterDuration}ms`);
	}

	const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2);
	console.log(`\nAll 10 iterations completed in ${totalDuration}s!`);
	process.exit(0);
}

main().catch((err) => {
	console.error("Benchmark error:", err);
	process.exit(1);
});
