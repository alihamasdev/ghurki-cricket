import { formatDate } from "@ghurki-cricket/api/utils";
import { RadioGroup, RadioGroupItem } from "@ghurki-cricket/ui/components/radio-group";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CalendarDaysIcon } from "lucide-react";
import { useState } from "react";

import { FilterSheet } from "@/components/filter-sheet";
import { PageError, PageLoader } from "@/components/page-layout";
import { trpc } from "@/utils/trpc";

export function DateFilter() {
	const search = useSearch({ strict: false });

	const [open, setOpen] = useState(false);

	const getValue = () => {
		if (search.date) return formatDate(new Date(search.date));
		if (search.rivalry) return search.rivalry;
		if (search.year) return search.year;
		return "All Time";
	};

	return (
		<FilterSheet title="Select Date" value={getValue()} icon={CalendarDaysIcon} open={open} onOpenChange={setOpen}>
			<DateOptions setOpen={setOpen} />
		</FilterSheet>
	);
}

function DateOptions({ setOpen }: { setOpen: (open: boolean) => void }) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false });

	const { data, status } = useQuery(trpc.dates.list.queryOptions());

	if (status === "pending") {
		return <PageLoader className="mx-auto mt-4" />;
	}

	if (status === "error") {
		return <PageError />;
	}

	return (
		<>
			<RadioGroup
				value={!search.date && !search.rivalry && !search.year ? "" : "all-time"}
				onValueChange={() => {
					navigate({ to: ".", search: (prev) => ({ ...prev, date: undefined, rivalry: undefined, year: undefined }) });
					setOpen(false);
				}}
			>
				<RadioGroupItem value="" label="All Time" description={`${data?.dates.length} days`} />
			</RadioGroup>

			<RadioGroup
				value={search.year}
				onValueChange={(value: number) => {
					navigate({ to: ".", search: (prev) => ({ ...prev, year: value, date: undefined, rivalry: undefined }) });
					setOpen(false);
				}}
			>
				{data?.years?.map((year) => (
					<RadioGroupItem value={year.year} label={`Year ${year.year}`} description={`${year.count} days`} />
				))}
			</RadioGroup>

			<RadioGroup
				value={search.rivalry}
				onValueChange={(value: string) => {
					navigate({ to: ".", search: (prev) => ({ ...prev, rivalry: value, date: undefined, year: undefined }) });
					setOpen(false);
				}}
			>
				{data?.rivalries?.map((rivalry) => (
					<RadioGroupItem value={rivalry.name} label={rivalry.name} description={`${rivalry.count} days`} />
				))}
			</RadioGroup>
		</>
	);
}
