import { env } from "@ghurki-cricket/env/web";
import { Avatar, AvatarFallback, AvatarImage } from "@ghurki-cricket/ui/components/avatar";
import { ShieldIcon, UserIcon } from "lucide-react";

export type AvatarVariant = "avatars" | "profiles";

export function getPlayerImageUrl(name: string, variant: AvatarVariant = "avatars"): string | null {
	if (!name || !env.VITE_STORAGE_URL) return null;
	return `${env.VITE_STORAGE_URL}/${variant}/${encodeURIComponent(name.trim().toLowerCase())}.webp`;
}

export type PlayerAvatarProps = React.ComponentProps<typeof Avatar> & {
	name: string;
	variant?: AvatarVariant;
};

export function PlayerAvatar({ name, variant = "avatars", ...props }: PlayerAvatarProps) {
	const src = getPlayerImageUrl(name, variant);
	return (
		<Avatar size="sm" {...props} data-name={src}>
			{src && <AvatarImage src={src} alt={name} />}
			<AvatarFallback className="size-1/2" render={<UserIcon />} />
		</Avatar>
	);
}

export function PlayerCell({ name, variant = "avatars", ...props }: PlayerAvatarProps) {
	return (
		<div className="flex items-center gap-2">
			<PlayerAvatar name={name} variant={variant} {...props} />
			<span className="font-medium">{name}</span>
		</div>
	);
}

export type TeamAvatarProps = React.ComponentProps<typeof Avatar> & {
	name?: string;
};

export function TeamAvatar({ name: _name, ...props }: TeamAvatarProps) {
	return (
		<Avatar {...props}>
			<AvatarFallback className="size-1/2" render={<ShieldIcon />} />
		</Avatar>
	);
}
