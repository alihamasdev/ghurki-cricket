import { cn } from "cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="skeleton" className={cn("w-full animate-pulse squircle bg-muted", className)} {...props} />;
}

export { Skeleton };
