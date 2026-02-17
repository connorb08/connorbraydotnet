import { useContext } from "react";
import { FullscreenContext } from "./context/fullscreen";
import { ThemeContext } from "./context/theme";
export const useFullscreen = () => useContext(FullscreenContext);
export const useTheme = () => useContext(ThemeContext);
