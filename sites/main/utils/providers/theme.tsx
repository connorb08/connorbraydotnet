import { type PropsWithChildren, useState } from "react";
import { useFetcher } from "react-router";
import { type Theme, ThemeContext } from "#utils/context/theme";

export const ThemeProvider = ({ theme, children }: PropsWithChildren<{ theme: Theme }>) => {
	const fetcher = useFetcher();
	const [currentTheme, setCurrentTheme] = useState(theme);

	const toggleTheme = () => {
		const nextTheme = currentTheme === "light" ? "dark" : "light";
		fetcher.submit({ theme: nextTheme }, { method: "post", action: "/_session" });
		setCurrentTheme(nextTheme);
	};

	const setTheme = (newTheme: Theme) => {
		fetcher.submit({ theme: newTheme }, { method: "post", action: "/_session" });
		setCurrentTheme(newTheme);
	};

	return (
		<ThemeContext.Provider
			value={{
				theme: currentTheme,
				setTheme,
				toggleTheme,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
};
