import { build } from "esbuild";

await build({
	entryPoints: ["src/index.ts"],
	target: ["esnext", "node22"],
	external: ["playwright"],
	bundle: true,
	minify: true,
	platform: "node",
	outdir: "dist",
	format: "esm",
});
