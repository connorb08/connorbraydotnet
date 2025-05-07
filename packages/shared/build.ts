import { join as joinPath } from "node:path";
import { rm } from "node:fs/promises";
import { Biome, Distribution } from "@biomejs/js-api";
import Ajv, { _ } from "ajv";
import { _Code } from "ajv/dist/compile/codegen/code";
import standaloneCode from "ajv/dist/standalone";
import addFormats from "ajv-formats";
import { ResumeSchema } from "#schemas";
import {
	type CompilerOptions,
	ScriptTarget,
	transpileDeclaration,
} from "typescript";

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
	distribution: Distribution.NODE,
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

const outDir = joinPath(import.meta.dir, "./validator");
const filePath = joinPath(outDir, "./index.js");
const declarationFilePath = joinPath(outDir, "./index.d.ts");

await rm(outDir, { recursive: true, force: true });
const declarationOutput = (async () => {
	const compilerOptions = {
		strict: true,
		target: ScriptTarget.ESNext,
		declaration: true,
		emitDeclarationOnly: true,
		allowJs: true,
	} satisfies CompilerOptions;
	return transpileDeclaration(lintedCode, {
		compilerOptions,
	}).outputText;
})();

await Promise.all([
	Bun.write(filePath, lintedCode),
	Bun.write(declarationFilePath, await declarationOutput),
]);
