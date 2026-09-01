import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { ProjectDetail } from "../../../components/project/project-detail";
import { getProjectBySlug } from "../../../data/projects";
import type { Route } from "./+types/project";

export async function loader({ params }: LoaderFunctionArgs) {
	const { projectId } = params;

	if (!projectId) {
		return redirect("/projects");
	}

	const project = getProjectBySlug(projectId);

	if (!project) {
		return redirect("/projects");
	}

	return { project };
}

export default function ProjectDetailPage({ loaderData }: Route.ComponentProps) {
	const { project } = loaderData;
	return (
		<ProjectDetail
			project={project}
			technologies={project.technologies}
			repositoryUrl={project.repositoryUrl}
			liveUrl={project.liveUrl}
			challenges={project.challenges}
			solutions={project.solutions}
			features={project.features}
		/>
	);
}
