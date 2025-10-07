// // Set theme
// const theme = (() => {
// 	const localStorageTheme = localStorage?.getItem("theme") ?? "";
// 	if (["dark", "light"].includes(localStorageTheme)) {
// 		return localStorageTheme;
// 	}
// 	if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
// 		return "dark";
// 	}
// 	return "light";
// })();
// document.documentElement.setAttribute("data-theme", theme);
// // document.documentElement.classList.toggle("dark", theme === "dark");

// // Set fullscreen
// const fullScreen = localStorage?.getItem("fullscreen") === "true";
// document.documentElement.toggleAttribute("data-fullscreen", fullScreen);
