import { FilterSheet } from "@ghurki-cricket/ui/components/filter-sheet";
import { RadioGroup, RadioGroupItem } from "@ghurki-cricket/ui/components/radio-group";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { BallIcon } from "@/components/icons";
import { PageError } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

export function OversFilter() {
	const search = useSearch({ strict: false }) ?? {};

	const getValue = () => {
		if (search.overs) return `${search.overs} Overs`;
		return "All Overs";
	};

	return (
		<FilterSheet title="Select Overs" value={getValue()} icon={BallIcon}>
			<OversOptions />
		</FilterSheet>
	);
}

function OversOptions() {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) ?? {};

	const { data, isPending, isError, error } = useQuery(
		trpc.filters.listOvers.queryOptions({
			rivalry: search.rivalry,
			date: search.date,
		}),
	);

	if (isError) {
		return <PageError error={error.message} />;
	}

	return (
		<>
			<RadioGroup
				length={1}
				isLoading={isPending}
				value={search.overs ? "" : "all-overs"}
				onValueChange={() => {
					navigate({
						to: ".",
						search: (prev) => ({ ...prev, overs: undefined }),
					});
				}}
			>
				<RadioGroupItem value="all-overs" label="All Overs" description={`${data?.totalMatches} matches`} />
			</RadioGroup>

			<RadioGroup
				isLoading={isPending}
				value={search.overs ? search.overs.toString() : undefined}
				onValueChange={(val: string) => {
					navigate({
						to: ".",
						search: (prev) => ({ ...prev, overs: Number(val) }),
					});
				}}
			>
				{data?.overs.map((item) => (
					<RadioGroupItem
						key={item.overs}
						value={item.overs.toString()}
						label={`${item.overs} Overs`}
						description={`${item.count} matches`}
					/>
				))}
			</RadioGroup>
		</>
	);
}
