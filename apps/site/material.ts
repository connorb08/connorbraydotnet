import {
	argbFromHex,
	hexFromArgb,
	themeFromSourceColor,
} from "@material/material-color-utilities";

const seed = "#409ab9";

// Simple demonstration of HCT.
const color = argbFromHex(seed);
const theme = themeFromSourceColor(color);
const { dark: darkTheme, light: lightTheme } = theme.schemes;

const lightThemeObject = lightTheme.toJSON();
const darkThemeObject = darkTheme.toJSON();

let cssString = ".light {\n";

for (const [key, value] of Object.entries(lightThemeObject)) {
	const hexValue = hexFromArgb(value);
	const cssLineValue = `--md-sys-color-${key.replace(/_/g, "-")}: ${hexValue};`;
	cssString += `\t${cssLineValue}\n`;
}
cssString += "}\n\n.dark {\n";

for (const [key, value] of Object.entries(darkThemeObject)) {
	const hexValue = hexFromArgb(value);
	const cssLineValue = `--md-sys-color-${key.replace(/_/g, "-")}: ${hexValue};`;
	cssString += `\t${cssLineValue}\n`;
}

cssString += "}\n";

console.log(cssString);
