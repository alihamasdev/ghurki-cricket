import { env } from "@ghurki-cricket/env/web";

function getOgBaseUrl(): string {
	const serverUrl = env.VITE_SERVER_URL;

	if (serverUrl.startsWith("http://") || serverUrl.startsWith("https://")) {
		return serverUrl;
	}

	if (typeof window !== "undefined") {
		return `${window.location.origin}${serverUrl}`;
	}

	return `https://stats.alihamas.pk${serverUrl}`;
}

export function seo(title?: string, description?: string) {
	const siteName = "Ghurki Cricket";
	const defaultDescription = "Comprehensive cricket stats, match scoring, and player management for Ghurki Cricket.";
	const desc = description?.trim() || defaultDescription;

	const fullTitle = title?.trim() ? (title.includes(siteName) ? title.trim() : `${title.trim()} | ${siteName}`) : siteName;

	const imageTitle = title?.trim() || siteName;
	const ogBaseUrl = getOgBaseUrl();
	const normalizedOgBase = ogBaseUrl.endsWith("/api") ? ogBaseUrl : `${ogBaseUrl}/api`;
	const ogImageUrl = `${normalizedOgBase}/og?title=${encodeURIComponent(imageTitle)}&description=${encodeURIComponent(desc)}`;

	return {
		meta: [
			{ title: fullTitle },
			{ name: "description", content: desc },
			{ property: "og:site_name", content: siteName },
			{ property: "og:type", content: "website" },
			{ property: "og:title", content: fullTitle },
			{ property: "og:description", content: desc },
			{ property: "og:image", content: ogImageUrl },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: fullTitle },
			{ name: "twitter:description", content: desc },
			{ name: "twitter:image", content: ogImageUrl },
		],
	};
}
