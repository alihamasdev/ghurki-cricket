import { statSchema } from "@ghurki-cricket/api/schema";
import { createFileRoute } from "@tanstack/react-router";

import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { TimelineView } from "@/components/stats-view";
import { seo } from "@/lib/seo";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/stats/potm/timeline")({
	validateSearch: statSchema,
	head: () => seo("POTM Timeline", "Animated leaderboard timeline showing Player of the Match awards over time for Ghurki Cricket."),
	component: () => {
		const search = Route.useSearch();

		return (
			<TimelineView
				title="Timeline"
				chartTitle="POTM Timeline"
				unit="awards"
				filters={[<GroupFilter key="group" />, <DateFilter key="date" hasDates={false} />]}
				queryOptions={trpc.potm.raceTimeline.queryOptions(search)}
			/>
		);
	},
});
