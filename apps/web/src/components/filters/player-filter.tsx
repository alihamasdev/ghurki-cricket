import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { PlayerAvatar } from "@/components/avatar";
import { PlayersIcon } from "@/components/icons";
import { PageError } from "@/components/page-layout";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/utils/trpc";

type PlayerFilterProps = {
	label: string;
	param: "player1" | "player2";
};

export function PlayerFilter({ param, label }: PlayerFilterProps) {
	const search = useSearch({ strict: false }) ?? {};
	const currentPlayer = search[param];

	return (
		<FilterSheet title={`Select ${label}`} value={currentPlayer || label} icon={PlayersIcon}>
			<PlayerOptions param={param} selectedPlayer={currentPlayer} />
		</FilterSheet>
	);
}

function PlayerOptions({ param, selectedPlayer }: { param: "player1" | "player2"; selectedPlayer?: string }) {
	const navigate = useNavigate();
	const { data, isPending, isError, error } = useQuery(trpc.players.list.queryOptions({ group: "family" }));

	if (isError) {
		return <PageError error={error.message} />;
	}

	return (
		<RadioGroup
			length={15}
			side="right"
			isLoading={isPending}
			value={selectedPlayer}
			onValueChange={(val: string) => {
				navigate({ to: ".", search: (prev) => ({ ...prev, [param]: val === selectedPlayer ? undefined : val }) });
			}}
		>
			{data?.map((player) => (
				<RadioGroupItem key={player.name} value={player.name} label={player.name}>
					<PlayerAvatar name={player.name} size="sm" />
				</RadioGroupItem>
			))}
		</RadioGroup>
	);
}
