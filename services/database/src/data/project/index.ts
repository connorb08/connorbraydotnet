import type { Kysely } from "kysely";
import { v7 } from "uuid";
import type { Database, NewProject, Project } from "../../models";
import { ErrorResult, type Result, SuccessResult } from "../../utils";

export async function CreateNewProject(
	db: Kysely<Database>,
	data: NewProject,
): Promise<Result<Project>> {
	try {
		const [project] = await db
			.insertInto("project")
			.values({ id: v7(), name: data.name, description: data.description })
			.returning(["name", "description"])
			.execute();
		if (!project) {
			return ErrorResult("Failed to create project");
		}
		return SuccessResult(project);
	} catch (error) {
		console.error("Error creating project:", error);
		return ErrorResult(
			error instanceof Error ? error.message : "Unknown error",
		);
	}
}

export async function GetAllProjects(
	db: Kysely<Database>,
): Promise<Result<Project[]>> {
	try {
		const projects = await db
			.selectFrom("project")
			.select(["id", "name", "description"])
			.execute();
		return SuccessResult(projects);
	} catch (error) {
		console.error("Error fetching projects:", error);
		return ErrorResult(
			error instanceof Error ? error.message : "Unknown error",
		);
	}
}
