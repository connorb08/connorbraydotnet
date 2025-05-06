import path from "node:path";
import { Biome, Distribution } from "@biomejs/js-api";
import Ajv, { _ } from "ajv";
import { _Code } from "ajv/dist/compile/codegen/code";
import standaloneCode from "ajv/dist/standalone";
import addFormats from "ajv-formats";
import { ResumeSchema } from "#schemas";

const ajv = new Ajv({
	strict: true,
	allErrors: true,
	messages: true,
	code: { source: true, esm: true },
	schemas: [ResumeSchema],
});
addFormats(ajv);

ajv.addKeyword({
	keyword: "isNotEmpty",
	type: "string",
	// biome-ignore lint/suspicious/noExplicitAny: allow any
	validate: (schema: any, data: any) =>
		typeof data === "string" && data.trim() !== "",
	code: (cxt) => {
		const { data, schema } = cxt;
		cxt.fail(_`typeof ${data} === "string" && ${data}.trim() === ""`);
	},
	errors: "full",
});

const moduleCode = standaloneCode(ajv);

const biome = await Biome.create({
	distribution: Distribution.NODE, // Or BUNDLER / WEB depending on the distribution package you've installed
});

const formatted = biome.formatContent(moduleCode, {
	filePath: "example.js",
});

const formattedCode = formatted.content;

const linted = biome.lintContent(formattedCode, {
	filePath: "example.js",
	fixFileMode: "SafeAndUnsafeFixes",
});

const lintedCode = linted.content;

const outDir = path.join(import.meta.dir, "./validators");
const filePath = path.join(outDir, "./validate.js");

await Bun.write(filePath, lintedCode);
