import type { ValidateFunction } from "ajv";
import type { Resume, ValidationHandler } from "#types";

import { Resume as ResumeValidation } from "../../generated/index.js";

const ValidateResumeFunction = ResumeValidation as ValidateFunction<Resume>;

// todo: fix validation impl
const ValidateResume: ValidationHandler<Resume> = <T>(data: T | unknown) => {
	const res = ValidateResumeFunction(data);
	// const res = true;
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
