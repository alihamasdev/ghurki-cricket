import { Calendar02Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dateSearchSchema = z.object({
	date: z.string().optional(),
	rivalry: z.string().optional(),
});

export const validateDate = ({ date, rivalry }: z.infer<typeof dateSearchSchema>) => {
	if (date) return { date: new Date(date) };
	if (rivalry) return { rivalryId: rivalry };
	return undefined;
};

export const datesQueryOptions = () => {
	return queryOptions({
		queryKey: ["dates"],
		queryFn: () => getDates(),
	});
};

export const getDates = createServerFn({ method: "GET" }).handler(async () => {
	const dates = await db.dates.findMany({ orderBy: { date: "desc" }, select: { date: true, title: true, rivalryId: true } });

	const rivalriesGrouped = dates.reduce(
		(acc, dateObj) => {
			const { rivalryId } = dateObj;
			if (rivalryId) {
				if (!acc[rivalryId]) acc[rivalryId] = [];
				acc[rivalryId].push({
					title: dateObj.title,
					date: format(dateObj.date, "yyyy-MM-dd"),
				});
			}
			return acc;
		},
		{} as Record<string, { title: string; date: string }[]>,
	);

	return {
		rivalries: Object.entries(rivalriesGrouped).map(([title, dates]) => ({ title, dates })),
		dates: dates.filter((d) => !d.rivalryId).map(({ date, title }) => ({ title, date: format(date, "yyyy-MM-dd") })),
	};
});

export type DateFilterProps = {
	options?: "dates" | "rivalries" | "both";
};

export function DateFilter({ options = "both" }: DateFilterProps) {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const [open, setOpen] = useState(false);
	const [expandedRivalry, setExpandedRivalry] = useState<string | null>(null);
	const { data } = useSuspenseQuery(datesQueryOptions());
	const { date: selectedDate, rivalry: selectedRivalry } = useSearch({ strict: false });

	useEffect(() => {
		if (open) {
			const activeRivalry = data.rivalries.find(
				(r) => r.title === selectedRivalry || r.dates.some((d) => d.date === selectedDate),
			);
			setExpandedRivalry(activeRivalry?.title ?? null);
		}
	}, [open, selectedDate, selectedRivalry, data.rivalries]);

	const formattedDate = formatDate(selectedDate);
	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="outline">
					<HugeiconsIcon icon={Calendar02Icon} strokeWidth={2} />
					{formattedDate !== "All Time" ? formattedDate : (selectedRivalry ?? "All Time")}
				</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader title="Select Date" />
				<div className="flex-1 space-y-2 overflow-y-auto p-4">
					<RadioGroup
						value={!selectedDate && !selectedRivalry ? "" : "none"}
						onValueChange={() => {
							navigate({ to: pathname, search: (prev) => ({ ...prev, date: undefined, rivalry: undefined }) });
							setOpen(false);
						}}
					>
						<RadioGroupItem value="">All Time</RadioGroupItem>
					</RadioGroup>
					{options === "both" &&
						data.rivalries.map(({ title, dates }) => (
							<Collapsible
								key={title}
								open={expandedRivalry === title}
								onOpenChange={(isOpen) => setExpandedRivalry(isOpen ? title : null)}
								className="space-y-2"
							>
								<CollapsibleTrigger
									className="cursor-pointer rounded-lg px-3 py-2 hover:bg-muted data-[state=open]:bg-muted"
									asChild
								>
									<div className="flex items-center justify-between gap-2 transition-colors [&[data-state=open]>svg]:rotate-180">
										<Label className="font-medium md:text-[15px]">{title}</Label>
										<HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4 transition-transform duration-200" />
									</div>
								</CollapsibleTrigger>
								<CollapsibleContent className="space-y-1 pl-4">
									<RadioGroup
										className="gap-1"
										value={selectedDate ?? selectedRivalry ?? "none"}
										onValueChange={(val) => {
											if (val === title) {
												navigate({ to: pathname, search: (prev) => ({ ...prev, date: undefined, rivalry: val }) });
											} else {
												navigate({ to: pathname, search: (prev) => ({ ...prev, rivalry: undefined, date: val }) });
											}
											setOpen(false);
										}}
									>
										<RadioGroupItem value={title}>All {title}</RadioGroupItem>
										{dates.map((dateObj) => (
											<RadioGroupItem key={dateObj.date} value={dateObj.date}>
												<span>{dateObj.title}</span>
												<span className="text-muted-foreground">{formatDate(dateObj.date)}</span>
											</RadioGroupItem>
										))}
									</RadioGroup>
								</CollapsibleContent>
							</Collapsible>
						))}
					{options === "rivalries" && (
						<RadioGroup
							value={selectedRivalry}
							onValueChange={(value) => {
								navigate({ to: pathname, search: (prev) => ({ ...prev, date: undefined, rivalry: value }) });
								setOpen(false);
							}}
						>
							{data.rivalries.map(({ title }) => (
								<RadioGroupItem key={title} value={title}>
									{title}
								</RadioGroupItem>
							))}
						</RadioGroup>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
