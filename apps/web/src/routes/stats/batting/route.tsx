import { createFileRoute, Link, linkOptions, Outlet, useLocation, useSearch } from "@tanstack/react-router";

import { Item, ItemTitle } from "@/components/ui/item";

export const Route = createFileRoute("/stats/batting")({
	component: BattingLayout,
});

const battingStatsLinks = linkOptions([
	{ title: "Batting stats", to: "/stats/batting" },
	{ title: "Average day stats", to: "/stats/batting/average-day" },
	{ title: "Most in single day stats", to: "/stats/batting/most-in-single-day" },
	{ title: "Timeline", to: "/stats/batting/timeline" },
]);

function BattingLayout() {
	const { pathname } = useLocation();
	const search = useSearch({ strict: false });

	const currentPath = pathname.replace(/\/$/, "");
	const otherStats = battingStatsLinks.filter((item) => item.to.replace(/\/$/, "") !== currentPath);

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
