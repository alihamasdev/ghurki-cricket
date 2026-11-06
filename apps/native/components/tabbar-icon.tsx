import FontAwesome from "@expo/vector-icons/FontAwesome";
import { type ColorValue } from "react-native";

type FontAwesomeProps = React.ComponentProps<typeof FontAwesome>;

export const TabBarIcon = ({ color, ...props }: { name: FontAwesomeProps["name"]; color?: ColorValue }) => {
	return <FontAwesome size={24} style={{ marginBottom: -3 }} color={color as string} {...props} />;
};
