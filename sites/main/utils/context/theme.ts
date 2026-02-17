import { createContext } from "react";

export type Theme = "light" | "dark" | null;

type ThemeState = {
    theme: Theme;
};

type ThemeActions = {
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
};

type ThemeStore = ThemeState & ThemeActions;

export const ThemeContext = createContext<ThemeStore>({
    theme: "light",
    toggleTheme: () => undefined,
    setTheme: (_theme: Theme) => undefined,
});
