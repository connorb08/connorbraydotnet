import type { ValidateFunction } from "ajv";
import type { Resume, ValidationHandler } from "#types";
// biome-ignore lint/nursery/noTsIgnore: allow ts-ignore here, conditionally present file
// @ts-ignore generated file, no types - doesn't exist before build
import { Resume as ResumeValidation } from "../../generated/index.js";

const ValidateResumeFunction = ResumeValidation as ValidateFunction<Resume>;

const ValidateResume: ValidationHandler = <T>(data: T) => {
	const res = ValidateResumeFunction(data);
	if (res === true) {
		return {
			ok: true,
		};
	}
	return {
		ok: false,
		errors: ValidateResumeFunction.errors?.map((val) => val.message || "Unknown Error") ?? [
			"Unknown Error Validating",
		],
	};
};

export { ValidateResume };
