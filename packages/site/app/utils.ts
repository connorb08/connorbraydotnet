import { useEffect, useState } from "react";

export function usePromise<T>(promise: Promise<T>, defaultValue: T) {
	const [data, setData] = useState<T>(defaultValue);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		setLoading(true);
		promise
			.then((result) => {
				setData(result);
				setLoading(false);
			})
			.catch((err) => {
				setError(err);
				setLoading(false);
			});
	}, [promise]);

	return { data, error, loading } as {
		data: T;
		error: Error | null;
		loading: boolean;
	};
}
