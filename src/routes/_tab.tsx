import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";

import { Footer } from "@/components/tabs-layout";

export const Route = createFileRoute("/_tab")({
	component: () => (
		<>
			<Outlet />
			<Footer />
		</>
	),
});
