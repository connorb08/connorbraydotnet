type ValidationOk = {
	ok: true;
	errors: undefined;
};

type ValidationError = {
	ok: false;
	errors: string[];
};

export type ValidationResponse = ValidationOk | ValidationError;

export type ValidationHandler<T = unknown> = (
	data: T,
) => ValidationResponse | Promise<ValidationResponse>;
