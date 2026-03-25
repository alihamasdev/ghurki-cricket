import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import oxlintPlugin from "vite-plugin-oxlint";

// oxlint-disable no-default-export
export default defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [nitro(), tailwindcss(), tanstackStart(), viteReact(), oxlintPlugin({ path: "src" })]
});
