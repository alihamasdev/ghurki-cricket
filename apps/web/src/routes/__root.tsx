import { type QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type trpc } from "@/utils/trpc";

import "../index.css";

type RouterContext = {
	trpc: typeof trpc;
	queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ title: "Ghurki Cricket" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "description", content: "Overview and quick access to Ghurki Cricket stats, matches, players, and teams." },
		],
	}),
});

function RootComponent() {
	return (
		<TooltipProvider>
			<HeadContent />
			<SidebarProvider>
				<AppSidebar />
				{/* oxlint-disable-next-line shadcn/no-restyle */}
				<SidebarInset className="container gap-4 p-4">
					<Outlet />
				</SidebarInset>
			</SidebarProvider>
		</TooltipProvider>
	);
}
