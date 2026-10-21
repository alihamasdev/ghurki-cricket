import { matchSchema } from "@ghurki-cricket/api/schema";
import { Item, ItemContent, ItemDescription, ItemFooter, ItemTitle } from "@ghurki-cricket/ui/components/item";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DateFilter } from "@/components/filters/date-filter";
import { OversFilter } from "@/components/filters/overs-filter";
import { PageError, PageLayout, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/matches/")({
	validateSearch: matchSchema,
	head: () => ({
		meta: [
			{ title: "Matches | Ghurki Cricket" },
			{ name: "description", content: "Browse all cricket matches, scores, dates, and match results for Ghurki Cricket." },
		],
	}),
	component: () => {
		return (
			<PageLayout
				title="Matches"
				headerRight={
					<div className="flex gap-2 sm:justify-end">
						<OversFilter />
						<DateFilter hasPeriods={false} />
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

	const dates = Object.keys(data ?? {});

	if (dates.length === 0) {
		return (
			<div className="flex h-50 items-center justify-center rounded-md border text-sm text-muted-foreground">
				No results found
			</div>
		);
	}

	return dates
		.reverse()
		.map((date) => {
			const matches = data[date] || [];
			return (
				<section key={date} className="space-y-2">
					<h2 className="font-semibold">{date}</h2>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
						{matches.map((match) => (
							<Item key={match.id} size="sm" className="items-start">
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
