type ErrorResult = {
	error: string;
	data?: unknown | undefined;
};

type SuccessResult<T> = {
	data: T;
	error?: undefined;
};

export type Result<T> = ErrorResult | SuccessResult<T>;
export function ErrorResult<T>(error: string): Result<T> {
	return { error };
}
export function SuccessResult<T>(data: T): Result<T> {
	return { data };
}
