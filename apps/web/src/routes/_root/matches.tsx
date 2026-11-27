import { matchSchema } from "@ghurki-cricket/api/schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DateFilter } from "@/components/filters/date-filter";
import { OversFilter } from "@/components/filters/overs-filter";
import { PageError, PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemDescription, ItemFooter, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { seo } from "@/lib/seo";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_root/matches")({
	validateSearch: matchSchema,
	head: () => seo("Matches", "Browse all cricket matches, scores, dates, and match results for Ghurki Cricket."),
	component: () => {
		return (
			<PageLayout
				title="Matches"
				headerRight={
					<div className="flex gap-2 sm:justify-end">
						<OversFilter />
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
	const { potm, overs, rivalry, date, starts, ends } = Route.useSearch();

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, error } = useInfiniteQuery(
		trpc.matches.list.infiniteQueryOptions(
			{ potm, overs, rivalry, date, starts, ends },
			{ getNextPageParam: (lastPage) => lastPage.nextPage, initialCursor: 1 },
		),
	);

	if (isPending) {
		return Array.from({ length: 10 }).map((_, i) => (
			<section key={i} className="space-y-2">
				<Skeleton className="h-6 w-25" />
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
					<Skeleton className="h-24" />
					<Skeleton className="h-24" />
					<Skeleton className="h-24" />
				</div>
			</section>
		));
	}

	if (isError) {
		return <PageError error={error.message} />;
	}

	const allMatches = data?.pages.flatMap((page) => page.matches) ?? [];

	if (allMatches.length === 0) {
		return <div className="flex h-50 items-center justify-center squircle border text-sm text-muted-foreground">No results found</div>;
	}

	const groupedMatches: Record<string, typeof allMatches> = {};

	for (const match of allMatches) {
		if (!groupedMatches[match.date]) {
			groupedMatches[match.date] = [];
		}

		groupedMatches[match.date].push(match);
	}

	for (const date in groupedMatches) {
		groupedMatches[date].sort((a, b) => a.id - b.id);
	}

	const dates = Object.keys(groupedMatches);

	return (
		<>
			{dates.map((date) => {
				const matches = groupedMatches[date] || [];

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
			})}

			{hasNextPage && (
				<div className="flex justify-center py-8">
					<Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
						{isFetchingNextPage && <Spinner className="size-4" />}
						{isFetchingNextPage ? "Loading..." : "Load more"}
					</Button>
				</div>
			)}
		</>
	);
}
