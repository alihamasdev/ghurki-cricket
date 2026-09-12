import { Item, ItemContent, ItemDescription, ItemFooter, ItemTitle } from "@ghurki-cricket/ui/components/item";
import { Spinner } from "@ghurki-cricket/ui/components/spinner";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageLayout } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/matches/")({
	component: () => {
		return (
			<PageLayout title="Matches">
				<HomeRoute />
			</PageLayout>
		);
	},
});

function HomeRoute() {
	const { data, status } = useQuery(trpc.matches.list.queryOptions());

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

	return Object.keys(data)
		.reverse()
		.map((date) => {
			const matches = data[date] || [];
			return (
				<section key={date} className="space-y-2">
					<h2 className="font-semibold">{date}</h2>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
						{matches.map((match) => (
							<Item key={match.id} variant="outline" className="items-start gap-1">
								<ItemContent>
									{match.innings.map((inning) => (
										<div key={inning.id} className="flex items-center justify-between gap-3">
											<ItemTitle>{inning.team}</ItemTitle>
											<ItemDescription>{inning.score}</ItemDescription>
										</div>
									))}
								</ItemContent>
								<ItemFooter>
									<ItemDescription>{match.result}</ItemDescription>
								</ItemFooter>
							</Item>
						))}
					</div>
				</section>
			);
		});
}
