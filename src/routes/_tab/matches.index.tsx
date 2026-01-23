import { createFileRoute } from "@tanstack/react-router";

import { DateFilter } from "@/components/date-filter";
import { TabsLayout } from "@/components/tabs/tabs-layout";

function MatchesRoute() {
	return (
		<TabsLayout title="Matches">
			<DateFilter />
		</TabsLayout>
	);
}

export const Route = createFileRoute("/_tab/matches/")({
	component: MatchesRoute,
	head: () => ({ meta: [{ title: "Matches" }] }),
});
