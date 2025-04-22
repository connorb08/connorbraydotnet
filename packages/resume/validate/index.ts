import type { ValidateFunction } from "ajv";
import type { IResumeData } from "#models";
import { Resume as ResumeValidation } from "./validate.js";

const ValidateResumeFunction =
	ResumeValidation as ValidateFunction<IResumeData>;

type ValidationOk = {
	ok: true;
	error: undefined;
};

type ValidationError = {
	ok: false;
	error: string;
};

export type ValidationResponse = ValidationOk | ValidationError;

export type ResumeValidationHandler<T = unknown> = (
	data: T,
) => ValidationResponse | Promise<ValidationResponse>;

const ValidateResume: ResumeValidationHandler = <T>(data: T) => {
	const res = ValidateResumeFunction(data);
	if (res) {
		return {
			ok: true,
		};
	}
	return {
		ok: false,
		error: ValidateResumeFunction.errors?.[0]?.message ?? "Error Validating",
	};
};

export { ValidateResume };
export { ValidateResume as default };
