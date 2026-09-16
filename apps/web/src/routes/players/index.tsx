import { groupSchema } from "@ghurki-cricket/api/schema";
import { Item, ItemContent, ItemMedia, ItemTitle, ItemDescription } from "@ghurki-cricket/ui/components/item";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerAvatar } from "@/components/avatar";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/players/")({
	validateSearch: groupSchema,
	component: () => {
		return (
			<PageLayout title="Players">
				<PlayersRoute />
			</PageLayout>
		);
	},
});

function PlayersRoute() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.players.list.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{data.map((player) => (
				<Item key={player.name}>
					<ItemMedia>
						<PlayerAvatar name={player.name} size="default" />
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
