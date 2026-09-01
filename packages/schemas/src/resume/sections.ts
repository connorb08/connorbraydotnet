import { array, type infer as inferType, literal, object, string, union } from "zod";

const Education = object({
	school: string(),
	degree: string(),
	about: string().array(),
	location: string().optional(),
	startDate: string().optional(),
	endDate: string().optional(),
});

const EducationSection = object({
	title: literal("Education"),
	items: Education.array(),
});

const Experience = object({
	company: string(),
	title: string(),
	about: string().array(),
	startDate: string(),
	location: string().optional(),
	endDate: string().optional(),
});

const ExperienceSection = object({
	title: literal("Experience"),
	items: Experience.array(),
});

const Project = object({
	name: string(),
	description: string(),
	about: string().array(),
	link: string().optional(),
});

const ProjectSection = object({
	title: literal("Projects"),
	items: Project.array(),
});

export const Sections = array(
	union([EducationSection, ExperienceSection, ProjectSection]),
);

export type ResumeEducationData = inferType<typeof EducationSection>;
export type ResumeExperienceData = inferType<typeof ExperienceSection>;
export type ResumeProjectData = inferType<typeof ProjectSection>;
export type ResumeSection = inferType<typeof Sections>[number];
