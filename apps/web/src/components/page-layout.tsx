import { SidebarTrigger } from "@ghurki-cricket/ui/components/sidebar";
import { cn } from "@ghurki-cricket/ui/lib/utils";

type PageLayoutProps = React.PropsWithChildren<{
	title: string;
	className?: string;
}>;

export function PageLayout({ title, className, children }: PageLayoutProps) {
	return (
		<>
			<header className="sticky top-0 z-10 bg-background">
				<div className="container grid grid-cols-1 gap-3 px-2 py-3 md:grid-cols-2">
					<div className="flex items-center gap-3">
						<SidebarTrigger className="xl:hidden" />
						<h1 className="text-xl/9 font-semibold capitalize">{title}</h1>
					</div>
				</div>
			</header>
			<main className="flex size-full flex-1 flex-col">
				<div className={cn("container flex flex-1 flex-col gap-4 px-2 pb-4", className)}>{children}</div>
			</main>
		</>
	);
}
