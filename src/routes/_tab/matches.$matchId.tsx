import { createFileRoute } from "@tanstack/react-router";

import { TabsLayout } from "@/components/tabs-layout";

export const Route = createFileRoute("/_tab/matches/$matchId")({
	head: ({ params }) => ({ meta: [{ title: params.matchId }] }),
	component: () => {
		const { matchId } = Route.useParams();
		return <TabsLayout title={matchId} filters={{ date: false }}></TabsLayout>;
	},
});
