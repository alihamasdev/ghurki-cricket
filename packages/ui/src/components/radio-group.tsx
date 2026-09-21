import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cn } from "cn";
import { useId } from "react";

function RadioGroup({ side = "left", className, ...props }: RadioGroupPrimitive.Props & { side?: "left" | "right" }) {
	return <RadioGroupPrimitive data-slot="radio-group" data-side={side} className={cn("group/radio-group grid", className)} {...props} />;
}

type RadioGroupItemProps = RadioPrimitive.Root.Props & {
	label: string;
	description?: string;
	orientation?: "horizontal" | "vertical";
};

function RadioGroupItem({ label, description, orientation = "horizontal", className, children, ...props }: RadioGroupItemProps) {
	const id = useId();
	return (
		<label
			data-slot="radio-group-item"
			htmlFor={id}
			className={cn(
				"group/radio-group-item flex w-full cursor-pointer flex-wrap items-center gap-2.5 rounded-md px-4 py-2 text-sm transition-colors duration-100 hover:bg-muted",
				className,
			)}
		>
			<RadioGroupItemIndicator id={id} className="group-data-[side=right]/radio-group:order-last" {...props} />
			{children}
			<div className={cn("flex flex-1 text-sm", orientation === "horizontal" ? "flex-row justify-between" : "flex-col")}>
				<p className="font-medium">{label}</p>
				<p className="font-normal text-muted-foreground">{description}</p>
			</div>
		</label>
	);
}

function RadioGroupItemIndicator({ className, ...props }: RadioPrimitive.Root.Props) {
	return (
		<RadioPrimitive.Root
			data-slot="radio-group-item-indicator"
			className={cn(
				"group/radio-group-item-indicator peer relative flex aspect-square size-4 shrink-0 rounded-full border outline-none group-has-focus-visible/field-label:ring-0 group-has-focus-visible/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-focus-visible/field-label:data-checked:border-primary dark:data-checked:bg-primary",
				className,
			)}
			{...props}
		>
			<RadioPrimitive.Indicator data-slot="radio-group-indicator" className="flex size-4 items-center justify-center">
				<span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
			</RadioPrimitive.Indicator>
		</RadioPrimitive.Root>
	);
}

export { RadioGroup, RadioGroupItem, RadioGroupItemIndicator };
