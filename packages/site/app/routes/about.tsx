import { usePromise } from "app/utils";
import type { Resume } from "shared";
import { ValidResume } from "shared/test-data";
import About from "#components/About";
import { EmptyResume } from "../../../shared/src/types/resume/test-data";
import type { Route } from "./+types/about";

export async function loader() {
	const resumeData: Promise<Resume> = new Promise((resolve) => {
		setTimeout(() => resolve(ValidResume()), 1000);
	});
	return { resumeData };
}

/**
 * On initial page load, fetch the data from the server and cache it in sessionStorage.
 *
 * On subsequent page loads, read the data from sessionStorage and return it.
 *
 * This function is used to improve performance by reducing the number of requests made to the server.
 */
export async function clientLoader({
	request,
	serverLoader,
}: Route.ClientLoaderArgs): Promise<{ resumeData: Promise<Resume> | Resume }> {
	// Check if the data is already cached in sessionStorage
	const cacheKey = request.url;
	const cachedData = sessionStorage.getItem(cacheKey);

	// If the data is cached, return it
	if (cachedData) {
		return { resumeData: JSON.parse(cachedData) };
	}

	// If the data is not cached, fetch it from the server
	const { resumeData } = await serverLoader();

	// Cache the data in sessionStorage for future use
	resumeData.then((data) => {
		sessionStorage.setItem(cacheKey, JSON.stringify(data));
	});

	return { resumeData };
}

export default function ({ loaderData }: Route.ComponentProps) {
	const { data, error, loading } = usePromise<Resume>(
		loaderData.resumeData,
		EmptyResume,
	);

	return <About data={data} loading={loading} />;
}
