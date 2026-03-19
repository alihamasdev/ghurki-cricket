import { CricketBatIcon, TennisBallIcon } from "@hugeicons/core-free-icons";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { playerQueryOptions } from "@/components/players/query";
import { TabsLayout } from "@/components/tabs-layout";

const compareSchema = z.object({
	batter: z.string().optional(),
	bowler: z.string().optional(),
});

export const Route = createFileRoute("/_tab/compare/")({
	validateSearch: compareSchema,
	head: () => ({ meta: [{ title: "Compare" }] }),
	component: () => {
		const navigate = Route.useNavigate();
		const { batter, bowler } = Route.useSearch();
		const { data: players } = useSuspenseQuery(playerQueryOptions());
		return (
			<TabsLayout
				title="Compare"
				className="items-center justify-center"
				dateFilter={{ options: "rivalries" }}
				filters={[
					{
						icon: CricketBatIcon,
						value: batter ?? "Select Batter",
						onValueChange: (value) => navigate({ search: (prev) => ({ ...prev, batter: value }) }),
						options: players.map((player) => ({
							label: player.name,
							value: player.name.toLowerCase(),
						})),
					},
					{
						icon: TennisBallIcon,
						value: bowler ?? "Select Bowler",
						onValueChange: (value) => navigate({ search: (prev) => ({ ...prev, bowler: value }) }),
						options: players.map((player) => ({
							label: player.name,
							value: player.name.toLowerCase(),
						})),
					},
				]}
			>
				<div className="size-100 rounded-md border"></div>
			</TabsLayout>
		);
	},
});
