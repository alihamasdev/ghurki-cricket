import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 3000,
		host: true,
		proxy: {
			"^/players/.*\\.webp$": {
				target: process.env.VITE_SERVER_URL,
				changeOrigin: true,
			},
			"^/api/.*": {
				target: process.env.VITE_SERVER_URL,
				changeOrigin: true,
			},
			"^/og": {
				target: process.env.VITE_SERVER_URL,
				changeOrigin: true,
			},
		},
	},
	resolve: {
		tsconfigPaths: true,
	},
	plugins: [
		tailwindcss(),
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		react(),
		{
			name: "google-analytics",
			apply: "build",
			transformIndexHtml() {
				return [
					{
						tag: "script",
						injectTo: "head",
						attrs: { async: true, src: "https://www.googletagmanager.com/gtag/js?id=G-M5LYMCJYDX" },
					},
					{
						tag: "script",
						injectTo: "head",
						children:
							'window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag("js", new Date());\ngtag("config", "G-M5LYMCJYDX");',
					},
				];
			},
		},
	],
});
