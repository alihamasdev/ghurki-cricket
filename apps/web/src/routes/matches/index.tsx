import { dateSchema } from "@ghurki-cricket/api/schema";
import { Item, ItemContent, ItemDescription, ItemFooter, ItemTitle } from "@ghurki-cricket/ui/components/item";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DateFilter } from "@/components/date-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/matches/")({
	validateSearch: dateSchema,
	component: () => {
		return (
			<PageLayout
				title="Matches"
				headerRight={
					<div className="flex sm:justify-end">
						<DateFilter />
					</div>
				}
			>
				<HomeRoute />
			</PageLayout>
		);
	},
});

function HomeRoute() {
	const search = Route.useSearch();
	const { data, status, error } = useQuery(trpc.matches.list.queryOptions(search));

	if (status === "pending") {
		return <PageLoader />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
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
											<ItemDescription className="text-sm">{inning.score}</ItemDescription>
										</div>
									))}
								</ItemContent>
								<ItemFooter>
									<ItemDescription className="text-sm">{match.result}</ItemDescription>
								</ItemFooter>
							</Item>
						))}
					</div>
				</section>
			);
		});
}
