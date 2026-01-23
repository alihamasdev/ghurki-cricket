import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { PlayerAvatar } from "@/components/players/avatar";
import { playerQueryOptions } from "@/components/players/query";
import { TabsLayout } from "@/components/tabs/tabs-layout";
import { Item, ItemContent, ItemTitle, ItemMedia } from "@/components/ui/item";

function PlayersRoute() {
	const { data } = useSuspenseQuery(playerQueryOptions());
	return (
		<TabsLayout title="Players">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{data.map((player) => (
					<Item key={player.name} variant="outline" className="flex-row" asChild>
						<Link to={"/players/$playerId"} params={{ playerId: player.name.toLowerCase() }}>
							<ItemMedia variant="image" className="size-8 rounded-full border bg-muted">
								<PlayerAvatar name={player.name} />
							</ItemMedia>
							<ItemContent>
								<ItemTitle>{player.name}</ItemTitle>
							</ItemContent>
						</Link>
					</Item>
				))}
			</div>
		</TabsLayout>
	);
}

export const Route = createFileRoute("/_tab/players/")({
	component: PlayersRoute,
	head: () => ({ meta: [{ title: "Players" }] }),
});
