import { createFileRoute, Link } from "@tanstack/react-router";

import { TabsLayout, statsItems } from "@/components/tabs-layout";
import { Item, ItemContent, ItemTitle, ItemMedia } from "@/components/ui/item";

export const Route = createFileRoute("/_tab/stats/")({
	head: () => ({ meta: [{ title: "Stats" }] }),
	component: () => {
		return (
			<TabsLayout title="Stats" filters={{ date: false }}>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{statsItems.map((item) => (
						<Item key={item.name} variant="outline" className="flex-row" asChild>
							<Link to={item.url}>
								<ItemMedia variant="icon">
									<img src={item.icon} width={18} height={18} alt={item.name} className="aspect-square" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{`${item.name} Stats`}</ItemTitle>
								</ItemContent>
							</Link>
						</Item>
					))}
				</div>
			</TabsLayout>
		);
	},
});
