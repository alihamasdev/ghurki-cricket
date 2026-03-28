import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";

import { datesQueryOptions } from "@/components/date-filter";
import { playerQueryOptions } from "@/components/players/query";
import { MenuProvider } from "@/context/menu-context";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ title: "Ghurki Cricket Scorer" },
			{
				name: "description",
				content:
					"Comprehensive cricket stats, match scoring, and player management for Ghurki Cricket. Track batting, bowling, and team performance.",
			},
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ property: "og:title", content: "Ghurki Cricket Scorer" },
			{ property: "og:description", content: "Track cricket matches, player stats, and team performance in real-time." },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: "https://stats.alihamas.pk" },
			{ property: "og:image", content: "https://stats.alihamas.pk/og-image.png" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: "Ghurki Cricket Scorer" },
			{ name: "twitter:description", content: "Track cricket matches, player stats, and team performance in real-time." },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "canonical", href: "https://stats.alihamas.pk" },
			{ rel: "icon", href: "/favicon.ico" },
		],
		scripts: [
			{ src: "https://www.googletagmanager.com/gtag/js?id=G-M5LYMCJYDX", async: true },
			{
				children: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-M5LYMCJYDX');
        `,
			},
		],
	}),
	loader: async ({ context }) =>
		await Promise.all([
			context.queryClient.ensureQueryData(playerQueryOptions()),
			context.queryClient.ensureQueryData(datesQueryOptions()),
		]),
	shellComponent: ({ children }: { children: React.ReactNode }) => {
		const { queryClient } = Route.useRouteContext();
		return (
			<html lang="en">
				<head>
					<HeadContent />
				</head>
				<body>
					<QueryClientProvider client={queryClient}>
						<MenuProvider>{children}</MenuProvider>
					</QueryClientProvider>
					<Scripts />
				</body>
			</html>
		);
	},
});
