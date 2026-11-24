import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

import { StumprIcon } from "@/components/icons";
import { PageError } from "@/components/page-layout";
import { routeTree } from "@/routeTree.gen";
import { queryClient, trpc } from "@/utils/trpc";

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	context: { trpc, queryClient },
	Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	},
	defaultErrorComponent: () => <PageError className="h-dvh" />,
	defaultPendingComponent: () => {
		return (
			<div className="flex h-dvh w-full items-center justify-center">
				<StumprIcon className="size-16 fill-primary" />
			</div>
		);
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
	const root = createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
