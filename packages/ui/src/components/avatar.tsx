import { Avatar as AvatarPrimitive } from "@base-ui/react";
import { cn } from "cn";

export function Avatar({
	className,
	size = "default",
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
	size?: "default" | "sm" | "lg";
}) {
	return (
		<AvatarPrimitive.Root
			data-slot="avatar"
			data-size={size}
			className={cn(
				"group/avatar relative flex size-8 shrink-0 overflow-hidden squircle bg-muted select-none",
				"data-[size=lg]:size-10 data-[size=sm]:size-6",
				className,
			)}
			{...props}
		/>
	);
}

export function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
	return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
	return (
		<AvatarPrimitive.Fallback
			data-slot="avatar-fallback"
			className={cn(
				"flex size-full items-center justify-center text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
				className,
			)}
			{...props}
		/>
	);
}
