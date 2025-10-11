import { createContext, type PropsWithChildren, useState } from "react";
import { useFetcher } from "react-router";
import { toggleTheme as themeToggle } from "#utils/state/controllers";
import type { ContextProviderProps, IGlobalContext } from "./types";

export const GlobalContext = createContext<IGlobalContext>({
	rootRef: { current: null },
	toggleFullscreen: () => undefined,
	toggleTheme: () => undefined,
	theme: "light",
	fullscreen: false,
});

export const ContextProvider = ({
	children,
	rootRef,
	fullscreen,
	theme,
}: PropsWithChildren<ContextProviderProps>) => {
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
