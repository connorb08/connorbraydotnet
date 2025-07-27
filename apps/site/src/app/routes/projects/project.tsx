import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
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
			{/* Back navigation */}
			<div
				style={{
					padding: "1rem 2rem",
					borderBottom:
						"1px solid var(--md-sys-color-outline-variant, #cac4d0)",
				}}
			>
				<a
					href="/projects"
					style={{
						color: "var(--md-sys-color-primary, #6750a4)",
						textDecoration: "none",
						fontSize: "0.875rem",
						fontWeight: "500",
					}}
				>
					← Back to Projects
				</a>
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
				timeline={project.timeline}
				teamSize={project.teamSize}
				role={project.role}
				status={project.status}
			/>
		</div>
	);
}
