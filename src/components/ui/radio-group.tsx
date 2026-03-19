import { CircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { useId } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
	return (
		<RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid w-full cursor-pointer gap-2", className)} {...props} />
	);
}

function RadioGroupItem({ className, children, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
	const id = useId();
	return (
		<Label
			htmlFor={id}
			className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-muted"
		>
			<RadioGroupPrimitive.Item
				id={id}
				data-slot="radio-group-item"
				className={cn(
					"group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input text-primary outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
					className,
				)}
				{...props}
			>
				<RadioGroupPrimitive.Indicator
					data-slot="radio-group-indicator"
					className="flex size-4 items-center justify-center text-primary group-aria-invalid/radio-group-item:text-destructive"
				>
					<HugeiconsIcon
						icon={CircleIcon}
						strokeWidth={2}
						className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current"
					/>
				</RadioGroupPrimitive.Indicator>
			</RadioGroupPrimitive.Item>
			<div className="flex w-full items-center justify-between capitalize">{children}</div>
		</Label>
	);
}

export { RadioGroup, RadioGroupItem };
