import { useNavigate, useSearch } from "@tanstack/react-router";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function EachTeamFilter() {
	const navigate = useNavigate();
	const search = useSearch({ strict: false });

	const isEach = search.each !== false;

	return (
		<div className="flex items-center gap-2">
			<Switch
				id="each-team"
				checked={isEach}
				onCheckedChange={(checked) => {
					navigate({ to: ".", search: (prev) => ({ ...prev, each: checked ? undefined : false }) });
				}}
			/>
			{/* oxlint-disable-next-line shadcn/no-restyle */}
			<Label htmlFor="each-team" className="cursor-pointer text-sm font-medium select-none">
				Each Team
			</Label>
		</div>
	);
}
