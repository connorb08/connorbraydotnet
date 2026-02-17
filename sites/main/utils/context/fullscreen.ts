import { createContext } from "react";

type FullscreenState = {
    fullscreen: boolean;
};

type FullscreenActions = {
    toggleFullscreen: () => void;
};

type FullscreenStore = FullscreenState & FullscreenActions;

export const FullscreenContext = createContext<FullscreenStore>({
    fullscreen: false,
    toggleFullscreen: () => undefined,
});
