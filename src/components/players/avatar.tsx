import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps extends React.ComponentProps<typeof Avatar> {
	name: string;
	area?: number;
}

export function PlayerAvatar({ name, area = 32, className, ...props }: PlayerAvatarProps) {
	return (
		<Avatar className={cn("size-8", className)} {...props}>
			<AvatarImage src={`/players/${name.toLowerCase()}.png`} width={area} height={area} alt={name} />
			<AvatarFallback asChild>
				<img src="/players/default.png" width={area} height={area} alt={name} />
			</AvatarFallback>
		</Avatar>
	);
}
