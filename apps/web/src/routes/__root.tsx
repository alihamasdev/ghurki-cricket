import { SidebarInset, SidebarProvider } from "@ghurki-cricket/ui/components/sidebar";
import { TooltipProvider } from "@ghurki-cricket/ui/components/tooltip";
import { type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { StumprIcon } from "@/components/icons";
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
		links: [{ rel: "icon", href: "/favicon.ico" }],
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
			<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
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
