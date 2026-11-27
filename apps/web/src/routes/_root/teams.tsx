import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { TeamAvatar } from "@/components/avatar";
import { PageError, PageLayout } from "@/components/page-layout";
import { Item, ItemContent, ItemMedia, ItemTitle, ItemDescription } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { seo } from "@/lib/seo";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_root/teams")({
	head: () => seo("Teams", "Explore teams, team logos, and squad information for Ghurki Cricket."),
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
