import { useContext } from "react";
import { IconButton } from "#components/ui/buttons";
import { toggleTheme } from "#utils";
import { GlobalContext } from "#utils/context";

export function ThemeToggle() {
	const { rootRef } = useContext(GlobalContext);
	return <IconButton icon={"gear"} onClick={() => toggleTheme(rootRef)} />;
}
