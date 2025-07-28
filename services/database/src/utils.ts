type ErrorResult = {
	error: string;
	data?: undefined;
};

type SuccessResult<T> = {
	data: T;
	error?: undefined;
};

export type Result<T> = SuccessResult<T> | ErrorResult;

export function Err<T>(error: string): Result<T> {
	return { error };
}
export function Ok<T>(data: T): Result<T> {
	return { data };
}
