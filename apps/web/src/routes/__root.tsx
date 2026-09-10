import { SidebarInset, SidebarProvider } from "@ghurki-cricket/ui/components/sidebar";
import { type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { StumprIcon } from "@/components/icons";

import "../index.css";
import { type trpc } from "@/utils/trpc";

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
			{ name: "description", content: "Comprehensive cricket stats, match scoring, and player management for Ghurki Cricket" },
		],
		links: [{ rel: "icon", href: "/favicon.ico" }],
	}),
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<Outlet />
				</SidebarInset>
			</SidebarProvider>
			<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
		</>
	);
}

function RootLoading() {
	return (
		<div className="flex items-center justify-center h-dvh w-full">
			<StumprIcon className="size-16 fill-primary" />
		</div>
	);
}
