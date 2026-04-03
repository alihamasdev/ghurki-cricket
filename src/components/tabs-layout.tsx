import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation, useSearch } from "@tanstack/react-router";

import { DateFilter, type DateFilterProps } from "@/components/date-filter";
import { FilterSheet, type FilterSheetProps } from "@/components/filter-sheet";
import { Button } from "@/components/ui/button";
import { useMenu } from "@/context/menu-context";
import { cn } from "@/lib/utils";

type TabsLayoutProps = React.PropsWithChildren<{
	title: string;
	className?: string;
	dateFilter?: null | DateFilterProps;
	filters?: FilterSheetProps | FilterSheetProps[];
}>;

export function TabsLayout({ title, children, className, dateFilter, filters }: TabsLayoutProps) {
	const { toggleOpen } = useMenu();
	const showFilters = dateFilter !== null || filters !== undefined;
	return (
		<>
			<header className="sticky top-0 z-10 bg-background">
				<div className="container mx-auto grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-2">
					<div className="flex items-center justify-between gap-3">
						<h1 className="text-xl/9 font-semibold capitalize">{title}</h1>
						<Button variant="secondary" size="icon" className="md:hidden" onClick={toggleOpen}>
							<HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
						</Button>
					</div>
					{showFilters && (
						<div className={cn("flex w-full gap-3 *:flex-1 sm:justify-end sm:*:flex-initial")}>
							{filters &&
								(Array.isArray(filters) ? (
									filters.map((filter, index) => <FilterSheet key={index} {...filter} />)
								) : (
									<FilterSheet {...filters} />
								))}
							{dateFilter !== null && <DateFilter {...dateFilter} />}
						</div>
					)}
				</div>
			</header>
			<main className="flex size-full flex-1 flex-col pb-22 sm:pb-10">
				<div className={cn("container mx-auto flex flex-1 flex-col gap-4 px-4", className)}>{children}</div>
			</main>
		</>
	);
}

export function Footer({ forStats }: { forStats?: boolean }) {
	const { pathname } = useLocation();
	const items = forStats ? statsItems.slice(0, 5) : tabItems;
	const searchParams = forStats ? useSearch({ strict: false }) : undefined;
	return (
		<footer className="fixed bottom-0 w-full border-t bg-background md:hidden">
			<div className="container mx-auto grid grid-cols-5 px-1 py-2">
				{items.map((item) => {
					const isCurrentRoute = pathname.startsWith(item.url);
					return (
						<Link key={item.name} to={item.url} search={searchParams} className="group flex flex-col items-center px-1">
							<div
								className={cn(
									"flex w-full max-w-15 justify-center rounded-full py-1.5 transition-colors group-hover:bg-muted-foreground/40",
									isCurrentRoute && "bg-blue-700/40 group-hover:bg-blue-700/40",
								)}
							>
								<img src={item.icon} width={20} height={20} alt={item.name} className="aspect-square size-4" />
							</div>
							<p className={cn("", isCurrentRoute && "font-medium")} style={{ fontSize: 13 }}>
								{item.name}
							</p>
						</Link>
					);
				})}
			</div>
		</footer>
	);
}

export const tabItems = [
	{ name: "Matches", url: "/matches", icon: "/icons/matches.png" },
	{ name: "Stats", url: "/stats", icon: "/icons/stats.png" },
	{ name: "Compare", url: "/compare", icon: "/icons/compare.png" },
	{ name: "Players", url: "/players", icon: "/icons/players.png" },
	{ name: "Expense", url: "/expense", icon: "/icons/expenses.png" },
];

export const statsItems = [
	{ name: "Teams", url: "/stats/teams", icon: "/icons/teams.png" },
	{ name: "Batting", url: "/stats/batting", icon: "/icons/bat.png" },
	{ name: "Bowling", url: "/stats/bowling", icon: "/icons/ball.png" },
	{ name: "Fielding", url: "/stats/fielding", icon: "/icons/fielding.png" },
	{ name: "POTM", url: "/stats/potm", icon: "/icons/medal.png" },
	{ name: "Rankings", url: "/stats/ranking", icon: "/icons/ranking.png" },
	{ name: "Attendance", url: "/stats/attendance", icon: "/icons/attendance.png" },
];
