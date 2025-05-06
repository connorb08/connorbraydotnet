// biome-ignore-all lint/suspicious/noExplicitAny: ignore any
import type { ValidateFunction, ErrorObject } from "ajv";

const ResumeMock: ValidateFunction = Object.assign(
	function validate(this: any, data: any): data is unknown {
		return false;
	},
	{
		errors: null as null | ErrorObject[],
		evaluated: undefined,
		schema: { type: "object" },
		schemaEnv: {
			baseId: "",
			schema: { type: "object" },
			root: null as any,
			meta: false,
			$async: false,
			refs: {},
			dynamicAnchors: {},
		} as any,
		source: undefined,
	},
);

// Set up circular reference after creation
(ResumeMock.schemaEnv as any).root = ResumeMock.schemaEnv;

export default ResumeMock;
export { ResumeMock as Resume };
