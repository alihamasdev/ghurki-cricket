import { Item, ItemContent, ItemMedia, ItemTitle } from "@ghurki-cricket/ui/components/item";
import { Spinner } from "@ghurki-cricket/ui/components/spinner";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PlayerAvatar } from "@/components/avatar";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/players/")({
	component: () => {
		return (
			<PageLayout title="Players">
				<PlayersRoute />
			</PageLayout>
		);
	},
});

function PlayersRoute() {
	const { data, status } = useQuery(trpc.players.list.queryOptions());

	if (status === "pending") {
		return <Spinner className="mx-auto" />;
	}

	if (status === "error") {
		return (
			<div className="flex-1 flex items-center justify-center">
				<p>Something went wrong, please try again.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{data.map((player) => (
				<Item key={player.name}>
					<ItemMedia>
						<PlayerAvatar src={player.image} name={player.name} />
					</ItemMedia>
					<ItemContent>
						<ItemTitle>{player.name}</ItemTitle>
					</ItemContent>
				</Item>
			))}
		</div>
	);
}
