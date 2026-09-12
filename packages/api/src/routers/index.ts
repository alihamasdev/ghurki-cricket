import { publicProcedure, router } from "../index";
import { matchesRouter } from "./matches";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),

	matches: matchesRouter,
});

export type AppRouter = typeof appRouter;
