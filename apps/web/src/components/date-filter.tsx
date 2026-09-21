import { formatDate } from "@ghurki-cricket/api/utils";
import { RadioGroup, RadioGroupItem } from "@ghurki-cricket/ui/components/radio-group";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";

import { FilterSheet } from "@/components/filter-sheet";
import { CalendarIcon } from "@/components/icons";
import { PageError, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

type DateFilterProps = {
	hasAllTime?: boolean;
	hasPeriods?: boolean;
	hasRivalries?: boolean;
};

export function DateFilter(props: DateFilterProps) {
	const search = useSearch({ strict: false });

	const [open, setOpen] = useState(false);

	const getValue = () => {
		if (search.date) return formatDate(search.date, "short");
		if (search.rivalry) return search.rivalry;
		if (search.starts && search.ends) return `${formatDate(search.starts, "short")} - ${formatDate(search.ends, "short")}`;
		if (search.starts) return `${formatDate(search.starts, "short")} - Present`;
		if (search.ends) return `Start - ${formatDate(search.ends, "short")}`;
		return "All Time";
	};

	return (
		<FilterSheet title="Select Date" value={getValue()} icon={CalendarIcon} open={open} onOpenChange={setOpen}>
			<DateOptions {...props} setOpen={setOpen} />
		</FilterSheet>
	);
}

function DateOptions({
	hasAllTime = true,
	hasPeriods = true,
	hasRivalries = true,
	setOpen,
}: DateFilterProps & { setOpen: (open: boolean) => void }) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false });

	const periodKey = (p: { starts: string; ends: string }) => `${p.starts}|${p.ends}`;

	const { data, status, error } = useQuery(trpc.dates.list.queryOptions());

	if (status === "pending") {
		return <PageLoader className="mx-auto mt-4" />;
	}

	if (status === "error") {
		return <PageError error={error.message} />;
	}

	return (
		<>
			{hasAllTime && (
				<RadioGroup
					value={!search.date && !search.rivalry && !search.starts && !search.ends ? "" : "all-time"}
					onValueChange={() => {
						navigate({
							to: ".",
							search: (prev) => ({ ...prev, date: undefined, rivalry: undefined, starts: undefined, ends: undefined, year: undefined }),
						});
						setOpen(false);
					}}
				>
					<RadioGroupItem value="" label="All Time" description={`${data.totalDates} days`} />
				</RadioGroup>
			)}

			{hasPeriods && (
				<RadioGroup
					value={search.starts && search.ends ? periodKey({ starts: search.starts, ends: search.ends }) : undefined}
					onValueChange={(key: string) => {
						const [starts, ends] = key.split("|");
						navigate({ to: ".", search: (prev) => ({ ...prev, starts, ends, date: undefined, rivalry: undefined }) });
						setOpen(false);
					}}
				>
					{data.periods.map((period) => (
						<RadioGroupItem
							key={period.starts}
							value={periodKey(period)}
							label={`${formatDate(period.starts, "short")} - ${formatDate(period.ends, "short")}`}
							description={`${period.count} days`}
						/>
					))}
				</RadioGroup>
			)}

			{hasRivalries && (
				<RadioGroup
					value={search.rivalry}
					onValueChange={(value: string) => {
						navigate({ to: ".", search: (prev) => ({ ...prev, rivalry: value, date: undefined, starts: undefined, ends: undefined }) });
						setOpen(false);
					}}
				>
					{data.rivalries.map((rivalry) => (
						<RadioGroupItem key={rivalry.name} value={rivalry.name} label={rivalry.name} description={`${rivalry.count} days`} />
					))}
				</RadioGroup>
			)}
		</>
	);
}
