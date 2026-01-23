import { createFileRoute } from "@tanstack/react-router";

import { TabsLayout } from "@/components/tabs/tabs-layout";

function ManOfMatchStatsRoute() {
	return <TabsLayout title="Man of Match Stats"></TabsLayout>;
}

export const Route = createFileRoute("/_stats/stats/man-of-match")({
	component: ManOfMatchStatsRoute,
	head: () => ({ meta: [{ title: "Man of Match Stats" }] }),
});
