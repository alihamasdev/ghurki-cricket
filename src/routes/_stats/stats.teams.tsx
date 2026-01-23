import { createFileRoute } from "@tanstack/react-router";

import { TabsLayout } from "@/components/tabs/tabs-layout";

function TeamStatsRoute() {
	return <TabsLayout title="Teams Stats"></TabsLayout>;
}

export const Route = createFileRoute("/_stats/stats/teams")({
	component: TeamStatsRoute,
	head: () => ({ meta: [{ title: "Teams Stats" }] }),
});
