import { Item, ItemContent, ItemMedia, ItemTitle, ItemDescription } from "@ghurki-cricket/ui/components/item";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { TeamAvatar } from "@/components/avatar";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/teams/")({
	head: () => ({
		meta: [
			{ title: "Teams | Ghurki Cricket" },
			{ name: "description", content: "Explore teams, team logos, and squad information for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout title="Teams">
				<TeamsRoute />
			</PageLayout>
		);
	},
});

function TeamsRoute() {
	const { data, status, error } = useQuery(trpc.teams.list.queryOptions());

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{data.map((team) => (
				<Item key={team.name}>
					<ItemMedia>
						<TeamAvatar name={team.name} />
					</ItemMedia>
					<ItemContent>
						<ItemTitle>{team.name}</ItemTitle>
						<ItemDescription>{team.slug}</ItemDescription>
					</ItemContent>
				</Item>
			))}
		</div>
	);
}
