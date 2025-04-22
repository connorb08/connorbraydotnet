import type { JSONSchemaType } from "ajv";
import { AboutMeSchema, type IAboutMeData } from "./about";
import { EducationSchema, type IEducationData } from "./education";
import { CareerSchema, type ICareerData } from "./career";
import { ProjectSchema, type Project } from "./projects";

export interface IResumeData {
	name: string;
	about: IAboutMeData;
	education: IEducationData[];
	career: ICareerData[];
	projects: Project[];
}

export const ResumeSchema: JSONSchemaType<IResumeData> = {
	$id: "Resume",
	type: "object",
	properties: {
		name: { type: "string" },
		about: AboutMeSchema,
		education: EducationSchema,
		career: CareerSchema,
		projects: ProjectSchema,
	},
	required: ["name", "about", "education", "career", "projects"],
	additionalProperties: false,
};
