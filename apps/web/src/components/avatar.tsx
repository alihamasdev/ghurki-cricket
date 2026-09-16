import { Avatar, AvatarImage, AvatarFallback } from "@ghurki-cricket/ui/components/avatar";
import { ShieldIcon, UserIcon } from "lucide-react";

type AvatarProps = React.ComponentProps<typeof Avatar> & {
	name: string;
	src: string | null;
};

export function PlayerAvatar({ name, src, ...props }: AvatarProps) {
	return (
		<Avatar {...props}>
			{src && <AvatarImage src={src} alt={name} />}
			<AvatarFallback className="size-1/2" render={<UserIcon />} />
		</Avatar>
	);
}

export function TeamAvatar({ name, src, ...props }: AvatarProps) {
	return (
		<Avatar {...props}>
			{src && <AvatarImage src={src} alt={name} />}
			<AvatarFallback className="size-1/2" render={<ShieldIcon />} />
		</Avatar>
	);
}
