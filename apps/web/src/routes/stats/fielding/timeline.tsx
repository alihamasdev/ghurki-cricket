import { statSchema } from "@ghurki-cricket/api/schema";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DataTableError, DataTableLoader } from "@/components/data-table";
import { DateFilter } from "@/components/filters/date-filter";
import { GroupFilter } from "@/components/filters/group-filter";
import { PageLayout } from "@/components/page-layout";
import { Timeline } from "@/components/timeline";
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
		return (
			<PageLayout
				title="Timeline"
				headerRight={
					<div className="flex flex-wrap items-center justify-end gap-2">
						<GroupFilter />
						<DateFilter hasDates={false} />
					</div>
				}
			>
				<FieldingTimeline />
			</PageLayout>
		);
	},
});

function FieldingTimeline() {
	const { group, rivalry, starts, ends } = Route.useSearch();
	const { data, status, error } = useQuery(trpc.fielding.raceTimeline.queryOptions({ group, rivalry, starts, ends }));

	if (status === "pending") {
		return <DataTableLoader className="aspect-video h-auto" />;
	}

	if (status === "error") {
		return <DataTableError error={error.message} />;
	}

	return <Timeline title="Most Fielding Catches" unit="catches" timeline={data} />;
}
