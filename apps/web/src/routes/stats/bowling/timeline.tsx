import { statSchema } from "@ghurki-cricket/api/schema";
import { createFileRoute } from "@tanstack/react-router";

import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { TimelineView } from "@/components/stats-view";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/stats/bowling/timeline")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Bowling Timeline | Ghurki Cricket" },
			{ name: "description", content: "Animated leaderboard timeline showing bowling wickets over time for Ghurki Cricket." },
		],
	}),
	component: () => {
		const search = Route.useSearch();

		return (
			<TimelineView
				title="Timeline"
				chartTitle="Most Bowling Wickets"
				unit="wickets"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" hasDates={false} />]}
				queryOptions={trpc.bowling.raceTimeline.queryOptions(search)}
			/>
		);
	},
});
