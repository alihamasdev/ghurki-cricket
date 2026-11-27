import { statSchema } from "@ghurki-cricket/api/schema";
import { createFileRoute } from "@tanstack/react-router";

import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { TimelineView } from "@/components/stats-view";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/stats/batting/timeline")({
	validateSearch: statSchema,
	head: () => ({
		meta: [
			{ title: "Timeline | Ghurki Cricket" },
			{ name: "description", content: "Animated leaderboard timeline showing batting runs over time for Ghurki Cricket." },
		],
	}),
	component: () => {
		const search = Route.useSearch();

		return (
			<TimelineView
				title="Timeline"
				chartTitle="Runs Timeline"
				unit="runs"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" hasDates={false} />]}
				queryOptions={trpc.batting.raceTimeline.queryOptions(search)}
			/>
		);
	},
});
