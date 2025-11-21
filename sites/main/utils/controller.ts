import { createContext } from "react";

type RootContext = {
	rootRef: React.RefObject<HTMLHtmlElement | null>;
};

export const RootContext = createContext<RootContext>({
	rootRef: { current: null },
});

export const toggleFullscreen = (rootRef: React.RefObject<HTMLHtmlElement | null>) => {
	const fullscreen = rootRef.current?.toggleAttribute("data-fullscreen");
	localStorage.setItem("fullscreen", fullscreen?.toString() || "false");
};
