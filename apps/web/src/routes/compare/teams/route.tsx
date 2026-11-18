import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/compare/teams")({
	component: () => {
		return (
			<>
				<Outlet />
				<h2 className="text-xl/9 font-semibold">Other Stats</h2>
			</>
		);
	},
});
