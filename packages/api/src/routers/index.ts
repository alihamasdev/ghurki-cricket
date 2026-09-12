import { router } from "../index";
import { matchesRouter } from "./matches";
import { teamsRouter } from "./teams";
import { playerRouter } from "./players";

export const appRouter = router({
	matches: matchesRouter,
	teams: teamsRouter,
	players: playerRouter,
});

export type AppRouter = typeof appRouter;
