import { router } from "../index";
import { matchesRouter } from "./matches";
import { teamsRouter } from "./teams";
import { playerRouter } from "./players";
import { expenseRouter } from "./expense";

export const appRouter = router({
	matches: matchesRouter,
	teams: teamsRouter,
	players: playerRouter,
	expense: expenseRouter,
});

export type AppRouter = typeof appRouter;
