import { router } from "../index";
import { matchesRouter } from "./matches";
import { teamsRouter } from "./teams";
import { playerRouter } from "./players";
import { expenseRouter } from "./expense";
import { battingRouter } from "./batting";
import { bowlingRouter } from "./bowling";
import { fieldingRouter } from "./fielding";
import { potmRouter } from "./potm";
import { attendanceRouter } from "./attendance";

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
});

export type AppRouter = typeof appRouter;
