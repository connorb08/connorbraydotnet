import { type RefObject, useEffect, useState } from "react";
import config from "#config";

type SuccessState<T> = {
	data: T;
	error: undefined;
	loading: false;
};
type FailureState<T> = {
	data: T;
	error: Error;
	loading: false;
};
type LoadingState<T> = {
	data: Promise<T> | T;
	error: undefined;
	loading: true;
};

type StateData<T> = SuccessState<T> | FailureState<T> | LoadingState<T>;

/**
 * A custom hook that handles the state of a promise.
 * It returns an object with data, error, and loading properties.
 *
 * @param promise - The promise to handle, or a value to use directly.
 * @param defaultValue - The default value to use while loading.
 * @returns An object containing the data, error, and loading state.
 */
export function usePromise<T>(
	promise: Promise<T> | T,
	defaultValue: T,
): StateData<T> {
	const [state, setState] = useState<StateData<T>>({
		data: defaultValue,
		error: undefined,
		loading: true,
	});

	useEffect(() => {
		if (promise instanceof Promise) {
			promise
				.then((result) => {
					setState({ data: result, error: undefined, loading: false });
				})
				.catch((err) => {
					setState({ data: defaultValue, error: err, loading: false });
				});
		} else {
			setState({ data: promise, error: undefined, loading: false });
		}
	}, [promise, defaultValue]);

	return state;
}

export async function toggleTheme(rootRef: RefObject<HTMLHtmlElement | null>) {
	const root = rootRef.current;
	if (!root) {
		console.warn("Root element not found for theme toggle.");
		return;
	}

	// Add a class to trigger the transition
	root.classList.add("color-transition");
	setTimeout(() => {
		root.classList.remove("color-transition");
	}, 250);

	// Toggle the theme classes
	root.classList.toggle("dark");
	root.classList.toggle("light");

	// Store the theme in localStorage
	window.localStorage.setItem(
		"theme",
		root.classList.contains("dark") ? "dark" : "light",
	);
}

export const CONTENT_PATH = (path: string) => `${config.contentUrl}${path}`;
