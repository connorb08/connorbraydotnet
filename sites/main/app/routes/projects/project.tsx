import type { LoaderFunctionArgs } from "react-router";
import { NavLink, redirect } from "react-router";
import { ProjectDetail } from "../../../components/project";
import { getProjectBySlug } from "../../../data/projects";
import type { Route } from "./+types/project";

// Loader function to get project data
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

export default function ProjectDetailPage({
	loaderData,
}: Route.ComponentProps) {
	const { project } = loaderData;
	return (
		<div>
			<div
				style={{
					padding: "1rem 2rem",
				}}
			>
				<NavLink
					to="/projects"
					viewTransition
					style={{
						color: "var(--md-sys-color-primary, #6750a4)",
						textDecoration: "none",
						fontSize: "0.875rem",
						fontWeight: "500",
					}}
				>
					← Back to Projects
				</NavLink>
			</div>

			<ProjectDetail
				project={project}
				technologies={project.technologies}
				repositoryUrl={project.repositoryUrl}
				liveUrl={project.liveUrl}
				images={project.images}
				challenges={project.challenges}
				solutions={project.solutions}
				features={project.features}
			/>
		</div>
	);
}
