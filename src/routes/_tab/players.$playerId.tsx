import { createFileRoute } from "@tanstack/react-router";

import { TabsLayout } from "@/components/tabs/tabs-layout";

export const Route = createFileRoute("/_tab/players/$playerId")({
	head: ({ params }) => ({ meta: [{ title: params.playerId }] }),
	component: () => {
		const { playerId } = Route.useParams();
		return <TabsLayout title={playerId}></TabsLayout>;
	},
});
