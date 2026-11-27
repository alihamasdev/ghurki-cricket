import { statSchema } from "@ghurki-cricket/api/schema";
import { createFileRoute } from "@tanstack/react-router";

import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { TimelineView } from "@/components/stats-view";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/stats/fielding/timeline")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Fielding Timeline | Ghurki Cricket" },
			{ name: "description", content: "Animated leaderboard timeline showing fielding catches over time for Ghurki Cricket." },
		],
	}),
	component: () => {
		const search = Route.useSearch();

		return (
			<TimelineView
				title="Timeline"
				chartTitle="Most Fielding Catches"
				unit="catches"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" hasDates={false} />]}
				queryOptions={trpc.fielding.raceTimeline.queryOptions(search)}
			/>
		);
	},
});
