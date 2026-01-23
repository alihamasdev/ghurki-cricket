import { createFileRoute } from "@tanstack/react-router";

import { TabsLayout } from "@/components/tabs/tabs-layout";

function BattingStatsRoute() {
	return <TabsLayout title="Batting Stats"></TabsLayout>;
}

export const Route = createFileRoute("/_stats/stats/batting")({
	component: BattingStatsRoute,
	head: () => ({ meta: [{ title: "Batting Stats" }] }),
});
