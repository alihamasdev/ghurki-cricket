import { createFileRoute, Link, linkOptions, Outlet, useLocation, useSearch } from "@tanstack/react-router";

import { Item, ItemTitle } from "@/components/ui/item";

export const Route = createFileRoute("/stats/bowling")({
	component: BowlingLayout,
});

const bowlingStatsLinks = linkOptions([
	{ title: "Bowling stats", to: "/stats/bowling" },
	{ title: "Average day stats", to: "/stats/bowling/average-day" },
	{ title: "Most in single day", to: "/stats/bowling/most-in-single-day" },
]);

function BowlingLayout() {
	const { pathname } = useLocation();
	const search = useSearch({ strict: false });

	const currentPath = pathname.replace(/\/$/, "");
	const otherStats = bowlingStatsLinks.filter((item) => item.to.replace(/\/$/, "") !== currentPath);

	return (
		<>
			<Outlet />
			{otherStats.length > 0 && (
				<section className="space-y-3">
					<h2 className="text-xl/9 font-semibold">Other Stats</h2>
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
