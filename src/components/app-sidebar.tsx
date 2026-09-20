import { Link, useLocation, useSearch } from "@tanstack/react-router";

import { tabItems, statsItems } from "@/components/tabs-layout";
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
} from "@/components/ui/sidebar";
export function AppSidebar() {
	const { pathname } = useLocation();
	const { date, rivalry, core } = useSearch({ strict: false });
	return (
		<Sidebar className="gap-0">
			<SidebarHeader className="px-4 py-3">
				<Link to="/" className="flex items-center justify-center gap-2">
					<img src="/logo.svg" alt="logo" width={28} height={28} />
					<h1 className="text-center text-xl font-semibold">Ghurki Cricket</h1>
				</Link>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Pages</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{tabItems.map((item) => (
								<SidebarMenuItem key={item.name}>
									<SidebarMenuButton isActive={pathname.endsWith(item.url)} asChild>
										<Link to={item.url}>
											<img src={item.icon} width={14} height={14} alt={item.name} className="aspect-square" />
											<span>{item.name}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Stats</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{statsItems.map((item) => (
								<SidebarMenuItem key={item.name}>
									<SidebarMenuButton isActive={pathname.endsWith(item.url)} asChild>
										<Link to={item.url} search={{ date, rivalry, core }}>
											<img src={item.icon} width={14} height={14} alt={item.name} className="aspect-square" />
											<span>{item.name}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
