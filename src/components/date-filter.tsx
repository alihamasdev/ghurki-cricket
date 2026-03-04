import { Calendar02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuPortal,
	DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
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
	side?: "start" | "center" | "end";
};

export function DateFilter({ options = "both", side = "end" }: DateFilterProps) {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { data } = useSuspenseQuery(datesQueryOptions());
	const { date: selectedDate, rivalry: selectedRivalry } = useSearch({ strict: false });
	const formattedDate = formatDate(selectedDate);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					<HugeiconsIcon icon={Calendar02Icon} strokeWidth={2} />
					{formattedDate !== "All Time" ? formattedDate : (selectedRivalry ?? "All Time")}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align={side} className="w-auto">
				<DropdownMenuGroup>
					<DropdownMenuRadioGroup
						value={!selectedDate && !selectedRivalry ? "" : "none"}
						onValueChange={() => navigate({ to: pathname, search: (prev) => ({ ...prev, date: undefined, rivalry: undefined }) })}
					>
						<DropdownMenuRadioItem value="">All Time</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
				{options === "both" && (
					<DropdownMenuGroup>
						{data.rivalries.map(({ title, dates }) => (
							<DropdownMenuSub key={title}>
								<DropdownMenuSubTrigger className="text-xs">{title}</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										<DropdownMenuRadioGroup
											value={
												selectedDate
													? dates.some((d) => d.date === selectedDate)
														? selectedDate
														: undefined
													: selectedRivalry === title
														? "all"
														: undefined
											}
											onValueChange={(value) => {
												if (value === "all") {
													navigate({ to: pathname, search: (prev) => ({ ...prev, date: undefined, rivalry: title }) });
												} else {
													navigate({ to: pathname, search: (prev) => ({ ...prev, date: value, rivalry: undefined }) });
												}
											}}
										>
											<DropdownMenuRadioItem indicatorSide="start" value="all">
												{`All ${title}`}
											</DropdownMenuRadioItem>
											{dates.map(({ date, title: dateTitle }) => (
												<DropdownMenuRadioItem key={date} value={date} indicatorSide="start" className="justify-between">
													<span>{dateTitle}</span>
													<span className="text-xs text-muted-foreground">({date})</span>
												</DropdownMenuRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
						))}
					</DropdownMenuGroup>
				)}
				{options === "rivalries" && (
					<DropdownMenuGroup>
						<DropdownMenuRadioGroup
							value={selectedRivalry}
							onValueChange={(value) =>
								navigate({ to: pathname, search: (prev) => ({ ...prev, date: undefined, rivalry: value }) })
							}
						>
							{data.rivalries.map(({ title }) => (
								<DropdownMenuRadioItem key={title} value={title}>
									{title}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuGroup>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
