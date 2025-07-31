import { createContext } from "react";

// import { createContext } from "react";

// export type SiteSettings = {
// 	theme: "light" | "dark";
// 	fullscreen: boolean;
// 	showTerminal: boolean;
// };

// type RootContext = {
// 	rootRef: React.RefObject<HTMLHtmlElement | null>;
// 	settings: SiteSetting;

// };

// export const RootContext = createContext<RootContext>({
// 	rootRef: { current: null },
// 	settings: {
// 		theme: "light",
// 		fullscreen: false,
// 		showTerminal: true,
// 	},
// 	updateSettings: () => {},
// });

export type SiteSettings = {
	fullscreen: boolean;
	showTerminal: boolean;
};

type SettingsContext = {
	settings: SiteSettings;
	setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
	toggleFullscreen: () => void;
};

type RootContext = {
	rootRef: React.RefObject<HTMLHtmlElement | null>;
};

export const GlobalContext = createContext<RootContext>({
	rootRef: { current: null },
});

export const SettingsContext = createContext<SettingsContext>({
	settings: {
		fullscreen: false,
		showTerminal: true,
	},
	setSettings: () => {},
	toggleFullscreen: () => {},
});
