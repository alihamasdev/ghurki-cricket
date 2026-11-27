import { groupSchema } from "@ghurki-cricket/api/schema";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerAvatar } from "@/components/avatar";
import { PageError, PageLayout } from "@/components/page-layout";
import { Item, ItemContent, ItemMedia, ItemTitle, ItemDescription } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { seo } from "@/lib/seo";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_root/players")({
	validateSearch: groupSchema,
	head: () => seo("Players", "View all player profiles and squad rosters for Ghurki Cricket."),
	component: () => {
		return (
			<PageLayout title="Players">
				<PlayersRoute />
			</PageLayout>
		);
	},
});

function PlayersRoute() {
	const { group } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.players.list.queryOptions({ group }));

	if (status === "pending") {
		return (
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{Array.from({ length: 10 }).map((_, i) => (
					<Skeleton key={i} className="h-16" />
				))}
			</div>
		);
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{data.map((player) => (
				<Item key={player.name}>
					<ItemMedia>
						<PlayerAvatar name={player.name} size="default" variant="profile" />
					</ItemMedia>
					<ItemContent>
						<ItemTitle>{player.name}</ItemTitle>
						<ItemDescription>{player.role}</ItemDescription>
					</ItemContent>
				</Item>
			))}
		</div>
	);
}
