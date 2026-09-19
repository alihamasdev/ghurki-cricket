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
} from "@/components/icons";

type SidebatList = Array<{
	label?: string;
	items: Array<{
		name: string;
		href: string;
		icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
	}>;
}>;

export const sidebarList: SidebatList = [
	{
		items: [
			{ name: "Matches", href: "/matches", icon: MatchesIcon },
			{ name: "Teams", href: "/teams", icon: TeamsIcon },
			{ name: "Players", href: "/players", icon: PlayersIcon },
			{ name: "Expense", href: "/expense", icon: WalletIcon },
		],
	},
	{
		label: "Stats",
		items: [
			{ name: "Batting", href: "/stats/batting", icon: BatIcon },
			{ name: "Bowling", href: "/stats/bowling", icon: BallIcon },
			{ name: "Fielding", href: "/stats/fielding", icon: StumpsIcon },
			{ name: "POTM", href: "/stats/potm", icon: MedalIcon },
			{ name: "Attendance", href: "/stats/attendance", icon: CalendarIcon },
		],
	},
];

export function AppSidebar() {
	const { state } = useSidebar();
	const { pathname } = useLocation();
	const search = useSearch({ strict: false });

	return (
		<Sidebar variant="floating" collapsible="icon">
			<SidebarHeader>
				<Link to="/">
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
								{items.map(({ name, href, icon: Icon }) => (
									<SidebarMenuItem key={name}>
										<SidebarMenuButton
											tooltip={name}
											isActive={pathname.endsWith(href)}
											render={
												<Link to={href} search={label === "Stats" ? search : {}}>
													<Icon />
													{name}
												</Link>
											}
										/>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
		</Sidebar>
	);
}
