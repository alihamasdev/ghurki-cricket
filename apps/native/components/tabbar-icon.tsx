import FontAwesome from "@expo/vector-icons/FontAwesome";
import { type ColorValue } from "react-native";

type FontAwesomeProps = React.ComponentProps<typeof FontAwesome>;

export const TabBarIcon = ({ color, ...props }: { name: FontAwesomeProps["name"]; color?: ColorValue }) => {
	// SAFETY: React Navigation passes theme color strings, which are valid FontAwesome color props.
	return <FontAwesome size={24} style={{ marginBottom: -3 }} color={color as string} {...props} />;
};
