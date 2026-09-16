import { Avatar, AvatarImage, AvatarFallback } from "@ghurki-cricket/ui/components/avatar";
import { ShieldIcon, UserIcon } from "lucide-react";

const baseUrl = "https://stats.alihamas.pk/players";

type AvatarProps = React.ComponentProps<typeof Avatar> & {
	name: string;
};

export function PlayerAvatar({ name, ...props }: AvatarProps) {
	const src = `${baseUrl}/${name.toLowerCase()}.png`;
	return (
		<Avatar size="sm" {...props} data-name={src}>
			{src && <AvatarImage src={src} alt={name} />}
			<AvatarFallback className="size-1/2" render={<UserIcon />} />
		</Avatar>
	);
}

export function PlayerCell({ name, ...props }: AvatarProps) {
	return (
		<div className="flex items-center gap-2">
			<PlayerAvatar name={name} {...props} />
			<span className="font-medium">{name}</span>
		</div>
	);
}

export function TeamAvatar({ ...props }: AvatarProps) {
	return (
		<Avatar {...props}>
			<AvatarFallback className="size-1/2" render={<ShieldIcon />} />
		</Avatar>
	);
}
