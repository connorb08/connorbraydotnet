import type { Resume } from "shared";
import { EmptyResume, ValidResume } from "shared";
import { About } from "#pages/about";
import { usePromise } from "#utils";
import type { Route } from "./+types/about";

export async function loader({ context }: Route.LoaderArgs) {
	const _context = context;
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
	const {
		data,
		error,
		loading: _,
	} = usePromise<Resume>(loaderData.resumeData, EmptyResume);

	if (error) {
		console.error("Error loading resume data:", error);
	}

	return <About resume={data} />;
}
