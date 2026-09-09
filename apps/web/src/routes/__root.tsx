import type { QueryClient } from "@tanstack/react-query";

import { Toaster } from "@ghurki-cricket/ui/components/sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import type { trpc } from "@/utils/trpc";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";

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
			{ name: "description", content: "Comprehensive cricket stats, match scoring, and player management for Ghurki Cricket" },
		],
		links: [{ rel: "icon", href: "/favicon.ico" }],
	}),
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange storageKey="vite-ui-theme">
				<div className="grid h-svh grid-rows-[auto_1fr]">
					<Header />
					<Outlet />
				</div>
				<Toaster richColors />
			</ThemeProvider>
			<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
		</>
	);
}
