import { createContext } from "react";

export type IGlobalContext = {
	rootRef: React.RefObject<HTMLHtmlElement | null>;
	toggleFullscreen: () => void;
	toggleTheme: () => void;
	theme: "light" | "dark" | undefined;
};

export const GlobalContext = createContext<IGlobalContext>({
	rootRef: { current: null },
	toggleFullscreen: () => undefined,
	toggleTheme: () => undefined,
	theme: undefined,
});
