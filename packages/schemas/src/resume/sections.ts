import { literal, object, string } from "zod";

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

export const Sections = object([EducationSection, ExperienceSection, ProjectSection]).array();
