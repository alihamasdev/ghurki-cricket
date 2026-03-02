import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DropdownFilterProps = {
	icon?: IconSvgElement;
	value?: string;
	onValueChange?: (value: string) => void;
	side?: "start" | "center" | "end";
	options: {
		value: string;
		label: string;
		icon?: IconSvgElement;
	}[];
};

export function DropdownFilter({ icon, options, value, onValueChange, side = "center" }: DropdownFilterProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="capitalize">
					{icon && <HugeiconsIcon icon={icon} />}
					{value}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align={side}>
				<DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
					{options.map((option) => (
						<DropdownMenuRadioItem key={option.value} value={option.value}>
							{option.icon && <HugeiconsIcon icon={option.icon} />}
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
