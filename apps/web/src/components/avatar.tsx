import { Avatar, AvatarImage, AvatarFallback } from "@ghurki-cricket/ui/components/avatar";
import { ShieldIcon, UserIcon } from "lucide-react";

type PlayerAvatarProps = React.ComponentProps<typeof Avatar> & {
	name: string;
	src: string;
};

export function PlayerAvatar({ name, src, ...props }: PlayerAvatarProps) {
	return (
		<Avatar {...props}>
			<AvatarImage src={src} alt={name} />
			<AvatarFallback className="size-1/2" render={<UserIcon />} />
		</Avatar>
	);
}

export function TeamAvatar({ ...props }: React.ComponentProps<typeof Avatar>) {
	return (
		<Avatar {...props}>
			<AvatarFallback className="size-1/2" render={<ShieldIcon />} />
		</Avatar>
	);
}
