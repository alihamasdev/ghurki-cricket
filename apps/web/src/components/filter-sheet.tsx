import { Button } from "@ghurki-cricket/ui/components/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@ghurki-cricket/ui/components/sheet";
import { type LucideIcon } from "lucide-react";

type FilterSheetProps = React.ComponentProps<typeof Sheet> & {
	title: string;
	icon: LucideIcon;
	value: string | number;
	children?: React.ReactNode;
	triggerProps?: React.ComponentProps<typeof Button>;
};

export function FilterSheet({ title, icon: Icon, value, triggerProps, children, ...props }: FilterSheetProps) {
	return (
		<Sheet {...props}>
			<SheetTrigger
				render={
					<Button variant="outline" {...triggerProps}>
						<Icon />
						{value}
					</Button>
				}
			/>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>{title}</SheetTitle>
				</SheetHeader>
				{children}
			</SheetContent>
		</Sheet>
	);
}
