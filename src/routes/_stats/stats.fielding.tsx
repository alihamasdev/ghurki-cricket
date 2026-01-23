import { createFileRoute } from "@tanstack/react-router";

import { TabsLayout } from "@/components/tabs/tabs-layout";

function FieldingStatsRoute() {
	return <TabsLayout title="Fielding Stats"></TabsLayout>;
}

export const Route = createFileRoute("/_stats/stats/fielding")({
	component: FieldingStatsRoute,
	head: () => ({ meta: [{ title: "Fielding Stats" }] }),
});
