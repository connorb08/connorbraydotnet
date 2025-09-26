import { type PropsWithChildren, useEffect, useState } from "react";
import { toggleTheme as themeToggle } from "#utils";
import { toggleFullscreen as fullscreenToggle } from "#utils/controller";
import { GlobalContext, type IGlobalContext } from "./index";

interface Props {
	rootRef: React.RefObject<HTMLHtmlElement | null>;
}

export const ContextProvider = ({ children, rootRef }: PropsWithChildren<Props>) => {
	const [theme, setTheme] = useState<"light" | "dark">("light");

	const toggleFullscreen = () => fullscreenToggle(rootRef);
	const toggleTheme = () => themeToggle(rootRef, setTheme);

	useEffect(() => {
		const storedTheme = window.localStorage.getItem("theme");
		if (storedTheme === "dark" || storedTheme === "light") {
			setTheme(storedTheme);
		}
	}, []);

	const contextValue = {
		rootRef,
		toggleFullscreen,
		toggleTheme,
		theme,
	} satisfies IGlobalContext;

	return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
};
