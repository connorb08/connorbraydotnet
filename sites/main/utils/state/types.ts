export type StateData = {
	theme: "light" | "dark" | null;
	fullscreen: boolean;
};

export type SessionFlashData = {
	error: string;
};

export interface ContextProviderProps extends StateData {
	rootRef: React.RefObject<HTMLHtmlElement | null>;
}

export interface IGlobalContext extends ContextProviderProps {
	toggleFullscreen: () => void;
	toggleTheme: () => void;
}
