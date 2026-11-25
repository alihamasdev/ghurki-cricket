import { useColorScheme as useRNColorScheme } from "react-native";

export function useColorScheme() {
	const systemColorScheme = useRNColorScheme();
	const colorScheme: "light" | "dark" = systemColorScheme === "dark" ? "dark" : "light";

	return {
		colorScheme,
		isDarkColorScheme: colorScheme === "dark",
		setColorScheme: () => {
			// Color scheme is managed by the system in bare mode
			console.warn("setColorScheme is not available in bare mode. Color scheme is managed by the system.");
		},
		toggleColorScheme: () => {
			// Color scheme is managed by the system in bare mode
			console.warn("toggleColorScheme is not available in bare mode. Color scheme is managed by the system.");
		},
	};
}
