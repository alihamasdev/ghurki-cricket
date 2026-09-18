import { router } from "../index";
import { attendanceRouter } from "./attendance";
import { battingRouter } from "./batting";
import { bowlingRouter } from "./bowling";
import { datesRouter } from "./dates";
import { expenseRouter } from "./expense";
import { fieldingRouter } from "./fielding";
import { matchesRouter } from "./matches";
import { playerRouter } from "./players";
import { potmRouter } from "./potm";
import { teamsRouter } from "./teams";

export const appRouter = router({
	matches: matchesRouter,
	teams: teamsRouter,
	players: playerRouter,
	expense: expenseRouter,
	attendance: attendanceRouter,
	batting: battingRouter,
	bowling: bowlingRouter,
	fielding: fieldingRouter,
	potm: potmRouter,
	dates: datesRouter,
});

export type AppRouter = typeof appRouter;
