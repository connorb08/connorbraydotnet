import { useContext } from "react";
import { GlobalContext } from "../state";

export const useFullscreen = () => {
    const { fullscreen, toggleFullscreen } = useContext(GlobalContext);
    return { fullscreen, toggleFullscreen };
}