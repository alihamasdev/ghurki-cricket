import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { DateFilter, type DateFilterProps } from "@/components/date-filter";
import { StatsFilter, type StatsFilterProps } from "@/components/stats-filter";
import { Button } from "@/components/ui/button";
import { useMenu } from "@/context/menu-context";
import { cn } from "@/lib/utils";

type TabsLayoutProps = React.PropsWithChildren<{
	title: string;
	className?: string;
	filters?: {
		date?: false | DateFilterProps;
		stats?: false | StatsFilterProps;
		className?: string;
	};
}>;

export function TabsLayout({ title, children, className, filters = {} }: TabsLayoutProps) {
	const { toggleOpen } = useMenu();
	return (
		<>
			<header>
				<div className="container mx-auto grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-2">
					<div className="flex items-center gap-3">
						<Button variant="secondary" size="icon" onClick={toggleOpen}>
							<HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
						</Button>
						<h1 className="text-xl/9 font-semibold capitalize">{title}</h1>
					</div>
					<div className={cn("flex w-full gap-3 *:flex-1 sm:*:flex-initial md:justify-end", filters.className)}>
						{filters.stats && <StatsFilter {...filters.stats} />}
						{filters.date !== false && <DateFilter {...filters.date} />}
					</div>
				</div>
			</header>
			<div className="h-full flex-1 overflow-y-auto">
				<div className={cn("container mx-auto flex flex-col gap-4 px-4 pb-3", className)}>{children}</div>
			</div>
		</>
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
];
