import { createContext } from "react";
import { toggleFullscreen } from "./controller";

type IGlobalContext = {
	rootRef: React.RefObject<HTMLHtmlElement | null>;
	toggleFullscreen: typeof toggleFullscreen;
};

export const GlobalContext = createContext<IGlobalContext>({
	rootRef: { current: null },
	toggleFullscreen,
});
