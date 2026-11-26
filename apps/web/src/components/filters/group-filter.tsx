import { type GroupFilter as GroupFilterType } from "@ghurki-cricket/api/filters";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { PlayersIcon } from "@/components/icons";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Group = GroupFilterType | "all";

const groupOptions = [
	{ value: "core", label: "Core" },
	{ value: "family", label: "Family" },
	{ value: "friends", label: "Friends" },
	{ value: "all", label: "All Players" },
] satisfies Array<{ value: Group; label: string }>;

export function GroupFilter() {
	const { group } = useSearch({ strict: false });
	const currentGroup = group ?? "core";

	const getLabel = () => {
		const matched = groupOptions.find((g) => g.value === currentGroup);

		return matched ? matched.label : "Core";
	};

	return (
		<FilterSheet title="Select Group" value={getLabel()} icon={PlayersIcon}>
			<GroupOptions currentGroup={currentGroup} />
		</FilterSheet>
	);
}

function GroupOptions({ currentGroup }: { currentGroup: string }) {
	const navigate = useNavigate();

	return (
		<RadioGroup
			value={currentGroup}
			onValueChange={(val: string) => {
				const selected = groupOptions.find((g) => g.value === val)?.value;
				navigate({ to: ".", search: (prev) => ({ ...prev, group: selected === "core" ? undefined : selected }) });
			}}
		>
			{groupOptions.map((opt) => (
				<RadioGroupItem key={opt.value} value={opt.value} label={opt.label} />
			))}
		</RadioGroup>
	);
}
