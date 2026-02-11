import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { DateFilter, dateSearchSchema, type DateSearchSchema } from "@/components/date-filter";
import { TabsLayout } from "@/components/tabs/tabs-layout";
import { Item, ItemContent, ItemDescription, ItemFooter, ItemTitle } from "@/components/ui/item";
import { db } from "@/lib/db";
import { ballsToOvers, formatDate } from "@/lib/utils";

const matchesQueryOptions = ({ date, rivalry }: DateSearchSchema) => {
	return queryOptions({
		queryKey: ["matches", date ?? rivalry ?? "all-time"],
		queryFn: () => getMatches({ data: { date, rivalry } }),
	});
};

const getMatches = createServerFn({ method: "GET" })
	.inputValidator(dateSearchSchema)
	.handler(async ({ data: { date, rivalry } }) => {
		const matches = await db.matches.findMany({
			where: { date: { date, rivalryId: rivalry } },
			orderBy: { id: "asc" },
			include: { innings: true },
		});
		return Object.groupBy(matches, (match) => String(formatDate(match.dateId)));
	});

export const Route = createFileRoute("/_tab/matches/")({
	head: () => ({ meta: [{ title: "Matches" }] }),
	beforeLoad: ({ search }) => ({ date: search.date }),
	loader: async ({ context }) => await context.queryClient.ensureQueryData(matchesQueryOptions(context)),
	component: () => {
		const context = Route.useRouteContext();
		const { data } = useSuspenseQuery(matchesQueryOptions(context));
		return (
			<TabsLayout title="Matches" secondary={<DateFilter />}>
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
