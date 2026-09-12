import { Item, ItemContent, ItemMedia, ItemTitle } from "@ghurki-cricket/ui/components/item";
import { Spinner } from "@ghurki-cricket/ui/components/spinner";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { TeamAvatar } from "@/components/avatar";
import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/teams/")({
	component: () => {
		return (
			<PageLayout title="Teams">
				<TeamsRoute />
			</PageLayout>
		);
	},
});

function TeamsRoute() {
	const { data, status } = useQuery(trpc.teams.list.queryOptions());

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
			{data.map((team) => (
				<Item key={team.name}>
					<ItemMedia>
						<TeamAvatar />
					</ItemMedia>
					<ItemContent>
						<ItemTitle>{team.name}</ItemTitle>
					</ItemContent>
				</Item>
			))}
		</div>
	);
}
