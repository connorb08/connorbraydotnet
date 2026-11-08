import { FullscreenContext } from "./context/fullscreen";
import { ThemeContext } from "./context/theme";
import { useContext } from "react";
export const useFullscreen = () => useContext(FullscreenContext);
export const useTheme = () => useContext(ThemeContext);
