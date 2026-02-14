import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { TabsLayout } from "@/components/tabs-layout";
import { Item, ItemContent, ItemDescription, ItemFooter, ItemTitle } from "@/components/ui/item";
import { db } from "@/lib/db";
import { ballsToOvers, formatDate } from "@/lib/utils";

const matchesQueryOptions = () => {
	return queryOptions({
		queryKey: ["matches"],
		queryFn: () => getMatches(),
	});
};

const getMatches = createServerFn({ method: "GET" }).handler(async () => {
	const matches = await db.matches.findMany({
		orderBy: { id: "asc" },
		include: { innings: true },
	});
	return Object.groupBy(matches, (match) => String(formatDate(match.dateId)));
});

export const Route = createFileRoute("/_tab/matches/")({
	head: () => ({ meta: [{ title: "Matches" }] }),
	loader: async ({ context }) => await context.queryClient.ensureQueryData(matchesQueryOptions()),
	component: () => {
		const { data } = useSuspenseQuery(matchesQueryOptions());
		return (
			<TabsLayout title="Matches" filters={{ date: false }}>
				{Object.keys(data)
					.reverse()
					.map((date) => {
						const matches = data[date] || [];
						return (
							<section key={date} className="space-y-2">
								<h2 className="font-semibold">{date}</h2>
								<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
									{matches.map(({ id, innings, winnerId, winBy }) => (
										<Item key={id} variant="outline" className="items-start gap-1" asChild>
											<Link to="/matches/$matchId" params={{ matchId: id.toString() }}>
												<ItemContent>
													{innings.map((inning) => (
														<div key={inning.id} className="flex items-center justify-between gap-3">
															<ItemTitle>{inning.teamId}</ItemTitle>
															<ItemDescription>
																{`${inning.runs}${!inning.allOuts ? `-${inning.wickets}` : ""}  (${ballsToOvers(inning.balls)})`}
															</ItemDescription>
														</div>
													))}
												</ItemContent>
												<ItemFooter>
													<ItemDescription>{`${winnerId} ${winBy ? `wins by ${winBy}` : `wins`}`}</ItemDescription>
												</ItemFooter>
											</Link>
										</Item>
									))}
								</div>
							</section>
						);
					})}
			</TabsLayout>
		);
	},
});
