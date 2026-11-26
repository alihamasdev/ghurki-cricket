import { createFileRoute, Link, linkOptions, Outlet, useLocation, useSearch } from "@tanstack/react-router";

import { Item, ItemTitle } from "@/components/ui/item";

export const Route = createFileRoute("/stats/teams")({
	component: TeamsLayout,
});

const teamStatsLinks = linkOptions([
	{ title: "Team stats", to: "/stats/teams" },
	{ title: "Highest runs by teams in inning", to: "/stats/teams/highest-runs" },
	{ title: "Lowest runs by teams in inning", to: "/stats/teams/lowest-runs" },
	{ title: "Highest successful chase", to: "/stats/teams/highest-successful-chase" },
	{ title: "Lowest score defended", to: "/stats/teams/lowest-score-defended" },
	{ title: "Most consecutive wins", to: "/stats/teams/most-consecutive-wins" },
]);

function TeamsLayout() {
	const { pathname } = useLocation();
	const search = useSearch({ strict: false });

	const currentPath = pathname.replace(/\/$/, "");
	const otherStats = teamStatsLinks.filter((item) => item.to.replace(/\/$/, "") !== currentPath);

	return (
		<>
			<Outlet />
			{otherStats.length > 0 && (
				<section className="space-y-3">
					<h2 className="font-semibold">Other Stats</h2>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{otherStats.map(({ title, to }) => (
							<Item
								key={to}
								render={
									<Link to={to} search={search}>
										<ItemTitle>{title}</ItemTitle>
									</Link>
								}
							/>
						))}
					</div>
				</section>
			)}
		</>
	);
}
