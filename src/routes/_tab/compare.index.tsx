import { createFileRoute } from "@tanstack/react-router";

import { TabsLayout } from "@/components/tabs/tabs-layout";

function CompareRoute() {
	return <TabsLayout title="Compare"></TabsLayout>;
}

export const Route = createFileRoute("/_tab/compare/")({
	component: CompareRoute,
	head: () => ({ meta: [{ title: "Compare" }] }),
});
