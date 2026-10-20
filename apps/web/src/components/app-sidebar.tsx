import {
	battingStatSchema,
	bowlingStatSchema,
	compareTeamSchema,
	fieldingStatSchema,
	groupSchema,
	matchSchema,
	statSchema,
} from "@ghurki-cricket/api/schema";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@ghurki-cricket/ui/components/sidebar";
import { Link, useLocation, useSearch } from "@tanstack/react-router";
import { type ZodType } from "zod";

import {
	BallIcon,
	BatIcon,
	CalendarIcon,
	MatchesIcon,
	MedalIcon,
	PlayersIcon,
	StumprIcon,
	StumpsIcon,
	TeamsIcon,
	WalletIcon,
	TeamVsTeamIcon,
	type Icon,
} from "@/components/icons";

type SidebarItem = Array<{
	name: string;
	href: string;
	icon: Icon;
	search?: ZodType;
}>;

type SidebarList = Array<{
	label?: string;
	items: SidebarItem;
}>;

export const sidebarList: SidebarList = [
	{
		items: [
			{ name: "Matches", href: "/matches", icon: MatchesIcon, search: matchSchema },
			{ name: "Teams", href: "/teams", icon: TeamsIcon },
			{ name: "Players", href: "/players", icon: PlayersIcon, search: groupSchema },
			{ name: "Expense", href: "/expense", icon: WalletIcon },
		],
	},
	{
		label: "Stats",
		items: [
			{ name: "Batting", href: "/stats/batting", icon: BatIcon, search: battingStatSchema },
			{ name: "Bowling", href: "/stats/bowling", icon: BallIcon, search: bowlingStatSchema },
			{ name: "Fielding", href: "/stats/fielding", icon: StumpsIcon, search: fieldingStatSchema },
			{ name: "POTM", href: "/stats/potm", icon: MedalIcon, search: statSchema },
			{ name: "Attendance", href: "/stats/attendance", icon: CalendarIcon, search: statSchema },
		],
	},
	{
		label: "Compare",
		items: [{ name: "Team vs Team", href: "/compare/teams", icon: TeamVsTeamIcon, search: compareTeamSchema }],
	},
];

export function AppSidebar() {
	const { state } = useSidebar();
	const { pathname } = useLocation();
	const search = useSearch({ strict: false }) ?? {};

	return (
		<Sidebar variant="floating" collapsible="icon">
			<SidebarHeader>
				<Link to="/" className="flex h-9 items-center justify-center">
					{state === "expanded" ? (
						<h1 className="text-center text-xl font-semibold">Ghurki Cricket</h1>
					) : (
						<StumprIcon className="size-4 fill-primary" />
					)}
				</Link>
			</SidebarHeader>
			<SidebarContent>
				{sidebarList.map(({ label, items }, index) => (
					<SidebarGroup key={index}>
						{label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
						<SidebarGroupContent>
							<SidebarMenu>
								{items.map(({ name, href, icon: Icon, search: itemSchema }) => {
									const parsed = itemSchema?.safeParse(search);
									const itemSearch = parsed?.success
										? Object.fromEntries(
												Object.entries((parsed.data ?? {}) as Record<string, unknown>).filter(([_v, value]) => value !== undefined),
											)
										: {};

									return (
										<SidebarMenuItem key={name}>
											<SidebarMenuButton
												tooltip={name}
												isActive={pathname.startsWith(href)}
												render={
													<Link to={href} search={itemSearch}>
														<Icon />
														{name}
													</Link>
												}
											/>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
		</Sidebar>
	);
}
