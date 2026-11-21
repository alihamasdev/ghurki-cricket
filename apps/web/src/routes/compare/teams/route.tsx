import { createFileRoute, Link, linkOptions, Outlet, useLocation, useSearch } from "@tanstack/react-router";

import { Item, ItemTitle } from "@/components/ui/item";

export const Route = createFileRoute("/compare/teams")({
	component: TeamsCompareLayout,
});

const teamStatsLinks = linkOptions([
	{ title: "Team vs Team", to: "/compare/teams" },
	{ title: "Highest runs by teams", to: "/compare/teams/highest-runs" },
	{ title: "Lowest runs by teams", to: "/compare/teams/lowest-runs" },
	{ title: "Highest successful chase", to: "/compare/teams/highest-successful-chase" },
	{ title: "Lowest score defended", to: "/compare/teams/lowest-score-defended" },
	{ title: "Most consecutive wins", to: "/compare/teams/most-consecutive-wins" },
]);

function TeamsCompareLayout() {
	const { pathname } = useLocation();
	const search = useSearch({ strict: false });

	const currentPath = pathname.replace(/\/$/, "");
	const otherStats = teamStatsLinks.filter((item) => item.to.replace(/\/$/, "") !== currentPath);

	return (
		<>
			<Outlet />
			{otherStats.length > 0 && (
				<section className="space-y-3">
					<h2 className="text-xl/9 font-semibold">Other Stats</h2>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{otherStats.map(({ title, to }) => {
							const targetSearch = to === "/compare/teams" ? search : search?.overs ? { overs: search.overs } : {};
							return (
								<Item
									key={to}
									render={
										<Link to={to} search={targetSearch}>
											<ItemTitle>{title}</ItemTitle>
										</Link>
									}
								/>
							);
						})}
					</div>
				</section>
			)}
		</>
	);
}
