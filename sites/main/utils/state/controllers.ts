import type { Dispatch, RefObject, SetStateAction } from "react";

export async function toggleTheme(rootRef: RefObject<HTMLHtmlElement | null>, setTheme: Dispatch<SetStateAction<"light" | "dark">>) {
    const root = rootRef.current;
    if (!root) {
        console.warn("Root element not found for theme toggle.");
        return;
    }
    // Add a class to trigger the transition
    root.toggleAttribute("data-theme-transition", true);
    setTimeout(() => {
        root.toggleAttribute("data-theme-transition", false);
    }, 250);
    // Toggle the theme classes
    root.setAttribute("data-theme", root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    const theme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    setTheme(theme);
}