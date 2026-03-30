import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";

import { dateSearchSchema } from "@/components/date-filter";
import { Footer } from "@/components/tabs-layout";

export const Route = createFileRoute("/_stats")({
	validateSearch: dateSearchSchema,
	component: () => (
		<>
			<Outlet />
			<Footer forStats />
		</>
	),
});
