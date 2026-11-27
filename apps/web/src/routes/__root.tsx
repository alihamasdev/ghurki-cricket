import { type QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { seo } from "@/lib/seo";
import { type trpc } from "@/utils/trpc";

import "../index.css";

type RouterContext = {
	trpc: typeof trpc;
	queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
	head: () => ({
		meta: [{ charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }, ...seo().meta],
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
