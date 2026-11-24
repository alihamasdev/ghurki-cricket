import { AlertTriangleIcon } from "lucide-react";

import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { SidebarTrigger } from "@/components/ui/sidebar";

type PageLayoutProps = React.PropsWithChildren<{
	title: string;
	className?: string;
	headerRight?: React.ReactNode;
}>;

export function PageLayout({ title, headerRight, children }: PageLayoutProps) {
	return (
		<>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div className="flex items-center gap-3">
					<SidebarTrigger className="xl:hidden" />
					<h1 className="text-xl/9 font-semibold">{title}</h1>
				</div>
				{headerRight}
			</div>
			{children}
		</>
	);
}

export function PageError({ error, ...props }: { error?: string } & React.ComponentProps<typeof Empty>) {
	return (
		<Empty {...props}>
			<EmptyContent>
				<EmptyMedia variant="icon">
					<AlertTriangleIcon />
				</EmptyMedia>
				<EmptyTitle>Something went wrong, please try again</EmptyTitle>
				{error && <EmptyDescription>{error}</EmptyDescription>}
			</EmptyContent>
		</Empty>
	);
}
