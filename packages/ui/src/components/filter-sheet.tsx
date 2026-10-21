import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { Button } from "@ghurki-cricket/ui/components/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@ghurki-cricket/ui/components/sheet";
import { createContext, useCallback, useContext, useState } from "react";

type FilterSheetContextType = {
	open: boolean;
	setOpen: (open: boolean) => void;
	closeSheet: () => void;
};

const FilterSheetContext = createContext<FilterSheetContextType | null>(null);

export function useFilterSheet(): FilterSheetContextType {
	const context = useContext(FilterSheetContext);
	if (!context) {
		return {
			open: false,
			setOpen: () => {},
			closeSheet: () => {},
		};
	}
	return context;
}

type FilterSheetProps = Omit<SheetPrimitive.Root.Props, "open" | "onOpenChange"> & {
	title: string;
	icon?: React.ComponentType<{ className?: string } | any>;
	value: string | number;
	children?: React.ReactNode;
	triggerProps?: React.ComponentProps<typeof Button>;
};

export function FilterSheet({ title, icon: Icon, value, triggerProps, children, ...props }: FilterSheetProps) {
	const [open, setOpen] = useState(false);

	const closeSheet = useCallback(() => {
		setOpen(false);
	}, []);

	return (
		<FilterSheetContext.Provider value={{ open, setOpen, closeSheet }}>
			<Sheet open={open} onOpenChange={setOpen} {...props}>
				<SheetTrigger
					render={
						<Button variant="outline" {...triggerProps}>
							{Icon && <Icon />}
							{value}
						</Button>
					}
				/>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>{title}</SheetTitle>
					</SheetHeader>
					{open && <div className="flex-1 overflow-y-auto">{children}</div>}
				</SheetContent>
			</Sheet>
		</FilterSheetContext.Provider>
	);
}
