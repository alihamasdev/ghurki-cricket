import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { useMenu } from "@/context/menu-context";

interface TabsLayoutProps {
	title: string;
	children?: React.ReactNode;
	secondary?: React.ReactNode;
}

export function TabsLayout({ title, secondary, children }: TabsLayoutProps) {
	const { toggleOpen } = useMenu();
	return (
		<>
			<header className="">
				<div className="container mx-auto flex items-center gap-3 px-4 py-3">
					<Button variant="secondary" size="icon" onClick={toggleOpen}>
						<HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
					</Button>
					<h1 className="text-xl/9 font-semibold capitalize">{title}</h1>
					{secondary}
				</div>
			</header>
			<div className="container mx-auto flex h-full flex-1 flex-col gap-4 overflow-y-auto px-4">{children}</div>
		</>
	);
}
