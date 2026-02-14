import { createFileRoute } from "@tanstack/react-router";

import { TabsLayout } from "@/components/tabs-layout";

export const Route = createFileRoute("/_tab/compare/")({
	head: () => ({ meta: [{ title: "Compare" }] }),
	component: () => {
		return <TabsLayout title="Compare" filters={{ date: false }}></TabsLayout>;
	},
});
