import { ValidResume } from "shared/test-data";
import About from "#components/About";
import type { Route } from "./+types/about";

export const loader = async () => {
	const project_data = fetch("https://api.connorbray.net/api/projects").then(
		(res) => res.json(),
	);
	const employment_data = fetch(
		"https://api.connorbray.net/api/employment",
	).then((res) => res.json());
	const education_data = fetch("https://api.connorbray.net/api/education").then(
		(res) => res.json(),
	);

	const result = await Promise.all([employment_data, education_data]);
	return {
		employment_data: result[0],
		education_data: result[1],
		projects: project_data,
	};
};

export default function ({ loaderData }: Route.ComponentProps) {
	const data = ValidResume();
	return <About data={data} />;
}
