import { type PropsWithChildren, useState } from "react";
import { useFetcher } from "react-router";
import type { SessionData } from "#app/sessions.server";
import { toggleTheme as themeToggle } from "#utils";
import { GlobalContext, type IGlobalContext } from "./index";

interface Props {
	rootRef: React.RefObject<HTMLHtmlElement | null>;
	fullscreen: SessionData["fullscreen"];
	theme: SessionData["theme"];
}

export const ContextProvider = ({
	children,
	rootRef,
	fullscreen,
	theme,
}: PropsWithChildren<Props>) => {
	const fetcher = useFetcher();
	const [themeState, setThemeState] = useState<"light" | "dark">(theme);
	const [fullscreenState, setFullscreenState] = useState<boolean>(fullscreen);

	const toggleFullscreen = () => {
		const newFullscreen = !fullscreenState;
		setFullscreenState(newFullscreen);
		fetcher.submit({ fullscreen: newFullscreen }, { method: "post", action: "/_session" });
	};

	const toggleTheme = () => {
		const newTheme = themeState === "light" ? "dark" : "light";
		themeToggle(rootRef, setThemeState);
		fetcher.submit({ theme: newTheme }, { method: "post", action: "/_session" });
	};

	const contextValue = {
		rootRef,
		toggleFullscreen,
		toggleTheme,
		theme: themeState,
		fullscreen: fullscreenState,
	} satisfies IGlobalContext;

	return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
};
