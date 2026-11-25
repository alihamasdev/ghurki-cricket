import { formatDate } from "@ghurki-cricket/api/utils";
import { useQueries } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";

import { CalendarIcon } from "@/components/icons";
import { PageError } from "@/components/page-layout";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/utils/trpc";

type DateFilterProps = {
	hasAllTime?: boolean;
	hasYears?: boolean;
	hasRivalries?: boolean;
	hasDates?: boolean;
	hasStats?: boolean;
};

type TabType = "rivalries" | "years" | "dates";

export function DateFilter(props: DateFilterProps) {
	const search = useSearch({ strict: false });

	const getValue = () => {
		if (search.date) return formatDate(search.date, "short");

		if (search.rivalry) return search.rivalry;

		if (search.starts && search.ends) {
			const startYear = search.starts.slice(0, 4);
			const endYear = search.ends.slice(0, 4);

			if (startYear === endYear && search.starts === `${startYear}-01-01` && search.ends === `${endYear}-12-31`) {
				return `Year ${startYear}`;
			}

			return `${formatDate(search.starts, "short")} - ${formatDate(search.ends, "short")}`;
		}

		if (search.starts) return `${formatDate(search.starts, "short")} - Present`;

		if (search.ends) return `Start - ${formatDate(search.ends, "short")}`;

		return props.hasAllTime === false ? "Select Rivalry" : "All Time";
	};

	return (
		<FilterSheet title="Select Date" value={getValue()} icon={CalendarIcon}>
			<DateOptions {...props} />
		</FilterSheet>
	);
}

function DateOptions({ hasAllTime = true, hasYears = true, hasRivalries = true, hasDates = true, hasStats = true }: DateFilterProps) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false });

	const periodKey = (p: { starts: string; ends: string }) => `${p.starts}|${p.ends}`;

	const availableTabs: TabType[] = [];

	if (hasRivalries) availableTabs.push("rivalries");

	if (hasYears) availableTabs.push("years");

	if (hasDates) availableTabs.push("dates");

	const getDefaultTab = (): TabType => {
		if (search.date && hasDates) return "dates";

		if (search.rivalry && hasRivalries) return "rivalries";

		if ((search.starts || search.ends) && hasYears) return "years";

		if (hasRivalries) return "rivalries";

		if (hasYears) return "years";

		if (hasDates) return "dates";

		return "rivalries";
	};

	const [activeTab, setActiveTab] = useState<TabType>(getDefaultTab);
	const currentTab = availableTabs.includes(activeTab) ? activeTab : availableTabs[0];

	const [totalDates, rivalries, years, dates] = useQueries({
		queries: [
			{
				...trpc.filters.getDatesCount.queryOptions({ hasStats }),
				enabled: hasAllTime,
			},
			{
				...trpc.filters.listRivalries.queryOptions(),
				enabled: hasRivalries && (availableTabs.length <= 1 || currentTab === "rivalries"),
			},
			{
				...trpc.filters.listYears.queryOptions({ hasStats }),
				enabled: hasYears && (availableTabs.length <= 1 || currentTab === "years"),
			},
			{
				...trpc.filters.listDates.queryOptions(),
				enabled: hasDates && (availableTabs.length <= 1 || currentTab === "dates"),
			},
		],
	});

	if (totalDates.isError || rivalries.isError || years.isError || dates.isError) {
		return <PageError error={totalDates.error?.message || rivalries.error?.message || years.error?.message || dates.error?.message} />;
	}

	const allTimeRadio = hasAllTime && (
		<RadioGroup
			length={1}
			isLoading={totalDates.isPending}
			value={!search.date && !search.rivalry && !search.starts && !search.ends ? "" : "all-time"}
			onValueChange={() => {
				navigate({
					to: ".",
					search: (prev) => ({ ...prev, date: undefined, rivalry: undefined, starts: undefined, ends: undefined }),
				});
			}}
		>
			<RadioGroupItem value="" label="All Time" description={`${totalDates.data} days`} />
		</RadioGroup>
	);

	const rivalriesRadio = hasRivalries && (
		<RadioGroup
			isLoading={rivalries.isPending}
			value={search.rivalry}
			onValueChange={(value: string) => {
				navigate({
					to: ".",
					search: (prev) => ({ ...prev, rivalry: value, date: undefined, starts: undefined, ends: undefined }),
				});
			}}
		>
			{rivalries.data?.map((rivalry) => (
				<RadioGroupItem key={rivalry.name} value={rivalry.name} label={rivalry.name} description={`${rivalry.count} days`} />
			))}
		</RadioGroup>
	);

	const yearsRadio = hasYears && (
		<RadioGroup
			isLoading={years.isPending}
			value={search.starts && search.ends ? periodKey({ starts: search.starts, ends: search.ends }) : undefined}
			onValueChange={(key: string) => {
				const [starts, ends] = key.split("|");
				navigate({
					to: ".",
					search: (prev) => ({ ...prev, starts, ends, date: undefined, rivalry: undefined }),
				});
			}}
		>
			{years.data?.map((item) => (
				<RadioGroupItem
					key={item.starts}
					value={periodKey(item)}
					label={`Year ${item.starts.slice(0, 4)}`}
					description={`${item.count} days`}
				/>
			))}
		</RadioGroup>
	);

	const datesRadio = hasDates && (
		<RadioGroup
			length={5}
			isLoading={dates.isPending}
			value={search.date}
			onValueChange={(value: string) => {
				navigate({
					to: ".",
					search: (prev) => ({ ...prev, date: value, rivalry: undefined, starts: undefined, ends: undefined }),
				});
			}}
		>
			{dates.data?.map((d) => (
				<RadioGroupItem key={d.date} value={d.date} label={formatDate(d.date, "short")} description={d.title} />
			))}
		</RadioGroup>
	);

	if (availableTabs.length <= 1) {
		const singleTab = availableTabs[0];

		return (
			<>
				{allTimeRadio}
				{singleTab === "rivalries" && rivalriesRadio}
				{singleTab === "years" && yearsRadio}
				{singleTab === "dates" && datesRadio}
			</>
		);
	}

	const handleTabChange = (val: string) => {
		if (val === "rivalries" || val === "years" || val === "dates") {
			setActiveTab(val);
		}
	};

	return (
		<Tabs style={{ gap: 0, overflowY: "auto" }} value={currentTab} onValueChange={handleTabChange}>
			<TabsList variant="sheet" className="sticky top-0 w-full">
				{hasRivalries && <TabsTrigger value="rivalries">Rivalries</TabsTrigger>}
				{hasYears && <TabsTrigger value="years">Years</TabsTrigger>}
				{hasDates && <TabsTrigger value="dates">Dates</TabsTrigger>}
			</TabsList>

			<div className="flex-1 scroll-fade-y overflow-y-auto pb-4">
				{hasRivalries && (
					<TabsContent value="rivalries">
						{allTimeRadio}
						{rivalriesRadio}
					</TabsContent>
				)}

				{hasYears && (
					<TabsContent value="years">
						{allTimeRadio}
						{yearsRadio}
					</TabsContent>
				)}

				{hasDates && (
					<TabsContent value="dates">
						{allTimeRadio}
						{datesRadio}
					</TabsContent>
				)}
			</div>
		</Tabs>
	);
}
