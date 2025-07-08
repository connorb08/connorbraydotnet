import { build } from "bun";

await build({
	entrypoints: ["src/index.ts"],
	target: "node",
	external: ["playwright"],
	minify: true,
	outdir: "dist",
	format: "esm",
});
