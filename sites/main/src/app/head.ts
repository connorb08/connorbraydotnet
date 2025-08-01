export default () => {
	const theme = (() => {
		const localStorageTheme = localStorage?.getItem("theme") ?? "";
		if (["dark", "light"].includes(localStorageTheme)) {
			return localStorageTheme;
		}
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			return "dark";
		}
		return "light";
	})();

	if (theme === "light") {
		document.documentElement.classList.remove("dark");
		document.documentElement.classList.add("light");
	} else {
		document.documentElement.classList.remove("light");
		document.documentElement.classList.add("dark");
	}

	window.localStorage?.setItem("theme", theme);
};
