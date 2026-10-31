import { type QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { StumprIcon } from "@/components/icons";
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
	pendingComponent: RootLoading,
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
				<SidebarInset>
					<Outlet />
				</SidebarInset>
			</SidebarProvider>
		</TooltipProvider>
	);
}

function RootLoading() {
	return (
		<div className="flex h-dvh w-full items-center justify-center">
			<StumprIcon className="size-16 fill-primary" />
		</div>
	);
}
