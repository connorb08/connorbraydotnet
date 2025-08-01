import type { ValidateFunction } from "ajv";
import type { Resume, ValidationHandler } from "#types";
import { Resume as ResumeValidation } from "../../validator/index.js";

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
		errors: ValidateResumeFunction.errors?.map(
			(val) => val.message || "Unknown Error",
		) ?? ["Unknown Error Validating"],
	};
};

export { ValidateResume };
