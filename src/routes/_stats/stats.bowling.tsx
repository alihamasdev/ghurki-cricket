import { createFileRoute } from "@tanstack/react-router";

import { TabsLayout } from "@/components/tabs/tabs-layout";

function BowlingStatsRoute() {
	return <TabsLayout title="Bowling Stats"></TabsLayout>;
}

export const Route = createFileRoute("/_stats/stats/bowling")({
	component: BowlingStatsRoute,
	head: () => ({ meta: [{ title: "Bowling Stats" }] }),
});
