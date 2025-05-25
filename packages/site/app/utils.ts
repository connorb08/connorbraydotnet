import { useEffect, useState } from "react";

type SuccessState<T> = {
	data: T;
	error: null;
	loading: false;
};
type FailureState<T> = {
	data: T;
	error: Error;
	loading: false;
};
type LoadingState<T> = {
	data: T;
	error: null;
	loading: true;
};

type StateData<T> = SuccessState<T> | FailureState<T> | LoadingState<T>;

export function usePromise<T>(promise: Promise<T> | T, defaultValue: T) {
	const [state, setState] = useState<StateData<T>>({
		data: defaultValue,
		error: null,
		loading: true,
	});

	useEffect(() => {
		if (promise instanceof Promise) {
			promise
				.then((result) => {
					setState({ data: result, error: null, loading: false });
				})
				.catch((err) => {
					setState({ data: defaultValue, error: err, loading: false });
				});
		} else {
			setState({ data: promise, error: null, loading: false });
		}
	}, [promise, defaultValue]);

	return state;
}
