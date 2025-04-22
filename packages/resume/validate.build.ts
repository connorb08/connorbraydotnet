import path from "node:path";
import Ajv, { _ } from "ajv";
import standaloneCode from "ajv/dist/standalone";
import addFormats from "ajv-formats";
import { ResumeSchema } from "#models";
import { _Code } from "ajv/dist/compile/codegen/code";

const ajv = new Ajv({
	schemas: [ResumeSchema],
	code: { source: true, esm: true },
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

const validationCode = standaloneCode(ajv);

const outDir = path.join(import.meta.dir, "./validate");
const filePath = path.join(outDir, "./validate.js");

await Bun.write(filePath, validationCode);
