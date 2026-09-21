import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@ghurki-cricket/ui/components/empty";
import { SidebarTrigger } from "@ghurki-cricket/ui/components/sidebar";
import { Spinner } from "@ghurki-cricket/ui/components/spinner";
import { cn } from "@ghurki-cricket/ui/lib/utils";
import { AlertTriangleIcon } from "lucide-react";

type PageLayoutProps = React.PropsWithChildren<{
	title: string;
	className?: string;
	headerRight?: React.ReactNode;
}>;

export function PageLayout({ title, headerRight, className, children }: PageLayoutProps) {
	return (
		<>
			<header className="sticky top-0 z-10 bg-background sm:pr-2">
				<div className="container grid grid-cols-1 gap-3 px-2 py-3 md:grid-cols-2">
					<div className="flex items-center gap-3">
						<SidebarTrigger className="xl:hidden" />
						<h1 className="text-xl/9 font-semibold">{title}</h1>
					</div>
					{headerRight}
				</div>
			</header>
			<main className="flex size-full flex-1 flex-col sm:pr-2">
				<div
					className={cn(
						"container flex flex-1 scroll-fade-y flex-col gap-4 px-2 pb-4",
						"has-data-[slot=spinner]:items-center has-data-[slot=spinner]:py-4",
						"has-data-[slot=empty]:",
						className,
					)}
				>
					{children}
				</div>
			</main>
		</>
	);
}

export function PageLoader({ ...props }: React.ComponentProps<typeof Spinner>) {
	return <Spinner {...props} />;
}

export function PageError({ error }: { error?: string }) {
	return (
		<Empty>
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
