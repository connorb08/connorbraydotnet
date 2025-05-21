import { usePromise } from "app/utils";
import type { Resume } from "shared";
import { ValidResume } from "shared/test-data";
import About from "#components/About";
import { EmptyResume } from "../../../shared/src/types/resume/test-data";
import type { Route } from "./+types/about";

export async function loader() {
	// const project_data = fetch("https://api.connorbray.net/api/projects").then(
	// 	(res) => res.json(),
	// );
	// const employment_data = fetch(
	// 	"https://api.connorbray.net/api/employment",
	// ).then((res) => res.json());
	// const education_data = fetch("https://api.connorbray.net/api/education").then(
	// 	(res) => res.json(),
	// );
	// const result = await Promise.all([employment_data, education_data]);
	// return {
	// 	employment_data: result[0],
	// 	education_data: result[1],
	// 	projects: project_data,
	// };
	const resumeData: Promise<Resume> = new Promise((resolve) => {
		setTimeout(() => resolve(ValidResume()), 1000);
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
