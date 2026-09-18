import { Item, ItemContent, ItemMedia, ItemTitle } from "@ghurki-cricket/ui/components/item";
import { createFileRoute, Link } from "@tanstack/react-router";

import { sidebarList } from "@/components/app-sidebar";
import { PageLayout } from "@/components/page-layout";

export const Route = createFileRoute("/")({
	component: () => {
		return (
			<PageLayout title="Home">
				<HomeRoute />
			</PageLayout>
		);
	},
});

function HomeRoute() {
	return sidebarList.map(({ label, items }, index) => (
		<section key={index} className="space-y-2">
			{label && <h2 className="font-semibold">{label}</h2>}
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{items.map(({ name, href, icon: Icon }) => (
					<Item
						key={name}
						render={
							<Link to={href}>
								<ItemMedia variant="icon">
									<Icon className="fill-primary" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{name}</ItemTitle>
								</ItemContent>
							</Link>
						}
					/>
				))}
			</div>
		</section>
	));
}
