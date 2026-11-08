import type { Theme } from "#context/theme";
import type { PropsWithChildren } from "react";
import { ThemeContext } from "#context/theme";
import { useCallback, useMemo, useState } from "react";
import { useFetcher } from "react-router";

export const ThemeProvider = ({
	theme,
	children,
}: PropsWithChildren<{ theme: Theme }>) => {
	const { submit } = useFetcher();
	const [currentTheme, setCurrentTheme] = useState(theme);

	const setTheme = useCallback(
		(newTheme: Theme) => {
			submit({ theme: newTheme }, { method: "post", action: "/_session" });
			setCurrentTheme(newTheme);
		},
		[submit],
	);

	const toggleTheme = useCallback(() => {
		setTheme(currentTheme === "light" ? "dark" : "light");
	}, [currentTheme, setTheme]);

	const value = useMemo(
		() => ({ theme: currentTheme, setTheme, toggleTheme }),
		[currentTheme, setTheme, toggleTheme],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
